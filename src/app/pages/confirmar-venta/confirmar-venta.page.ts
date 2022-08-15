import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VentaInterface } from 'src/app/models/venta/venta';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
import { MenuController, LoadingController } from '@ionic/angular';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import jsPDF from 'jspdf';
import { formatDate } from '@angular/common';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels, QrcodeComponent } from '@techiediaries/ngx-qrcode';
import { ContadorDeSerieInterface } from '../../models/serie';
import { redondeoDecimal } from '../../global/funciones-globales';
import { ItemDeVentaInterface } from '../../models/venta/item-de-venta';
import { MontoALetras } from 'src/app/global/monto-a-letra';
import { GENERAL_CONFIG } from '../../../config/generalConfig';
import { GlobalService } from '../../global/global.service';
import { DataBaseService } from '../../services/data-base.service';
import { GLOBAL_FACTOR_ICBPER } from 'src/config/otherConfig';
import { DECIMAL_REGEXP_PATTERN } from 'src/app/global/validadores';
import { Observable, timer } from 'rxjs';


@Component({
  selector: 'app-confirmar-venta',
  templateUrl: './confirmar-venta.page.html',
  styleUrls: ['./confirmar-venta.page.scss'],
})
export class ConfirmarVentaPage implements OnInit {

  /** AFI */
  ICBP_PER = GLOBAL_FACTOR_ICBPER;

  sede = this.storage.datosAdmi.sede.toLocaleLowerCase();
  formPago: FormGroup;

  // Datos de la empresa
  RUC = GENERAL_CONFIG.datosEmpresa.ruc;
  LogoEmpresa = GENERAL_CONFIG.datosEmpresa.logo;
  nombreEmpresa = GENERAL_CONFIG.datosEmpresa.razon_social;
  dominioFac = GENERAL_CONFIG.datosEmpresa.url;

  tipoComprobante = 'boleta';
  serieComprobante: string;
  tipoPago = 'efectivo';

  // Variables para la interaccion con el usuario
  vuelto = 0;
  montoEntrante = 0;
  descuentoDeVentaMonto = 0;
  descuentoDeVentaPorcentaje = 0;

  // Variables generales para el calculo de montos de la venta
  importeNeto = 0.0;
  importeTotal = 0.0;
  importeBase = 0.0;
  igvImporteBase = 0.0;
  importeDescuento = 0.0;

  // Variable para almacenar la venta actual
  venta: VentaInterface;

  bolsa = false;
  cantidadBolsa = 0;

  loading;
  elementType = NgxQrcodeElementTypes.CANVAS;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  valueQR;
  @ViewChild('qr') qr: QrcodeComponent;

  generandoPago: boolean;

  numeroWhatsapp: string;
  imprimir = true;
  @ViewChild('focus', {static: false}) search: any;

  constructor(
    private confirmarVentaServ: ConfirmarVentaService,
    private menuCtrl: MenuController,
    private router: Router,
    private dataApi: DataBaseService,
    private storage: StorageService,
    private loadingController: LoadingController,
    private servGlobal: GlobalService
  ) {
    this.formPago = this.createFormPago();
  }

  ionViewDidEnter() {
    timer(500).subscribe(() => {
      console.log('Set Focus', this.search);
      this.search.setFocus();
    });
  }

  focuss(ev){
    console.log(ev);
    ev.target.select();
  }

  ionViewWillEnter() {
    this.comprobarSerieComprobante();
    this.generandoPago = false;
    this.venta = this.confirmarVentaServ.getVentaService();
    console.log(this.venta);
    if (!Object.entries(this.venta).length) {
      this.router.navigate(['/punto-venta']);
    } else {
      if (Object.entries(this.venta).length !== 0){
        this.importeNeto = this.venta.montoNeto;
        this.importeTotal = this.importeNeto;
        this.importeBase = this.importeTotal / 1.18;
        this.igvImporteBase = this.importeTotal - this.importeBase;

      } else {
        this.importeNeto = 0;
        this.importeTotal = 0;
        this.importeBase = 0;
        this.igvImporteBase = 0;
      }
      this.ActualizarMontoEntrante(this.importeTotal);
      this.calcularVuelto();
    }
  }

  comprobarSerieComprobante() {
    if (this.storage.datosAdmi) {
      if (this.tipoComprobante === 'boleta') {
        this.serieComprobante = GENERAL_CONFIG.sedes[this.sede].caja1.boleta; // FALTA QUE LA CAJA SEA DINAMICA
        console.log('SERIE: ', this.serieComprobante);
      } else if (this.tipoComprobante === 'factura') {
        this.serieComprobante = GENERAL_CONFIG.sedes[this.sede].caja1.factura; // FALTA QUE LA CAJA SEA DINAMICA
        console.log('SERIE: ', this.serieComprobante);
      } else if (this.tipoComprobante === 'n. venta') {
        this.serieComprobante = GENERAL_CONFIG.sedes[this.sede].caja1.notaVenta; // FALTA QUE LA CAJA SEA DINAMICA
        console.log('SERIE: ', this.serieComprobante);
      }
    } else {
      this.servGlobal.presentToast('Por favor vuelva a iniciar sesion y pruebe la sede de usuario');
    }
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.formPago.setControl('montoIngreso',
      new FormControl(this.importeTotal, [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)])
    );
  }

  createFormPago(){
    return new FormGroup({
      montoIngreso: new FormControl(0, [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      descuentoMonto: new FormControl('', [Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      descuentoPorcentaje: new FormControl('', [Validators.pattern(DECIMAL_REGEXP_PATTERN)])
    });
  }

  get montoIngreso() { return this.formPago.get('montoIngreso'); }
  get descuentoMonto() { return this.formPago.get('descuentoMonto'); }
  get descuentoPorcentaje() { return this.formPago.get('descuentoPorcentaje'); }

  resetFormPago() {
    this.formPago.reset();
  }

  realizarDescuentoMonto(){
    this.descuentoDeVentaPorcentaje = null;
    console.log('Realizar descuento');
    this.descuentoDeVentaMonto =  parseFloat(this.formPago.value.descuentoMonto);

    if (isNaN(this.descuentoDeVentaMonto)) {
      this.descuentoDeVentaMonto = 0;
    }
    this.importeDescuento = this.descuentoDeVentaMonto;
    this.importeTotal = this.importeNeto - this.importeDescuento;

    this.importeBase = this.importeTotal / 1.18;
    this.igvImporteBase = this.importeTotal - this.importeBase;

    // modificar el campo: montoEntrante
    this.ActualizarMontoEntrante(this.importeTotal);
    this.calcularVuelto();
  }

  realizarDescuentoPorcentaje(){
    this.descuentoDeVentaMonto = null;
    console.log('Realizar descuento %');
    this.descuentoDeVentaPorcentaje =  parseFloat(this.formPago.value.descuentoPorcentaje);

    if (isNaN(this.descuentoDeVentaPorcentaje)) {
      this.descuentoDeVentaPorcentaje = 0;
    }
    this.importeDescuento = (this.importeNeto * this.descuentoDeVentaPorcentaje / 100);

    this.importeTotal = this.importeNeto - this.importeDescuento;
    this.importeBase = this.importeTotal / 1.18;
    this.igvImporteBase = this.importeTotal - this.importeBase;

    this.ActualizarMontoEntrante(this.importeTotal);
    this.calcularVuelto();
  }

  ActualizarMontoEntrante(monto: number){
    console.log('%cMONTOOOOO', 'color:white; background-color:black', monto);
    this.formPago.setControl('montoIngreso',
    new FormControl('', [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)])); // monto.toFixed(2) en ''
  }

  calcularVuelto(){
    this.montoEntrante = parseFloat(this.formPago.value.montoIngreso);
    if (isNaN(this.montoEntrante)){
      this.montoEntrante = 0;
    }
    this.vuelto =  this.montoEntrante - redondeoDecimal(this.importeTotal, 2);
    this.vuelto = redondeoDecimal(this.vuelto, 2);
  }


  sumarAMontoEntrante(montoAdd: number){
    console.log(montoAdd);
    this.montoEntrante =  montoAdd;
    this.formPago.setControl('montoIngreso',
    new FormControl(this.montoEntrante, [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]));
    this.calcularVuelto();
  }

  ponerMontoExactoYCalularVuelto(){
    this.montoEntrante = this.importeTotal;
    this.formPago.setControl('montoIngreso',
    new FormControl(this.montoEntrante.toFixed(2), [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]));
    this.calcularVuelto();
  }

  cancelarVenta(){
    console.log('cancelar venta');
    this.confirmarVentaServ.resetService();
    this.resetFormPago();
    this.bolsa = false;
    this.router.navigate(['/punto-venta']);
  }

  SeleccionarComprobante(comprobante: string){
    console.log('comprobnte:', comprobante);
    this.tipoComprobante = comprobante;

    if (comprobante === 'factura'){
      if (this.venta.cliente.tipoDoc === 'dni') {
        this.servGlobal.presentToast('No puedes emitir comprobante a cliente sin RUC', {color: 'danger'});
        this.tipoComprobante = 'boleta';
      } else {
        this.comprobarSerieComprobante();
      }
    } else if (comprobante === 'boleta'){
      this.comprobarSerieComprobante();
    }else if (comprobante === 'n. venta'){
      this.comprobarSerieComprobante();
    }
  }

  cambiarPrecioUnitarioSiLoRequiere(listaItemsDeVenta: ItemDeVentaInterface[]): ItemDeVentaInterface[]{
    for (const itemdeventa of listaItemsDeVenta) {
      if ( itemdeventa.totalxprod !== itemdeventa.montoNeto){
        itemdeventa.precio = itemdeventa.totalxprod / itemdeventa.cantidad;
      }
    }
    return listaItemsDeVenta;
  }

  async generarPago(){
    if (this.importeTotal > 0) {
      this.generandoPago = true;
      await this.presentLoading('Generando Venta');
      this.venta.tipoComprobante = this.tipoComprobante;
      this.venta.serieComprobante = this.serieComprobante;
      this.venta.vendedor = this.storage.datosAdmi;
      this.venta.bolsa = this.bolsa;
      this.venta.cantidadBolsa = this.cantidadBolsa;
      this.venta.tipoPago = this.tipoPago;
      this.venta.montoNeto = this.importeNeto;
      this.venta.descuentoVenta = this.importeDescuento;
      this.venta.totalPagarVenta = this.importeTotal;
      this.venta.igv = this.igvImporteBase;
      this.venta.montoBase = this.importeBase;
      this.venta.estadoVenta = 'registrado';
      this.venta.cantidadBolsa = this.cantidadBolsa;
      this.venta.listaItemsDeVenta = this.cambiarPrecioUnitarioSiLoRequiere(this.venta.listaItemsDeVenta);
      this.venta.montoPagado = this.montoEntrante;
      console.log('Se generó el pago');
      this.obtenerCorrelacionComprobante().then((numero: ContadorDeSerieInterface[]) => {
          this.venta.numeroComprobante = (numero[0].correlacion + 1).toString();
          const fecha = formatDate(new Date(), 'dd-MM-yyyy', 'en');
          this.generarQR(this.RUC +  '|'  + '03' +  '|' + this.serieComprobante +  '|' + this.venta.numeroComprobante +  '|' +
          this.venta.totalPagarVenta +  '|' + fecha +  '|' + this.venta.cliente.numDoc);
          this.dataApi.confirmarVenta(this.venta, this.storage.datosAdmi.sede).then(data => {
            for (const itemVenta of this.venta.listaItemsDeVenta) {
              // tslint:disable-next-line: max-line-length
              this.dataApi.decrementarStockProducto(itemVenta.producto.id, this.storage.datosAdmi.sede, itemVenta.cantidad * itemVenta.factor);
            }
            this.dataApi.actualizarCorrelacion(numero[0].id, this.storage.datosAdmi.sede, numero[0].correlacion + 1);
            this.resetFormPago();
            this.cantidadBolsa = 0;
            this.bolsa = false;
            this.tipoPago = 'efectivo';
            this.confirmarVentaServ.resetService();
            this.router.navigate(['/punto-venta']);
            if (this.imprimir) {
              this.generarComprobante();
            }
            if (this.numeroWhatsapp) {
              const url = GENERAL_CONFIG.datosEmpresa.url + '/print/' + this.sede.toLocaleLowerCase() + '/'
              + fecha.split(' ', 1) + '/' + data;
              window.open('https://api.whatsapp.com/send/?phone=51' + this.numeroWhatsapp + '&text=%20Hola,%20puedes%20visualizar%20tu%20comprobante%20electronico%20aqui:%20' + url  + '&app_absent=0', '_blank');
            }
            console.log('guardado', data);
            this.loading.dismiss();
            this.servGlobal.presentToast('Venta exitosa', {color: 'success'});
          });
      }).catch(error => {
        this.servGlobal.presentToast('Ocurrió un error al obetener la correlacion: ' + error, {color: 'danger'});
      });
    } else {
      this.servGlobal.presentToast('El TOTAL tiene que ser mayor a s/. 0.00', {color: 'danger'});
    }
  }

  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: 10000
    });
    await this.loading.present();
  }

  changeBolsa() {
    console.log('bolsa', this.bolsa);
    if (this.bolsa === true) {
      this.cantidadBolsa = 1;
      this.servGlobal.presentToast('Bolsa agregada');
      this.importeTotal = this.importeTotal + this.ICBP_PER;
    } else {
      this.servGlobal.presentToast('Bolsa quitada');
      this.importeTotal = this.importeTotal - (this.ICBP_PER * this.cantidadBolsa);
      this.cantidadBolsa = 0;
    }
    this.ponerMontoExactoYCalularVuelto();
  }

  seleccionTipoPago(tipo: string) {
    this.tipoPago = tipo;
    if (this.tipoPago === 'tarjeta' || this.tipoPago === 'appDigital') {
      this.ponerMontoExactoYCalularVuelto();
    }
  }

  getImage() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/jpeg').toString();
    return imageData;
    }

  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }

  generarComprobante() {
    const qr = this.getImage();
    console.log(qr);
    console.log(this.tipoComprobante);
    switch (this.tipoComprobante) {
      case 'boleta': {
        let index = 41;
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 7 + 30 + 12]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
        doc.setFontSize(5.5);
        doc.setFont('helvetica');
        // doc.text(this.nombreEmpresa, 22.5, 12, {align: 'center'});
        if (this.nombreEmpresa.length > 28) {
          doc.text(this.nombreEmpresa.toUpperCase().slice(0, 27), 22.5, 12, {align: 'center'});
          doc.text(this.nombreEmpresa.toUpperCase().slice(27, -1), 22.5, 14, {align: 'center'});
        } else {
          doc.text(this.nombreEmpresa.toUpperCase(), 2, 12);
        }
        doc.setFontSize(6);
        doc.setFont('helvetica');
        // doc.text(this.nombreEmpresa, 22.5, 12, {align: 'center'});
        doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.direccionCorta, 22.5, 17, {align: 'center'});
        doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.referencia, 22.5, 19, {align: 'center'});
        doc.text('Telefono: ' + GENERAL_CONFIG.sedes[this.sede].telefono, 22.5, 22, {align: 'center'});
        doc.text('Ruc: ' + this.RUC, 22.5, 24, {align: 'center'});
        doc.text('Boleta de Venta electrónica', 22.5, 27, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text(this.venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - this.venta.numeroComprobante.length)) + this.venta.numeroComprobante, 22.5, 29, {align: 'center'});
        doc.text(this.venta.cliente.tipoDoc.toUpperCase() + ': ' + this.venta.cliente.numDoc , 22.5, 31, {align: 'center'});
        doc.text( 'Cliente: ', 22.5, 33, {align: 'center'});
        if (this.venta.cliente.nombre.length  >= 40){
          const prue = this.venta.cliente.nombre.split(' ');
          let contador = 0;
          let count = 0;
          let restante = '';
          let primero = '';
          for (const iterator of prue) {
            count++;
            contador = contador + iterator.length + 1;
            if (contador >= 40) {
              restante = restante + ' ' + iterator;
            }else {
              if (count === 1) {
              primero =  iterator;
              }
              else{
              primero = primero + ' ' + iterator;
              }
            }
            console.log(count);
          }
          doc.text(this.convertirMayuscula(primero), 22.5, 35, {align: 'center'});
          doc.text(this.convertirMayuscula(restante), 22.5, 37, {align: 'center'});
          console.log('1' + primero, '2' + restante);
          }else {
          doc.text((this.convertirMayuscula(this.venta.cliente.nombre)), 22.5, 35, {align: 'center'});
          }
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 39, {align: 'center'});
        doc.setFontSize(5);

        for (const c of this.venta.listaItemsDeVenta) {
          doc.text( '__________________________________________', 22.5, index, {align: 'center'});
          index = index + 3;
          if (c.producto.nombre.length > 40) {
            doc.text(c.producto.nombre.toUpperCase().slice(0, 38), 2, index);
            doc.text(c.producto.nombre.toUpperCase().slice(38, -1), 2, index + 2);
            index = index + 2;
          } else {
            doc.text(c.producto.nombre.toUpperCase(), 2, index);
          }
          // tslint:disable-next-line:max-line-length
          doc.text( c.cantidad.toFixed(2) + '    ' + c.medida + '      ' + c.precio.toFixed(2), 2, index + 3, {align: 'justify'});
          doc.text((c.totalxprod).toFixed(2), 43, index + 3, {align: 'right'} );

          doc.text( '__________________________________________', 22.5, index +  3, {align: 'center'});
          index = index + 3;
        }
        doc.text('SubTotal: S/ ', 35, index + 3, {align: 'right'});
        doc.text(this.venta.montoNeto.toFixed(2), 43, index + 3, {align: 'right'});
        doc.text('Descuento: S/ ', 35, index + 5, {align: 'right'});
        doc.text(this.venta.descuentoVenta.toFixed(2), 43, index + 5, {align: 'right'});
        index = index + 4;
        if ( this.venta.cantidadBolsa > 0){
          doc.text(`ICBP(${this.ICBP_PER.toFixed(2)}): S/`, 35, index + 3, {align: 'right'});
          doc.text((this.venta.cantidadBolsa * this.ICBP_PER).toFixed(2), 43, index + 3, {align: 'right'});
        }
        doc.text('Importe Total: S/ ', 35, index + 5, {align: 'right'});
        doc.text(this.venta.totalPagarVenta.toFixed(2), 43, index + 5, {align: 'right'});
        doc.text('Vuelto: S/ ', 35, index + 7, {align: 'right'});
        doc.text(this.vuelto.toFixed(2), 43, index + 7, {align: 'right'});
        doc.setFontSize(3.5);
        doc.text(MontoALetras(this.venta.totalPagarVenta), 2, index + 9, {align: 'left'});
        doc.setFontSize(4);
        doc.text('Vendedor: ' + this.convertirMayuscula(this.venta.vendedor.nombre), 2, index + 11, {align: 'left'});
        doc.text('Forma de Pago: ' + this.convertirMayuscula(this.venta.tipoPago) , 2, index + 13, {align: 'left'});
        doc.addImage(qr, 'JPEG', 15, index + 14, 15, 15);
        index = index + 30;
        doc.setFontSize(4);
        doc.text('Representación impresa del comprobante de pago\r de Venta Electrónica, esta puede ser consultada en\r' + this.dominioFac + '/buscar\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
        doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
        doc.autoPrint();
        // window.open(doc.output('bloburl').toString(), '_blank');
        // const canvas = document.getElementById('pdf');
        // IMPRIME EN LA MISMA PAGINA
        const hiddFrame = document.createElement('iframe');
        hiddFrame.style.position = 'fixed';
        hiddFrame.style.width = '1px';
        hiddFrame.style.height = '1px';
        hiddFrame.style.opacity = '0.01';
        const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
        if (isSafari) {
          // fallback in safari
          hiddFrame.onload = () => {
            try {
              hiddFrame.contentWindow.document.execCommand('print', false, null);
            } catch (e) {
              hiddFrame.contentWindow.print();
            }
          };
        }
        hiddFrame.src = doc.output('bloburl').toString();
        document.body.appendChild(hiddFrame);
        break;
      }
      case'factura': {
        console.log('es una facura');
        // tslint:disable-next-line:no-shadowed-variable
        let index = 41;
        // tslint:disable-next-line:no-shadowed-variable
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 19 + 25 + 12]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
        doc.setFontSize(5.5);
        doc.setFont('helvetica');
        // doc.text(this.nombreEmpresa, 22.5, 12, {align: 'center'});
        if (this.nombreEmpresa.length > 28) {
          doc.text(this.nombreEmpresa.toUpperCase().slice(0, 27), 22.5, 12, {align: 'center'});
          doc.text(this.nombreEmpresa.toUpperCase().slice(27, -1), 22.5, 14, {align: 'center'});
        } else {
          doc.text(this.nombreEmpresa.toUpperCase(), 2, 12);
        }
        doc.setFontSize(6);
        doc.setFont('helvetica');
        doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.direccionCorta, 22.5, 17, {align: 'center'});
        doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.referencia, 22.5, 19, {align: 'center'});
        doc.text('Telefono: ' + GENERAL_CONFIG.sedes[this.sede].telefono, 22.5, 22, {align: 'center'});
        doc.text('Ruc: ' + this.RUC, 22.5, 24, {align: 'center'});
        doc.text('Factura de Venta electrónica', 22.5, 27, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text(this.venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - this.venta.numeroComprobante.length)) + this.venta.numeroComprobante, 22.5, 29, {align: 'center'});
        doc.text(this.venta.cliente.tipoDoc.toUpperCase() + ': ' + + this.venta.cliente.numDoc , 22.5, 31, {align: 'center'});
        doc.text( 'Cliente:', 22.5, 33, {align: 'center'});
        if (this.venta.cliente.nombre.length  >= 40){
          const prue = this.venta.cliente.nombre.split(' ');
          let contador = 0;
          let count = 0;
          let restante = '';
          let primero = '';
          for (const iterator of prue) {
            count++;
            contador = contador + iterator.length + 1;
            if (contador >= 40) {
              restante = restante + ' ' + iterator;
            }else {
              if (count === 1) {
              primero =  iterator;
              }
              else{
              primero = primero + ' ' + iterator;
              }
            }
            console.log(count);
          }
          doc.text(this.convertirMayuscula(primero), 22.5, 35, {align: 'center'});
          doc.text(this.convertirMayuscula(restante), 22.5, 37, {align: 'center'});
          console.log('1' + primero, '2' + restante);
          }else {
          doc.text((this.convertirMayuscula(this.venta.cliente.nombre)), 22.5, 35, {align: 'center'});
          }
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 39, {align: 'center'});
        doc.setFontSize(5);

        for (const c of this.venta.listaItemsDeVenta) {
          doc.text( '__________________________________________', 22.5, index, {align: 'center'});
          index = index + 3;
          if (c.producto.nombre.length > 40) {
            doc.text(c.producto.nombre.toUpperCase().slice(0, 38), 2, index);
            doc.text(c.producto.nombre.toUpperCase().slice(38, -1), 2, index + 2);
            index = index + 2;
          } else {
            doc.text(c.producto.nombre.toUpperCase(), 2, index);
          }
          // tslint:disable-next-line:max-line-length
          doc.text( c.cantidad.toFixed(2) + '    ' + c.medida + '      ' + c.precio.toFixed(2), 2, index + 3, {align: 'justify'});
          doc.text((c.totalxprod).toFixed(2), 43, index + 3, {align: 'right'} );

          doc.text( '__________________________________________', 22.5, index +  3, {align: 'center'});
          index = index + 3;
        }
        doc.text('OP. GRAVADAS:', 2, index + 3, {align: 'left'});
        doc.text( (this.venta.totalPagarVenta / 1.18).toFixed(2), 43, index + 3, {align: 'right'});
        doc.text('OP. INAFECTA:', 2, index + 5, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 5, {align: 'right'});
        doc.text('OP. EXONERADA:', 2, index + 7, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 7, {align: 'right'});
        doc.text('OP. GRATUITA', 2, index + 9, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 9, {align: 'right'});
        doc.text('OP. EXPORTACIÓN', 2, index + 11, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 11, {align: 'right'});
        doc.text('DESCUENTO', 2, index + 13, {align: 'left'});
        doc.text( (this.venta.descuentoVenta).toFixed(2), 43, index + 13, {align: 'right'});
        doc.text('I.G.V. (18%)', 2, index + 15, {align: 'left'});
        doc.text( (this.calcularIGVincluido(this.venta.totalPagarVenta)).toFixed(2), 43, index + 15, {align: 'right'});
        doc.text('I.S.C.', 2, index + 17, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 17, {align: 'right'});
        if (this.venta.cantidadBolsa > 0){
          doc.text(`ICBP(${this.ICBP_PER.toFixed(2)}): S/`, 2, index + 19, {align: 'left'});
          doc.text( (this.venta.cantidadBolsa * this.ICBP_PER).toFixed(2), 43, index + 19, {align: 'right'});
        }
        doc.text( '__________________________________________', 22.5, index + 19, {align: 'center'});

        index = index + 19;
        doc.text('TOTAL IMPORTE:', 2, index + 3, {align: 'left'});
        doc.text('s/ ' + this.venta.totalPagarVenta.toFixed(2), 43, index + 3, {align: 'right'});
        doc.setFontSize(3);
        doc.text(MontoALetras(this.venta.totalPagarVenta), 2, index + 5, {align: 'left'});
        doc.setFontSize(4);
        doc.text('Vendedor: ' + this.convertirMayuscula(this.venta.vendedor.nombre), 2, index + 7, {align: 'left'});
        doc.text('Forma de Pago: ' + this.convertirMayuscula(this.venta.tipoPago) , 2, index + 9, {align: 'left'});


        doc.addImage(qr, 'JPEG', 15, index + 10, 15, 15);
        index = index + 25;
        doc.setFontSize(4);
        // tslint:disable-next-line:max-line-length
        doc.text('Representación impresa del comprobante de pago\r de Factura Electrónica, esta puede ser consultada en\r ' + this.dominioFac + '/buscar\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
        doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
        doc.autoPrint();
        // window.open(doc.output('bloburl').toString(), '_blank');
        // IMPRIME EN LA MISMA PAGINA
        const hiddFrame = document.createElement('iframe');
        hiddFrame.style.position = 'fixed';
        // "visibility: hidden" would trigger safety rules in some browsers like safari，
        // in which the iframe display in a pretty small size instead of hidden.
        // here is some little hack ~
        hiddFrame.style.width = '1px';
        hiddFrame.style.height = '1px';
        hiddFrame.style.opacity = '0.01';
        const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
        if (isSafari) {
          // fallback in safari
          hiddFrame.onload = () => {
            try {
              hiddFrame.contentWindow.document.execCommand('print', false, null);
            } catch (e) {
              hiddFrame.contentWindow.print();
            }
          };
        }
        hiddFrame.src = doc.output('bloburl').toString();
        document.body.appendChild(hiddFrame);
        break;
      }
      case 'n. venta': {
        // tslint:disable-next-line:no-shadowed-variable
        let index = 41;
        // tslint:disable-next-line:no-shadowed-variable
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 9 + 22]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
        doc.setFontSize(5.5);
        doc.setFont('helvetica');
        // doc.text(this.nombreEmpresa, 22.5, 12, {align: 'center'});
        if (this.nombreEmpresa.length > 28) {
          doc.text(this.nombreEmpresa.toUpperCase().slice(0, 27), 22.5, 12, {align: 'center'});
          doc.text(this.nombreEmpresa.toUpperCase().slice(27, -1), 22.5, 14, {align: 'center'});
        } else {
          doc.text(this.nombreEmpresa.toUpperCase(), 2, 12);
        }
        doc.setFontSize(6);
        doc.setFont('helvetica');
        // doc.text(this.nombreEmpresa, 22.5, 12, {align: 'center'});
        doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.direccionCorta, 22.5, 17, {align: 'center'});
        doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.referencia, 22.5, 19, {align: 'center'});
        doc.text('Telefono: ' + GENERAL_CONFIG.sedes[this.sede].telefono, 22.5, 22, {align: 'center'});
        doc.text('Ruc: ' + this.RUC, 22.5, 24, {align: 'center'});
        doc.text('Nota de Venta electrónica', 22.5, 27, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text(this.venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - this.venta.numeroComprobante.length)) + this.venta.numeroComprobante, 22.5, 29, {align: 'center'});
        doc.text(this.venta.cliente.tipoDoc.toUpperCase() + ': ' + this.venta.cliente.numDoc , 22.5, 31, {align: 'center'});
        doc.text( 'Cliente:', 22.5, 33, {align: 'center'});
        if (this.venta.cliente.nombre.length  >= 40){
          const prue = this.venta.cliente.nombre.split(' ');
          let contador = 0;
          let count = 0;
          let restante = '';
          let primero = '';
          for (const iterator of prue) {
            count++;
            contador = contador + iterator.length + 1;
            if (contador >= 40) {
              restante = restante + ' ' + iterator;
            }else {
              if (count === 1) {
              primero =  iterator;
              }
              else{
              primero = primero + ' ' + iterator;
              }
            }
            console.log(count);
          }
          doc.text(this.convertirMayuscula(primero), 22.5, 35, {align: 'center'});
          doc.text(this.convertirMayuscula(restante), 22.5, 37, {align: 'center'});
          console.log('1' + primero, '2' + restante);
          }else {
          doc.text((this.convertirMayuscula(this.venta.cliente.nombre)), 22.5, 35, {align: 'center'});
          }
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 39, {align: 'center'});
        doc.setFontSize(5);

        for (const c of this.venta.listaItemsDeVenta) {
          doc.text( '__________________________________________', 22.5, index, {align: 'center'});
          index = index + 3;
          if (c.producto.nombre.length > 40) {
            doc.text(c.producto.nombre.toUpperCase().slice(0, 38), 2, index);
            doc.text(c.producto.nombre.toUpperCase().slice(38, -1), 2, index + 2);
            index = index + 2;
          } else {
            doc.text(c.producto.nombre.toUpperCase(), 2, index);
          }
          // tslint:disable-next-line:max-line-length
          doc.text( c.cantidad.toFixed(2) + '    ' + c.medida + '      ' + c.precio.toFixed(2), 2, index + 3, {align: 'justify'});
          doc.text((c.totalxprod).toFixed(2), 43, index + 3, {align: 'right'} );

          doc.text( '__________________________________________', 22.5, index +  3, {align: 'center'});
          index = index + 3;
        }
        if (this.venta.bolsa) {
          console.log(this.venta.bolsa, this.venta.cantidadBolsa);
          doc.text('BOLSA PLASTICA ', 2, index + 3);
          // tslint:disable-next-line:max-line-length
          doc.text( this.venta.cantidadBolsa.toFixed(2) + '    ' + 'Unidad' + '      ' + (this.ICBP_PER).toFixed(2), 2, index + 5, {align: 'justify'});
          doc.text((this.venta.cantidadBolsa * this.ICBP_PER).toFixed(2), 43, index + 5, {align: 'right'} );
          doc.text( '__________________________________________', 22.5, index +  5, {align: 'center'});
          index = index + 5;

        }
        if (this.venta.descuentoVenta > 0) {
          doc.text('SubTotal: S/ ', 35, index + 3, {align: 'right'});
          doc.text((this.venta.montoNeto + (this.venta.cantidadBolsa * this.ICBP_PER)).toFixed(2), 43, index + 3, {align: 'right'});
          doc.text('Descuento: S/ ', 35, index + 5, {align: 'right'});
          doc.text(this.venta.descuentoVenta.toFixed(2), 43, index + 5, {align: 'right'});
          index = index + 4;
        }
        doc.text('Importe Total: S/ ', 35, index + 3, {align: 'right'});
        doc.text(this.venta.totalPagarVenta.toFixed(2), 43, index + 3, {align: 'right'});
        if (this.vuelto > 0) {
          doc.text('Vuelto: S/ ', 35, index + 5, {align: 'right'});
          doc.text(this.vuelto.toFixed(2), 43, index + 5, {align: 'right'});
        }
        doc.setFontSize(3.5);
        doc.text(MontoALetras(this.venta.totalPagarVenta), 2, index + 7, {align: 'left'});
        doc.setFontSize(4);
        doc.text('Vendedor: ' + this.convertirMayuscula(this.venta.vendedor.nombre), 2, index + 9, {align: 'left'});
        doc.text('Forma de Pago: ' + this.convertirMayuscula(this.venta.tipoPago) , 2, index + 11, {align: 'left'});

        doc.setFontSize(5);
        doc.text('GRACIAS POR SU PREFERENCIA', 22.5, index + 15, {align: 'center'}); // 13
        doc.text('DOCUMENTO NO VALIDO PARA SUNAT', 22.5, index + 17, {align: 'center'});
        doc.text('RECLAME SU COMPROBANTE', 22.5, index + 19, {align: 'center'});
        doc.text( '__________________________________________', 22.5, index + 20, {align: 'center'});
        index = index + 20;
        // doc.text('EL VETERINARIO TE RECUERDA:', 2, index + 3, {align: 'left'});
        // doc.text('-Desparasitar a tu mascota cada 2 meses', 2, index + 6, {align: 'left'});
        // doc.text('-Completar todas sus vacunas', 2, index + 8, {align: 'left'});
        // doc.text('-Cuida el aseo e higiene de tu engreido', 2, index + 10, {align: 'left'});

        doc.autoPrint();
        // window.open(doc.output('bloburl').toString(), '_blank');
        // IMPRIME EN LA MISMA PAGINA
        const hiddFrame = document.createElement('iframe');
        hiddFrame.style.position = 'fixed';
        // "visibility: hidden" would trigger safety rules in some browsers like safari，
        // in which the iframe display in a pretty small size instead of hidden.
        // here is some little hack ~
        hiddFrame.style.width = '1px';
        hiddFrame.style.height = '1px';
        hiddFrame.style.opacity = '0.01';
        const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);
        if (isSafari) {
          // fallback in safari
          hiddFrame.onload = () => {
            try {
              hiddFrame.contentWindow.document.execCommand('print', false, null);
            } catch (e) {
              hiddFrame.contentWindow.print();
            }
          };
        }
        hiddFrame.src = doc.output('bloburl').toString();
        document.body.appendChild(hiddFrame);
        break;
      }
    }
  }

  convertirMayuscula(letra: string) {
    return letra.charAt(0).toUpperCase() + letra.slice(1);
  }

  calcularIGVincluido(montoTotalPagar: number){
    const montoBase = montoTotalPagar / 1.18;
    return(montoTotalPagar - montoBase);
  }

  generarQR(value: string) {
    this.valueQR = value;
  }

  finalizarNotaVenta() {
    this.tipoComprobante = 'n. venta';
    this.comprobarSerieComprobante();
    this.generarPago();
  }

  obtenerCorrelacionComprobante() {
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.obtenerCorrelacionComprobante(this.serieComprobante, this.storage.datosAdmi.sede).subscribe(datos => {
        if (datos.length > 0) {
          resolve(datos);
        } else {
          reject(datos);
        }
      });
    });
    return promesa;
  }

  agregarBolsa() {
    this.cantidadBolsa++;
    this.importeTotal = this.importeTotal + this.ICBP_PER;
    this.ponerMontoExactoYCalularVuelto();
  }

  quitarBolsa() {
    if (this.cantidadBolsa > 1) {
      this.cantidadBolsa--;
      this.importeTotal = this.importeTotal - this.ICBP_PER;
    } else {
      this.servGlobal.presentToast('Minimo 0');
      this.bolsa = false;
    }
    this.ponerMontoExactoYCalularVuelto();
  }

  calcularPrecioTotalItemProducto(itemDeVenta: ItemDeVentaInterface){
    return itemDeVenta.totalxprod;
  }
}

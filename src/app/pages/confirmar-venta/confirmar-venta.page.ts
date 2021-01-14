import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VentaInterface } from 'src/app/models/venta/venta';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
// import { TestServiceService } from 'src/app/services/test-service.service';
import { MenuController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { ComprobantePage } from '../../modals/comprobante/comprobante.page';
import jsPDF from 'jspdf';
import { formatDate } from '@angular/common';

import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels, QrcodeComponent } from '@techiediaries/ngx-qrcode';
import { promise } from 'protractor';
import { error } from '@angular/compiler/src/util';
import { ContadorDeSerieInterface } from '../../models/serie';

import { redondeoDecimal } from '../../global/funciones-globales';
import { ItemDeVentaInterface } from '../../models/venta/item-de-venta';
import { MontoALetras } from 'src/app/global/monto-a-letra';

@Component({
  selector: 'app-confirmar-venta',
  templateUrl: './confirmar-venta.page.html',
  styleUrls: ['./confirmar-venta.page.scss'],
})
export class ConfirmarVentaPage implements OnInit {

  formPago: FormGroup;

  // Datos de la empresa
  RUC = '20601831032';
  LogoEmpresa = '../../../assets/img/TOOBY LOGO.png';

  // tslint:disable-next-line: no-inferrable-types
  tipoComprobante: string = 'boleta';
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
  constructor(
    private confirmarVentaServ: ConfirmarVentaService,
    private menuCtrl: MenuController,
    private router: Router,
    private dataApi: DbDataService,
    private storage: StorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
  ) {
    this.formPago = this.createFormPago();
  }

  ionViewWillEnter() {
    this.comprobarSerieComprobante();
    this.generandoPago = false;
    this.venta = this.confirmarVentaServ.getVentaService();
    console.log('Ventainterfaceeeeeeeeeeeeeeee', this.venta);
    if (isNullOrUndefined(this.venta)) {
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
      console.log('venta', this.venta);

      // this.formPago.setControl('montoIngreso',
      //   new FormControl(this.importeTotal, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')])
      // );
      this.ActualizarMontoEntrante(this.importeTotal);
      this.calcularVuelto();

    }
  }

  comprobarSerieComprobante() {
    if (this.storage.datosAdmi) {
      if (this.storage.datosAdmi.sede === 'Andahuaylas') {
        console.log('Andahuaylas');
        if (this.tipoComprobante === 'boleta') {
          this.serieComprobante  = 'B001';
        } else if (this.tipoComprobante === 'factura') {
          this.serieComprobante  = 'F001';
        } else if (this.tipoComprobante === 'n. venta') {
          this.serieComprobante = 'NV01';
        }
      } else if (this.storage.datosAdmi.sede === 'Abancay') {
        console.log('Abancay');
        if (this.tipoComprobante === 'boleta') {
          this.serieComprobante  = 'B002';
        } else if (this.tipoComprobante === 'factura') {
          this.serieComprobante  = 'F002';
        } else if (this.tipoComprobante === 'n. venta') {
          this.serieComprobante = 'NV02';
        }
      }
    } else {
      this.presentToast('Por favor vuelva a iniciar sesion y pruebe la sede de usuario');
    }
  }

  ngOnInit() {
    this.menuCtrl.enable(true);

    this.formPago.setControl('montoIngreso',
      new FormControl(this.importeTotal, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    // this.formPago.setControl('descuentoMonto',
    //   new FormControl(this.descuentoDeVentaMonto, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    // );

    // this.formPago.setControl('descuentoPorcentaje',
    //   new FormControl(this.descuentoDeVentaPorcentaje, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    // );

  }



  createFormPago(){
    return new FormGroup({
      montoIngreso: new FormControl(0, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuentoMonto: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuentoPorcentaje: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
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
    this.formPago.setControl('montoIngreso',
    new FormControl(monto.toFixed(2), [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
  }



  calcularVuelto(){
    this.montoEntrante = parseFloat(this.formPago.value.montoIngreso);
    if (isNaN(this.montoEntrante)){
      this.montoEntrante = 0;
    }

    // console.log('total con descuento', this.montoEntrante, redondeoDecimal(this.importeDescuento, 2));

    this.vuelto =  this.montoEntrante - redondeoDecimal(this.importeTotal, 2);
    this.vuelto = redondeoDecimal(this.vuelto, 2);

    // console.log(this.totalconDescuento, this.montoEntrante, this.vuelto);
  }


  sumarAMontoEntrante(montoAdd: number){
    console.log(montoAdd);
    this.montoEntrante =  montoAdd;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    this.calcularVuelto();
  }

  ponerMontoExactoYCalularVuelto(){
    this.montoEntrante = this.importeTotal;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante.toFixed(2), [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    this.calcularVuelto();
  }
  // ponerMontoExactoYCalcularVuelto(){
  //   this.montoEntrante = this.importeTotal;
  // tslint:disable-next-line:max-line-length
  // this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante.toFixed(2), [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
  //   this.calcularVuelto();
  // }



  cancelarVenta(){
    console.log('cancelar venta');
    this.confirmarVentaServ.cleanData();
    this.resetFormPago();
    this.bolsa = false;
    this.router.navigate(['/punto-venta', 'true']);
  }

  SeleccionarComprobante(comprobante: string){
    console.log('comprobnte:', comprobante);
    this.tipoComprobante = comprobante;

    if (comprobante === 'factura'){
      if (this.venta.cliente.tipoDoc === 'dni') {
        this.presentToast('No puedes emitir comprobante a cliente sin RUC');
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
        itemdeventa.producto.precio = itemdeventa.totalxprod / itemdeventa.cantidad;
      }
    }
    return listaItemsDeVenta;
  }

  generarPago(){
    this.generandoPago = true;
    this.presentLoading('Generando Venta');
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
      // if (numero[0].disponible) {
        this.dataApi.ActualizarEstadoCorrelacion(numero[0].id, this.storage.datosAdmi.sede, false);
        console.log(numero);
        console.log('numero de comprobante', this.tipoComprobante, numero[0].correlacion + 1);
        this.venta.numeroComprobante = (numero[0].correlacion + 1).toString();
        const fecha = formatDate(new Date(), 'dd-MM-yyyy', 'en');
        this.generarQR(this.RUC +  '|'  + '03' +  '|' + this.serieComprobante +  '|' + this.venta.numeroComprobante +  '|' +
        this.venta.totalPagarVenta +  '|' + fecha +  '|' + this.venta.cliente.numDoc);
        this.dataApi.confirmarVenta(this.venta, this.storage.datosAdmi.sede).then(data => {
          this.dataApi.ActualizarCorrelacion(numero[0].id, this.storage.datosAdmi.sede, numero[0].correlacion + 1);
          this.dataApi.ActualizarEstadoCorrelacion(numero[0].id, this.storage.datosAdmi.sede, true);
          this.resetFormPago();
          // this.tipoComprobante = 'boleta';
          this.cantidadBolsa = 0;
          this.bolsa = false;
          this.tipoPago = 'efectivo';
          this.router.navigate(['/punto-venta', 'true']);
          this.generarComprobante();
          console.log('guardado', data);
          this.loading.dismiss();
          this.presentToast('Venta exitosa');
        });
      // }
    // tslint:disable-next-line:no-shadowed-variable
    }).catch(error => {
      this.presentToast('Ocurrio un error' + error);
    });
  }


  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: 5000
    });
    await this.loading.present();
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1000
    });
    toast.present();
  }

  changeBolsa() {
    // this.bolsa = !this.bolsa;
    console.log('bolsa', this.bolsa);
    if (this.bolsa === true) {
      this.cantidadBolsa = 1;
      this.presentToast('Bolsa agregada');
      this.importeTotal = this.importeTotal + 0.3;
      // this.importeDescuento = this.importeDescuento + 0.3;
      // if (this.tipoPago === 'tarjeta') {
      //  this.ponerMontoExacto();
      // }
      // this.calcularVuelto();
    } else {
      this.presentToast('Bolsa quitada');
      this.importeTotal = this.importeTotal - (0.3 * this.cantidadBolsa);
      // if (this.tipoPago === 'tarjeta') {
      //  this.ponerMontoExacto();
      // }
      // this.importeDescuento = this.importeDescuento - (0.3 * this.cantidadBolsa);
      // this.calcularVuelto();
      this.cantidadBolsa = 0;
    }
    this.ponerMontoExactoYCalularVuelto();
    // this.calcularVuelto();

  }

  seleccionTipoPago(tipo: string) {
    this.tipoPago = tipo;
    if (this.tipoPago === 'tarjeta') {
      this.ponerMontoExactoYCalularVuelto();
    }
  }

  volver() {
    this.router.navigate(['/punto-venta', 'false']);
  }

  async presentModalComprobante() {
    const modal = await this.modalController.create({
      component: ComprobantePage,
      cssClass: 'modalComprobante',
      componentProps: {
        data: this.venta
      }
    });
    return await modal.present();
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
    // console.log(this.qr.qrcElement.nativeElement);
    // const imageQR = this.qr.qrcElement.nativeElement.children[0].currentSrc;
    // const qrcode = document.getElementById('qrcode');
    // console.log(qrcode);
    // const imageData = this.getBase64Image(qrcode.firstChild.firstChild);
    // console.log(imageData);
    console.log(this.tipoComprobante);
    switch (this.tipoComprobante) {
      case 'boleta':
        let index = 39;
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 7 + 30 + 12]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
        doc.setFontSize(6);
        doc.setFont('helvetica');
        doc.text('CLÍNICA VETERINARIA TOOBY E.I.R.L', 22.5, 12, {align: 'center'});
        if (this.storage.datosAdmi.sede === 'Andahuaylas') {
        doc.text('Av. Peru 236 Andahuaylas Apurimac ', 22.5, 14, {align: 'center'});
        doc.text('Parque Lampa de Oro ', 22.5, 16, {align: 'center'});

        doc.text('Telefono: 983905066', 22.5, 19, {align: 'center'});
        }
        if (this.storage.datosAdmi.sede === 'Abancay') {
          doc.text('Av. Seoane 100 Abancay Apurimac', 22.5, 14, {align: 'center'});
          doc.text('Parque el Olivo', 22.5, 16, {align: 'center'});

          doc.text('Telefono: 988907777', 22.5, 19, {align: 'center'});
          }
        doc.text('Ruc: ' + this.RUC, 22.5, 21, {align: 'center'});
        doc.text('Boleta de Venta electrónica', 22.5, 25, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text(this.venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - this.venta.numeroComprobante.length)) + this.venta.numeroComprobante, 22.5, 27, {align: 'center'});
        doc.text(this.venta.cliente.tipoDoc.toUpperCase() + ': ' + this.venta.cliente.numDoc , 22.5, 31, {align: 'center'});
        doc.text( 'Cliente: ', 22.5, 33, {align: 'center'});
        doc.text( this.convertirMayuscula(this.venta.cliente.nombre), 22.5, 35, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 37, {align: 'center'});
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
          // tslint:disable-next-line:max-line-length
          doc.text( c.cantidad.toFixed(2) + '    ' + c.producto.medida + '      ' + c.producto.precio.toFixed(2), 2, index + 3, {align: 'justify'});
          doc.text((c.totalxprod).toFixed(2), 43, index + 3, {align: 'right'} );

          doc.text( '__________________________________________', 22.5, index +  3, {align: 'center'});
          index = index + 3;
        }
        doc.text('SubTotal: S/ ', 35, index + 3, {align: 'right'});
        doc.text(this.venta.montoNeto.toFixed(2), 43, index + 3, {align: 'right'});
        doc.text('Descuento: S/ ', 35, index + 5, {align: 'right'});
        doc.text(this.venta.descuentoVenta.toFixed(2), 43, index + 5, {align: 'right'});
        index = index + 4;
        doc.text('ICBP(0.30): S/ ', 35, index + 3, {align: 'right'});
        doc.text((this.venta.cantidadBolsa * 0.3).toFixed(2), 43, index + 3, {align: 'right'});
        doc.text('Importe Total: S/ ', 35, index + 5, {align: 'right'});
        doc.text(this.venta.totalPagarVenta.toFixed(2), 43, index + 5, {align: 'right'});
        doc.text('Vuelto: S/ ', 35, index + 7, {align: 'right'});
        doc.text(this.vuelto.toFixed(2), 43, index + 7, {align: 'right'});
        doc.setFontSize(3.5);
        // doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 9, {align: 'left'});
        doc.text(MontoALetras(this.venta.totalPagarVenta), 2, index + 9, {align: 'left'});
        doc.setFontSize(4);
        doc.text('Vendedor: ' + this.convertirMayuscula(this.venta.vendedor.nombre), 2, index + 11, {align: 'left'});
        // doc.text(this.venta.vendedor.nombre.toUpperCase(), 43, index + 11, {align: 'right'});

        doc.text('Forma de Pago: ' + this.convertirMayuscula(this.venta.tipoPago) , 2, index + 13, {align: 'left'});
        // doc.text(this.venta.tipoPago.toUpperCase(), 43, index + 13, {align: 'right'});

        doc.addImage(qr, 'JPEG', 15, index + 14, 15, 15);
        index = index + 30;
        doc.setFontSize(4);
        doc.text('Representación impresa del comprobante de pago\r de Venta Electrónica, esta puede ser consultada en\r www.facturaciontooby.web.app/buscar\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
        doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
        // doc.save('tiket' + '.pdf');
        doc.autoPrint();
        window.open(doc.output('bloburl').toString(), '_blank');

        // doc.output('dataurlnewwindow');
        const canvas = document.getElementById('pdf');
        break;
      case'factura': {
        console.log('es una facura');
        // tslint:disable-next-line:no-shadowed-variable
        let index = 39;
        // tslint:disable-next-line:no-shadowed-variable
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 19 + 25 + 12]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
        doc.setFontSize(6);
        doc.setFont('helvetica');
        doc.text('CLÍNICA VETERINARIA TOOBY E.I.R.L', 22.5, 12, {align: 'center'});
        if (this.storage.datosAdmi.sede === 'Andahuaylas') {
        doc.text('Av. Peru 236 Andahuaylas Apurimac ', 22.5, 14, {align: 'center'});
        doc.text('Parque Lampa de Oro ', 22.5, 16, {align: 'center'});

        doc.text('Telefono: 983905066', 22.5, 19, {align: 'center'});
        }
        if (this.storage.datosAdmi.sede === 'Abancay') {
          doc.text('Av. Seoane 100 Abancay Apurimac', 22.5, 14, {align: 'center'});
          doc.text('Parque el Olivo', 22.5, 16, {align: 'center'});

          doc.text('Telefono: 988907777', 22.5, 19, {align: 'center'});
          }
        doc.text('Ruc: ' + this.RUC, 22.5, 21, {align: 'center'});
        doc.text('Factura de Venta electrónica', 22.5, 25, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text(this.venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - this.venta.numeroComprobante.length)) + this.venta.numeroComprobante, 22.5, 27, {align: 'center'});
        doc.text(this.venta.cliente.tipoDoc.toUpperCase() + ': ' + this.venta.cliente.numDoc , 22.5, 31, {align: 'center'});
        doc.text( 'Cliente:', 22.5, 33, {align: 'center'});
        doc.text( this.convertirMayuscula(this.venta.cliente.nombre), 22.5, 35, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 37, {align: 'center'});
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
          // tslint:disable-next-line:max-line-length
          doc.text( c.cantidad.toFixed(2) + '    ' + c.producto.medida + '      ' + c.producto.precio.toFixed(2), 2, index + 3, {align: 'justify'});
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
        doc.text('ICBP(0.30)', 2, index + 17, {align: 'left'});
        doc.text( (this.venta.cantidadBolsa * 0.30).toFixed(2), 43, index + 17, {align: 'right'});
        doc.text('I.S.C.', 2, index + 19, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 19, {align: 'right'});
        doc.text( '__________________________________________', 22.5, index + 19, {align: 'center'});

        index = index + 19;
        doc.text('TOTAL IMPORTE:', 2, index + 3, {align: 'left'});
        doc.text('s/ ' + this.venta.totalPagarVenta.toFixed(2), 43, index + 3, {align: 'right'});
        doc.setFontSize(3);
        // doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 5, {align: 'left'});
        doc.text(MontoALetras(this.venta.totalPagarVenta), 2, index + 5, {align: 'left'});
        doc.setFontSize(4);
        doc.text('Vendedor: ' + this.convertirMayuscula(this.venta.vendedor.nombre), 2, index + 7, {align: 'left'});
        doc.text('Forma de Pago: ' + this.convertirMayuscula(this.venta.tipoPago) , 2, index + 9, {align: 'left'});


        doc.addImage(qr, 'JPEG', 15, index + 10, 15, 15);
        index = index + 25;
        doc.setFontSize(4);
        doc.text('Representación impresa del comprobante de pago\r de Factura Electrónica, esta puede ser consultada en\r www.facturaciontooby.web.app/buscar\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
        doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
        doc.save('tiket' + '.pdf');
        doc.autoPrint();
        window.open(doc.output('bloburl').toString(), '_blank');
        // doc.output('dataurlnewwindow');
        break;
      }
      case 'n. venta': {
        // tslint:disable-next-line:no-shadowed-variable
        let index = 39;
        // tslint:disable-next-line:no-shadowed-variable
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 9 + 20 + 12]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
        doc.setFontSize(6);
        doc.setFont('helvetica');
        doc.text('CLÍNICA VETERINARIA TOOBY E.I.R.L', 22.5, 12, {align: 'center'});
        if (this.storage.datosAdmi.sede === 'Andahuaylas') {
        doc.text('Av. Peru 236 Andahuaylas Apurimac ', 22.5, 14, {align: 'center'});
        doc.text('Parque Lampa de Oro ', 22.5, 16, {align: 'center'});

        doc.text('Telefono: 983905066', 22.5, 19, {align: 'center'});
        }
        if (this.storage.datosAdmi.sede === 'Abancay') {
          doc.text('Av. Seoane 100 Abancay Apurimac', 22.5, 14, {align: 'center'});
          doc.text('Parque el Olivo', 22.5, 16, {align: 'center'});

          doc.text('Telefono: 988907777', 22.5, 19, {align: 'center'});
          }
        doc.text('Ruc: ' + this.RUC, 22.5, 21, {align: 'center'});
        doc.text('Nota de Venta electrónica', 22.5, 25, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text(this.venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - this.venta.numeroComprobante.length)) + this.venta.numeroComprobante, 22.5, 27, {align: 'center'});
        doc.text(this.venta.cliente.tipoDoc.toUpperCase() + ': '+ this.venta.cliente.numDoc , 22.5, 31, {align: 'center'});
        doc.text( 'Cliente:', 22.5, 33, {align: 'center'});
        doc.text( this.convertirMayuscula(this.venta.cliente.nombre), 22.5, 35, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 37, {align: 'center'});
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
          // tslint:disable-next-line:max-line-length
          doc.text( c.cantidad.toFixed(2) + '    ' + c.producto.medida + '      ' + c.producto.precio.toFixed(2), 2, index + 3, {align: 'justify'});
          doc.text((c.totalxprod).toFixed(2), 43, index + 3, {align: 'right'} );

          doc.text( '__________________________________________', 22.5, index +  3, {align: 'center'});
          index = index + 3;
        }
        if (this.venta.bolsa) {
          console.log(this.venta.bolsa, this.venta.cantidadBolsa);
          doc.text('BOLSA PLASTICA ', 2, index + 3);
          // tslint:disable-next-line:max-line-length
          doc.text( this.venta.cantidadBolsa.toFixed(2) + '    ' + 'Unidad' + '      ' + (0.3).toFixed(2), 2, index + 5, {align: 'justify'});
          doc.text((this.venta.cantidadBolsa * 0.30).toFixed(2), 43, index + 5, {align: 'right'} );

          // doc.text((this.cantidadBolsa * 0.3).toFixed(2), 43, index + 3, {align: 'right'});
          doc.text( '__________________________________________', 22.5, index +  5, {align: 'center'});
          index = index + 5;

        }
        if (this.venta.descuentoVenta > 0) {
          doc.text('SubTotal: S/ ', 35, index + 3, {align: 'right'});
          doc.text((this.venta.montoNeto + (this.venta.cantidadBolsa * 0.30)).toFixed(2), 43, index + 3, {align: 'right'});
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
        // doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 9, {align: 'left'});
        doc.text(MontoALetras(this.venta.totalPagarVenta), 2, index + 7, {align: 'left'});
        doc.setFontSize(4);
        doc.text('Vendedor: ' + this.convertirMayuscula(this.venta.vendedor.nombre), 2, index + 9, {align: 'left'});
        // doc.text(this.venta.vendedor.nombre.toUpperCase(), 43, index + 11, {align: 'right'});

        doc.text('Forma de Pago: ' + this.convertirMayuscula(this.venta.tipoPago) , 2, index + 11, {align: 'left'});

        doc.setFontSize(5);
        doc.text('GRACIAS POR SU PREFERENCIA', 22.5, index + 15, {align: 'center'}); // 13
        doc.text('DOCUMENTO NO VALIDO PARA SUNAT', 22.5, index + 17, {align: 'center'});
        doc.text('RECLAME SU COMPROBANTE', 22.5, index + 19, {align: 'center'});
        doc.text( '__________________________________________', 22.5, index + 20, {align: 'center'});
        index = index + 20;
        doc.text('EL VETERINARIO TE RECUERDA:', 2, index + 3, {align: 'left'});
        doc.text('-Desparasitar a tu mascota cada 2 meses', 2, index + 6, {align: 'left'});
        doc.text('-Completar todas sus vacunas', 2, index + 8, {align: 'left'});
        doc.text('-Cuida el aseo e higiene de tu engreido', 2, index + 10, {align: 'left'});

        doc.autoPrint();
        // doc.output('datauristring');
        window.open(doc.output('bloburl').toString(), '_blank');
        // doc.save('notaVenta ' + '.pdf');
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
      const suscripcion = this.dataApi.obtenerCorrelacion(this.serieComprobante, this.storage.datosAdmi.sede).subscribe(datos => {
        // suscripcion.unsubscribe();
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
    this.importeTotal = this.importeTotal + 0.3;
    // this.importeDescuento = this.importeDescuento + 0.3;
    // if (this.tipoPago === 'tarjeta') {
    this.ponerMontoExactoYCalularVuelto();
    // }
    // this.calcularVuelto();

  }

  quitarBolsa() {
    if (this.cantidadBolsa > 1) {
      this.cantidadBolsa--;
      this.importeTotal = this.importeTotal - 0.3;
      // this.importeDescuento = this.importeDescuento - 0.3;
      // if (this.tipoPago === 'tarjeta') {
      //   this.ponerMontoExacto();
      // }
      // this.calcularVuelto();
    } else {
      this.presentToast('Minimo 0');
      this.bolsa = false;
      // this.calcularVuelto();
    }

    this.ponerMontoExactoYCalularVuelto();
    // this.calcularVuelto();

  }

  calcularPrecioTotalItemProducto(itemDeVenta: ItemDeVentaInterface){
    // if (typeof itemDeVenta.descuentoProducto === 'undefined') {
    //   return itemDeVenta.totalxprod;
    // }
    // return itemDeVenta.totalxprod - itemDeVenta.descuentoProducto;
    return itemDeVenta.totalxprod;
  }
}

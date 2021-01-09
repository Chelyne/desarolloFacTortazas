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

@Component({
  selector: 'app-confirmar-venta',
  templateUrl: './confirmar-venta.page.html',
  styleUrls: ['./confirmar-venta.page.scss'],
})
export class ConfirmarVentaPage implements OnInit {

  formPago: FormGroup;
  RUC = '20601831032';

  // subTotalDeVenta
  subTotalDeVenta: number;
  IGVdeVenta: number;

  // totalAPagar
  // NOTE - Total a pagar debería ser un constante
  totalAPagar: number;
  totalconDescuento: number;


  // tslint:disable-next-line: no-inferrable-types
  tipoComprobante: string = 'factura';
  serieComprobante = 'F002';


  // tslint:disable-next-line: no-inferrable-types
  vuelto: number = 0;
  // tslint:disable-next-line: no-inferrable-types
  montoEntrante: number = 0;
  descuentoDeVentaMonto = 0;
  descuentoDeVentaPorcentaje = 0;

  venta: VentaInterface;
  loading;
  bolsa = false;
  tipoPago = 'efectivo';
  LogoEmpresa = '../../../assets/img/TOOBY LOGO.png';

  elementType = NgxQrcodeElementTypes.CANVAS;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  valueQR;
  @ViewChild('qr') qr: QrcodeComponent;
  constructor(
    private testServ: ConfirmarVentaService,
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
    this.venta = this.testServ.getVentaService();
    if (isNullOrUndefined(this.venta)) {
      this.router.navigate(['/punto-venta']);
    } else {
      this.generarQR('20331066703' +  '|'  + '03' + 'B001' + '000626' + '40.00' + '2-01-21' + '987654321');
      if (Object.entries(this.venta).length !== 0){
        this.subTotalDeVenta = this.venta.totalPagarVenta;
        this.IGVdeVenta = this.subTotalDeVenta * 18 / 100;
        this.totalAPagar = this.subTotalDeVenta;
        this.montoEntrante = this.totalAPagar;
        this.totalconDescuento = this.totalAPagar;
      } else {
        this.subTotalDeVenta = 0;
        this.IGVdeVenta = 0;
        this.totalAPagar = 0;
        this.totalconDescuento = 0;
      }
      console.log('venta', this.venta);
    }
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // REFACTOR

    this.formPago.setControl('montoIngreso',
      new FormControl(this.totalAPagar, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    this.formPago.setControl('descuentoMonto',
      new FormControl(this.descuentoDeVentaMonto, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    this.formPago.setControl('descuentoPorcentaje',
      new FormControl(this.descuentoDeVentaPorcentaje, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    // console.log('sssssssssssss', this.venta);
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
    this.totalconDescuento = this.totalAPagar - this.descuentoDeVentaMonto;
    console.log(this.totalconDescuento, this.totalAPagar, this.descuentoDeVentaMonto);

    // tslint:disable-next-line:max-line-length
    // this.formPago.setControl('descuento', new FormControl(this.totalconDescuento, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    // this.modificarMontoEntrante(this.totalconDescuento);
    // this.calcularVuelto();

    // modificar el campo: montoEntrante
    this.modificarMontoEntrante(this.totalconDescuento);
    this.calcularVuelto();
    //
  }

  realizarDescuentoPorcentaje(){
    this.descuentoDeVentaMonto = null;
    console.log('Realizar descuento %');
    this.descuentoDeVentaPorcentaje =  parseFloat(this.formPago.value.descuentoPorcentaje);

    if (isNaN(this.descuentoDeVentaPorcentaje)) {
      this.descuentoDeVentaPorcentaje = 0;
    }
    this.totalconDescuento = this.totalAPagar - (this.totalAPagar * this.descuentoDeVentaPorcentaje / 100);
    console.log(this.totalconDescuento, this.totalAPagar, this.descuentoDeVentaPorcentaje);

    // tslint:disable-next-line:max-line-length
    // this.formPago.setControl('descuento', new FormControl(this.totalconDescuento, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    // this.modificarMontoEntrante(this.totalconDescuento);
    // this.calcularVuelto();

    // modificar el campo: montoEntrante
    this.modificarMontoEntrante(this.totalconDescuento);
    this.calcularVuelto();
    //
  }

  modificarMontoEntrante(monto: number){
    console.log(monto);
    this.montoEntrante = monto;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    // this.calcularVuelto();
  }



  calcularVuelto(){
    this.montoEntrante = parseFloat(this.formPago.value.montoIngreso);
    if (isNaN(this.montoEntrante)){
      this.montoEntrante = 0;
    }

    // console.log('total con descuento', this.totalconDescuento);
    this.vuelto =  this.montoEntrante - this.totalconDescuento;

    // console.log(this.totalconDescuento, this.montoEntrante, this.vuelto);
  }


  sumarAMontoEntrante(montoAdd: number){
    console.log(montoAdd);
    this.montoEntrante =  montoAdd;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    this.calcularVuelto();
  }

  ponerMontoExacto(){
    this.montoEntrante = this.totalconDescuento;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    this.calcularVuelto();
  }



  cancelarVenta(){
    console.log('cancelar venta');
    this.testServ.cleanData();
    this.resetFormPago();
    this.bolsa = false;
    this.router.navigate(['/punto-venta', 'true']);
  }

  SeleccionarComprobante(comprobante: string){
    this.tipoComprobante = comprobante;

    if (comprobante === 'factura'){
      this.serieComprobante = 'F002';
    } else if (comprobante === 'boleta'){
      this.serieComprobante = 'B002';

    }else if (comprobante === 'n. venta'){
      this.serieComprobante = 'NV01';
    }
  }

  generarPago(){
    this.presentLoading('Generando Venta');
    this.venta.tipoComprobante = this.tipoComprobante;
    this.venta.serieComprobante = this.serieComprobante;
    this.venta.vendedor = this.storage.datosAdmi;
    this.venta.bolsa = this.bolsa;
    this.venta.tipoPago = this.tipoPago;
    console.log('Se generó el pago');
    this.dataApi.confirmarVenta(this.venta, this.storage.datosAdmi.sede).then(data => {
      this.generarComprobante();
      this.resetFormPago();
      this.router.navigate(['/punto-venta', 'true']);
      console.log('guardado', data);
      this.loading.dismiss();
      this.presentToast('Venta exitosa');

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
      this.presentToast('Bolsa agregada');
      this.totalAPagar = this.totalAPagar + 0.3;
      this.totalconDescuento = this.totalconDescuento + 0.3;
      this.calcularVuelto();
    } else {
      this.presentToast('Bolsa quitada');
      this.totalAPagar = this.totalAPagar - 0.3;
      this.totalconDescuento = this.totalconDescuento - 0.3;
      this.calcularVuelto();
    }
  }
  seleccionTipoPago(tipo: string) {
    this.tipoPago = tipo;
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


  generarComprobante() {
    const qr = this.getImage();
    console.log(qr);
    // console.log(this.qr.qrcElement.nativeElement);
    // const imageQR = this.qr.qrcElement.nativeElement.children[0].currentSrc;
    // const qrcode = document.getElementById('qrcode');
    // console.log(qrcode);
    // const imageData = this.getBase64Image(qrcode.firstChild.firstChild);
    // console.log(imageData);
    switch (this.tipoComprobante) {
      case 'boleta':
        let index = 38;
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 6 + 20 + 6]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 15, 5, 15, 7);
        doc.setFontSize(6);
        doc.setFont('courier');
        doc.text('Veterinarias Tooby E.I.R.L.', 22.5, 16, {align: 'center'});
        if (this.storage.datosAdmi.sede === 'Andahuaylas') {
        doc.text('Av. Peru 236 Parque Lampa de Oro ', 22.5, 18, {align: 'center'});
        doc.text('Telefono: 983905066', 22.5, 20, {align: 'center'});
        }
        if (this.storage.datosAdmi.sede === 'Abancay') {
          doc.text('Av. Seoane 100 Parque el olivo ', 22.5, 18, {align: 'center'});
          doc.text('Telefono: 988907777', 22.5, 20, {align: 'center'});
          }
        doc.text('Ruc: ' + this.RUC, 22.5, 22, {align: 'center'});
        doc.text('Boleta de Venta electrónica', 22.5, 26, {align: 'center'});
        doc.text('B0000378', 22.5, 28, {align: 'center'});
        doc.text('Ruc o Razon social:', 22.5, 32, {align: 'center'});
        doc.text( this.venta.cliente.numDoc + ' - ' + this.venta.cliente.nombre, 22.5, 34, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 36, {align: 'center'});
        doc.setFontSize(5);

        for (const c of this.venta.listaItemsDeVenta) {
          doc.text( '________________________________________', 22.5, index, {align: 'center'});
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
          doc.text( c.producto.cantidad + '.00    ' + 'UND' + '      ' + c.producto.precio.toFixed(2), 2, index + 3, {align: 'justify'});
          doc.text((c.producto.precio * c.producto.cantidad).toFixed(2), 43, index + 3, {align: 'right'} );

          doc.text( '________________________________________', 22.5, index +  3, {align: 'center'});
          index = index + 3;
        }
        doc.text('Importe Total:', 2, index + 3, {align: 'left'});
        doc.text('s/ ' + this.venta.totalPagarVenta.toFixed(2), 43, index + 3, {align: 'right'});
        doc.setFontSize(3);
        doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 5, {align: 'left'});
        doc.addImage(qr, 'JPEG', 15, index + 6, 15, 15);
        index = index + 20;
        doc.setFontSize(4);
        doc.text('Representación impresa del comprobante de pago\r de Venta Electrónica, esta puede ser consultada en\r www.tooby.com\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
        doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
        doc.save('tiket' + '.pdf');
        doc.autoPrint();
        // doc.output('dataurlnewwindow');
        const canvas = document.getElementById('pdf');
        break;
      case'factura': {
        // tslint:disable-next-line:no-shadowed-variable
        let index = 38;
        // tslint:disable-next-line:no-shadowed-variable
        const doc = new jsPDF( 'p', 'mm', [45, index  + (this.venta.listaItemsDeVenta.length * 7) + 18 + 6 + 20 + 6]);
        doc.addImage(this.LogoEmpresa, 'JPEG', 15, 5, 15, 7);
        doc.setFontSize(6);
        doc.setFont('courier');
        doc.text('Veterinarias Tooby E.I.R.L.', 22.5, 16, {align: 'center'});
        if (this.storage.datosAdmi.sede === 'Andahuaylas') {
          doc.text('Av. Peru 236 Parque Lampa de Oro ', 22.5, 18, {align: 'center'});
          doc.text('Telefono: 983905066', 22.5, 20, {align: 'center'});
          }
        if (this.storage.datosAdmi.sede === 'Abancay') {
            doc.text('Av. Seoane 100 Parque el olivo ', 22.5, 18, {align: 'center'});
            doc.text('Telefono: 988907777', 22.5, 20, {align: 'center'});
            }
        doc.text('Ruc: ' + this.RUC, 22.5, 22, {align: 'center'});
        doc.text('Factura de Venta electrónica', 22.5, 26, {align: 'center'});
        doc.text('F0000378', 22.5, 28, {align: 'center'});
        doc.text('Ruc o Razon social:', 22.5, 32, {align: 'center'});
        doc.text( this.venta.cliente.numDoc + ' - ' + this.venta.cliente.nombre, 22.5, 34, {align: 'center'});
        // tslint:disable-next-line:max-line-length
        doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 36, {align: 'center'});
        doc.setFontSize(5);

        for (const c of this.venta.listaItemsDeVenta) {
          doc.text( '________________________________________', 22.5, index, {align: 'center'});
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
          doc.text( c.producto.cantidad + '.00    ' + 'UND' + '      ' + c.producto.precio.toFixed(2), 2, index + 3, {align: 'justify'});
          doc.text((c.producto.precio * c.producto.cantidad).toFixed(2), 43, index + 3, {align: 'right'} );

          doc.text( '________________________________________', 22.5, index +  3, {align: 'center'});
          index = index + 3;
        }
        doc.text('OP. GRAVADAS:', 2, index + 3, {align: 'left'});
        doc.text( (this.venta.totalPagarVenta - (this.venta.totalPagarVenta * 0.18)).toFixed(2), 43, index + 3, {align: 'right'});
        doc.text('OP. INAFECTA:', 2, index + 5, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 5, {align: 'right'});
        doc.text('OP. EXONERADA:', 2, index + 7, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 7, {align: 'right'});
        doc.text('OP. GRATUITA', 2, index + 9, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 9, {align: 'right'});
        doc.text('OP. EXPORTACIÓN', 2, index + 11, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 11, {align: 'right'});
        doc.text('DESCUENTO', 2, index + 13, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 13, {align: 'right'});
        doc.text('I.G.V. (18%)', 2, index + 15, {align: 'left'});
        doc.text( (this.venta.totalPagarVenta * 0.18).toFixed(2), 43, index + 15, {align: 'right'});
        doc.text('ICBP(0.20)', 2, index + 17, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 17, {align: 'right'});
        doc.text('I.S.C.', 2, index + 19, {align: 'left'});
        doc.text( (0).toFixed(2), 43, index + 19, {align: 'right'});
        doc.text( '________________________________________', 22.5, index + 19, {align: 'center'});

        index = index + 19;
        doc.text('TOTAL IMPORTE:', 2, index + 3, {align: 'left'});
        doc.text('s/ ' + this.venta.totalPagarVenta.toFixed(2), 43, index + 3, {align: 'right'});
        doc.setFontSize(3);
        doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 5, {align: 'left'});
        doc.addImage(qr, 'JPEG', 15, index + 6, 15, 15);
        index = index + 20;
        doc.setFontSize(4);
        doc.text('Representación impresa del comprobante de pago\r de Factura Electrónica, esta puede ser consultada en\r www.tooby.com\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
        doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
        doc.save('tiket' + '.pdf');
        doc.autoPrint();
        // doc.output('dataurlnewwindow');
        break;
      }
    }
  }


  Unidades(num){

    switch (num)
    {
        case 1: return 'UN';
        case 2: return 'DOS';
        case 3: return 'TRES';
        case 4: return 'CUATRO';
        case 5: return 'CINCO';
        case 6: return 'SEIS';
        case 7: return 'SIETE';
        case 8: return 'OCHO';
        case 9: return 'NUEVE';
    }

    return '';
}// Unidades()

Decenas(num){

    const decena = Math.floor(num / 10);
    const unidad = num - (decena * 10);

    switch (decena)
    {
        case 1:
            switch (unidad)
            {
                case 0: return 'DIEZ';
                case 1: return 'ONCE';
                case 2: return 'DOCE';
                case 3: return 'TRECE';
                case 4: return 'CATORCE';
                case 5: return 'QUINCE';
                default: return 'DIECI' + this.Unidades(unidad);
            }
        case 2:
            switch (unidad)
            {
                case 0: return 'VEINTE';
                default: return 'VEINTI' + this.Unidades(unidad);
            }
        case 3: return this.DecenasY('TREINTA', unidad);
        case 4: return this.DecenasY('CUARENTA', unidad);
        case 5: return this.DecenasY('CINCUENTA', unidad);
        case 6: return this.DecenasY('SESENTA', unidad);
        case 7: return this.DecenasY('SETENTA', unidad);
        case 8: return this.DecenasY('OCHENTA', unidad);
        case 9: return this.DecenasY('NOVENTA', unidad);
        case 0: return this.Unidades(unidad);
    }
} // Unidades()

DecenasY(strSin, numUnidades) {
    if (numUnidades > 0) {
      return strSin + ' Y ' + this.Unidades(numUnidades);
    }
    return strSin;
} // DecenasY()

Centenas(num) {
    const centenas = Math.floor(num / 100);
    const decenas = num - (centenas * 100);

    switch (centenas)
    {
        case 1:
            if (decenas > 0) {
              return 'CIENTO ' + this.Decenas(decenas);
            }
            return 'CIEN';
        case 2: return 'DOSCIENTOS ' + this.Decenas(decenas);
        case 3: return 'TRESCIENTOS ' + this.Decenas(decenas);
        case 4: return 'CUATROCIENTOS ' + this.Decenas(decenas);
        case 5: return 'QUINIENTOS ' + this.Decenas(decenas);
        case 6: return 'SEISCIENTOS ' + this.Decenas(decenas);
        case 7: return 'SETECIENTOS ' + this.Decenas(decenas);
        case 8: return 'OCHOCIENTOS ' + this.Decenas(decenas);
        case 9: return 'NOVECIENTOS ' + this.Decenas(decenas);
    }

    return this.Decenas(decenas);
}// Centenas()

Seccion(num, divisor, strSingular, strPlural) {
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    let letras = '';

    if (cientos > 0) {
      if (cientos > 1) {
        letras = this.Centenas(cientos) + ' ' + strPlural;
      } else {
        letras = strSingular;
      }
    }

    if (resto > 0) {
      letras += '';
    }

    return letras;
} // Seccion()

Miles(num) {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    const strMiles = this.Seccion(num, divisor, 'UN MIL', 'MIL');
    const strCentenas = this.Centenas(resto);

    if (strMiles === '') {
      return strCentenas;
    }

    return strMiles + ' ' + strCentenas;
}// Miles()

Millones(num) {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    const strMillones = this.Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
    const strMiles = this.Miles(resto);

    if (strMillones === '') {
      return strMiles;
    }

    return strMillones + ' ' + strMiles;
}// Millones()

NumeroALetras(num) {
    const data = {
      numero: num,
      enteros: Math.floor(num),
      centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
      letrasCentavos: '',
      letrasMonedaPlural: 'SOLES', // 'PESOS', 'Dólares', 'Bolívares', 'etcs'
      letrasMonedaSingular: 'SOL', // 'PESO', 'Dólar', 'Bolivar', 'etc'
      letrasMonedaCentavoPlural: 'CÉNTIMOS',
      letrasMonedaCentavoSingular: 'CÉNTIMO'
    };

    if (data.centavos > 0) {
        data.letrasCentavos = 'CON ' + (() => {
            if (data.centavos === 1) {
              return this.Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
            } else {
              return this.Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
            }
            })();
    }

    if (data.enteros === 0) {
      return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    }
    if (data.enteros === 1) {
      return this.Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
    } else {
      return this.Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    }
  } // NumeroALetras()

  generarQR(value: string) {
    this.valueQR = value;
  }
}

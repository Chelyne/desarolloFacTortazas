import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { formatDate, DatePipe } from '@angular/common';
import { VentaInterface } from '../../models/venta/venta';
import { MontoALetras } from '../../global/monto-a-letra';
import * as moment from 'moment';
import jsPDF from 'jspdf';
import { NgxQrcodeElementTypes, NgxQrcodeErrorCorrectionLevels, QrcodeComponent } from '@techiediaries/ngx-qrcode';
import { ItemDeVentaInterface } from '../../models/venta/item-de-venta';


@Component({
  selector: 'app-modal-ventas',
  templateUrl: './modal-ventas.page.html',
  styleUrls: ['./modal-ventas.page.scss'],
  providers: [
    DatePipe
  ]
})
export class ModalVentasPage implements OnInit {
  RUC = '20601831032';
  LogoEmpresa = '../../../assets/img/TOOBY LOGO.png';
  listaVentas: VentaInterface[];

  sede = this.storage.datosAdmi.sede;


  elementType = NgxQrcodeElementTypes.CANVAS;
  correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;
  valueQR;
  @ViewChild('qr') qr: QrcodeComponent;
  constructor(private modalCtrl: ModalController,
              private dataApi: DbDataService,
              private storage: StorageService,
              private datePipe: DatePipe,
              ) { }

  ngOnInit() {
    this.consultaVentas();
  }

  ionViewWillEnter() {
    this.generarQR('20331066703' +  '|'  + '03' + 'B001' + '000626' + '40.00' + '2-01-21' + '987654321');
  }

  generarQR(value: string) {
    this.valueQR = value;
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }


  consultaVentas() {
    const fecha  = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    console.log(fecha);
    this.dataApi.ObtenerListaDeVentas(this.storage.datosAdmi.sede, fecha).subscribe(datos => {
      console.log(datos);
      if (datos.length > 0) {
        this.listaVentas = datos;
        this.convertirFecha(this.listaVentas);
      }
    });
  }

  convertirFecha(lista) {
    lista.forEach(element => {
      // element.fecha = moment.unix(element.fecha).format('DD/MM/yyyy');
      element.fechaEmision = new Date(moment.unix(element.fechaEmision.seconds).format('D MMM YYYY H:mm'));
      element.fechaEmision = formatDate(element.fechaEmision, 'dd-MM-yyyy HH:mm:ss', 'en');
    });
  }

  getImage() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/jpeg').toString();
    return imageData;
    }

  obtenerTipoComprobante(serie: string) {
    switch (serie) {
      case 'B001':
        return 'boleta';
      case 'F001':
        return 'factura';
      case 'NV01':
        return 'n. venta';
    }
  }

  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }

  convertirMayuscula(letra: string) {
    return letra.charAt(0).toUpperCase() + letra.slice(1);
  }

  calcularIGVincluido(montoTotalPagar: number){
    const montoBase = montoTotalPagar / 1.18;
    return(montoTotalPagar - montoBase);
  }

  obtenerProductosVenta(id: string) {
    console.log('obteniedo');
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.obtenerProductosDeVenta(id, this.storage.datosAdmi.sede).subscribe(datos => {
        console.log('obtenido', datos);
        if (datos) {
          resolve(datos.productos);
        }
      });
    });
    return promesa;
  }

  anularVenta(ventaSelect: VentaInterface){
    // NOTE - FechaEmision:
    //      formato que regresa, fechaEmision: "13-01-2021 12:24:00"
    console.log('la venta debería anularse', ventaSelect);
    // console.log(compraSelect.anulado);
    const fechaString = `${ventaSelect.fechaEmision}`;
    const fechaEmisionFormateada = fechaString.split(' ')[0];
    console.log(fechaEmisionFormateada);


    if (ventaSelect.estadoVenta === 'registrado'){
      this.dataApi.toggleAnularVenta(ventaSelect.idVenta, 'anulado', this.sede, fechaEmisionFormateada);
    } else {
      this.dataApi.toggleAnularVenta(ventaSelect.idVenta, 'registrado', this.sede, fechaEmisionFormateada);
    }
  }

  generarmensaje(typoAccion: string, estadoVenta: string): string{
    if (estadoVenta === 'anulado'){
      return '===== COPIA DE COMPROBANTE ANULADO =====';
    }
    if (typoAccion === 'copia' ) {
      return '===== COPIA DE COMPROBANTE =====';
    } else if (typoAccion === 'anular' ) {
      return '===== COMPROBANTE ANULADO  =====';
    }
    return '';
  }

  generarComprobante(venta: VentaInterface, typoAccion: string) {
    console.log(venta);

    if (typoAccion === 'anular' ) {
      this.anularVenta(venta);
    }

    const qr = this.getImage();
    console.log(qr);
    // console.log(this.qr.qrcElement.nativeElement);
    // const imageQR = this.qr.qrcElement.nativeElement.children[0].currentSrc;
    // const qrcode = document.getElementById('qrcode');
    // console.log(qrcode);
    // const imageData = this.getBase64Image(qrcode.firstChild.firstChild);
    // console.log(imageData);
    this.obtenerProductosVenta(venta.idListaProductos).then((datos: ItemDeVentaInterface[]) => {
      console.log(datos);
      venta.listaItemsDeVenta =  datos;
      const tipoComprobante = this.obtenerTipoComprobante(venta.serieComprobante);
      console.log(tipoComprobante);
      console.log(venta);
      switch (tipoComprobante) {
        case 'boleta':
          let index = 39;
          const doc = new jsPDF( 'p', 'mm', [45, index  + (venta.listaItemsDeVenta.length * 7) + 7 + 30 + 14]);
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
          doc.text(venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - venta.numeroComprobante.length)) + venta.numeroComprobante, 22.5, 27, {align: 'center'});
          doc.text('Ruc: ' + venta.cliente.numDoc , 22.5, 31, {align: 'center'});
          doc.text( 'Razon social:', 22.5, 33, {align: 'center'});
          doc.text( this.convertirMayuscula(venta.cliente.nombre), 22.5, 35, {align: 'center'});
          // tslint:disable-next-line:max-line-length
          doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 37, {align: 'center'});
          doc.setFontSize(5);

          for (const c of venta.listaItemsDeVenta) {
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
          doc.text(venta.montoNeto ? venta.montoNeto.toFixed(2) : '0.00', 43, index + 3, {align: 'right'});
          doc.text('Descuento: S/ ', 35, index + 5, {align: 'right'});
          doc.text(venta.descuentoVenta ? venta.descuentoVenta.toFixed(2) : '0.00', 43, index + 5, {align: 'right'});
          index = index + 4;
          doc.text('ICBP(0.30): S/ ', 35, index + 3, {align: 'right'});
          doc.text(venta.cantidadBolsa ? (venta.cantidadBolsa * 0.3).toFixed(2) : '0.00', 43, index + 3, {align: 'right'});
          doc.text('Importe Total: S/ ', 35, index + 5, {align: 'right'});
          doc.text(venta.totalPagarVenta.toFixed(2), 43, index + 5, {align: 'right'});
          doc.text('Vuelto: S/ ', 35, index + 7, {align: 'right'});
          // tslint:disable-next-line:max-line-length
          doc.text(venta.montoPagado - venta.totalPagarVenta > 0 ? (venta.montoPagado - venta.totalPagarVenta).toFixed(2) : '0.00', 43, index + 7, {align: 'right'});
          doc.setFontSize(3.5);
          // doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 9, {align: 'left'});
          doc.text(MontoALetras(venta.totalPagarVenta), 2, index + 9, {align: 'left'});
          doc.setFontSize(4);
          doc.text('Vendedor: ' + this.convertirMayuscula(venta.vendedor.nombre), 2, index + 11, {align: 'left'});
          // doc.text(this.venta.vendedor.nombre.toUpperCase(), 43, index + 11, {align: 'right'});

          doc.text('Forma de Pago: ' + this.convertirMayuscula(venta.tipoPago) , 2, index + 13, {align: 'left'});
          // doc.text(this.venta.tipoPago.toUpperCase(), 43, index + 13, {align: 'right'});

          doc.addImage(qr, 'JPEG', 15, index + 14, 15, 15);
          index = index + 30;
          // doc.text('===== COPIA DE COMPROBANTE =====', 22.5, index + 2, {align: 'center'});
          doc.text(this.generarmensaje(typoAccion, venta.estadoVenta), 22.5, index + 2, {align: 'center'});
          index = index + 2;
          doc.setFontSize(4);
          doc.text('Representación impresa del comprobante de pago\r de Venta Electrónica, esta puede ser consultada en\r www.tooby.com\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
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
          const doc = new jsPDF( 'p', 'mm', [45, index  + (venta.listaItemsDeVenta.length * 7) + 19 + 25 + 12]);
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
          doc.text(venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - venta.numeroComprobante.length)) + venta.numeroComprobante, 22.5, 27, {align: 'center'});
          doc.text('Ruc: ' + venta.cliente.numDoc , 22.5, 31, {align: 'center'});
          doc.text( 'Razon social:', 22.5, 33, {align: 'center'});
          doc.text( this.convertirMayuscula(venta.cliente.nombre), 22.5, 35, {align: 'center'});
          // tslint:disable-next-line:max-line-length
          doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 37, {align: 'center'});
          doc.setFontSize(5);

          for (const c of venta.listaItemsDeVenta) {
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
          doc.text( (venta.totalPagarVenta / 1.18).toFixed(2), 43, index + 3, {align: 'right'});
          doc.text('OP. INAFECTA:', 2, index + 5, {align: 'left'});
          doc.text( (0).toFixed(2), 43, index + 5, {align: 'right'});
          doc.text('OP. EXONERADA:', 2, index + 7, {align: 'left'});
          doc.text( (0).toFixed(2), 43, index + 7, {align: 'right'});
          doc.text('OP. GRATUITA', 2, index + 9, {align: 'left'});
          doc.text( (0).toFixed(2), 43, index + 9, {align: 'right'});
          doc.text('OP. EXPORTACIÓN', 2, index + 11, {align: 'left'});
          doc.text( (0).toFixed(2), 43, index + 11, {align: 'right'});
          doc.text('DESCUENTO', 2, index + 13, {align: 'left'});
          doc.text(venta.descuentoVenta ? (venta.descuentoVenta).toFixed(2) : '0.00', 43, index + 13, {align: 'right'});
          doc.text('I.G.V. (18%)', 2, index + 15, {align: 'left'});
          doc.text( (this.calcularIGVincluido(venta.totalPagarVenta)).toFixed(2), 43, index + 15, {align: 'right'});
          doc.text('ICBP(0.30)', 2, index + 17, {align: 'left'});
          doc.text(venta.cantidadBolsa ? (venta.cantidadBolsa * 0.30).toFixed(2) : '0.00', 43, index + 17, {align: 'right'});
          doc.text('I.S.C.', 2, index + 19, {align: 'left'});
          doc.text( (0).toFixed(2), 43, index + 19, {align: 'right'});
          doc.text( '__________________________________________', 22.5, index + 19, {align: 'center'});
          index = index + 19;
          doc.text('TOTAL IMPORTE:', 2, index + 3, {align: 'left'});
          doc.text('s/ ' + venta.totalPagarVenta.toFixed(2), 43, index + 3, {align: 'right'});
          doc.setFontSize(3);
          // doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 5, {align: 'left'});
          doc.text(MontoALetras(venta.totalPagarVenta), 2, index + 5, {align: 'left'});
          doc.setFontSize(4);
          doc.text('Vendedor: ' + this.convertirMayuscula(venta.vendedor.nombre), 2, index + 7, {align: 'left'});
          doc.text('Forma de Pago: ' + this.convertirMayuscula(venta.tipoPago) , 2, index + 9, {align: 'left'});
          doc.addImage(qr, 'JPEG', 15, index + 10, 15, 15);
          index = index + 25;
          doc.text('===== COPIA DE COMPROBANTE =====', 22.5, index + 2, {align: 'center'});
          index = index + 2;
          doc.setFontSize(4);
          doc.text('Representación impresa del comprobante de pago\r de Factura Electrónica, esta puede ser consultada en\r www.tooby.com\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
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
          const doc = new jsPDF( 'p', 'mm', [45, index  + (venta.listaItemsDeVenta.length * 7) + 9 + 24 + 12]);
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
          doc.text(venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - venta.numeroComprobante.length)) + venta.numeroComprobante, 22.5, 27, {align: 'center'});
          doc.text('Ruc: ' + venta.cliente.numDoc , 22.5, 31, {align: 'center'});
          doc.text( 'Razon social:', 22.5, 33, {align: 'center'});
          doc.text( this.convertirMayuscula(venta.cliente.nombre), 22.5, 35, {align: 'center'});
          // tslint:disable-next-line:max-line-length
          doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 37, {align: 'center'});
          doc.setFontSize(5);

          for (const c of venta.listaItemsDeVenta) {
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
          if (venta.bolsa) {
            console.log(venta.bolsa, venta.cantidadBolsa);
            doc.text('BOLSA PLASTICA ', 2, index + 3);
            // tslint:disable-next-line:max-line-length
            doc.text( venta.cantidadBolsa.toFixed(2) + '    ' + 'Unidad' + '      ' + (0.3).toFixed(2), 2, index + 5, {align: 'justify'});
            doc.text((venta.cantidadBolsa * 0.30).toFixed(2), 43, index + 5, {align: 'right'} );
            // doc.text((this.cantidadBolsa * 0.3).toFixed(2), 43, index + 3, {align: 'right'});
            doc.text( '__________________________________________', 22.5, index +  5, {align: 'center'});
            index = index + 5;
          }
          if (venta.descuentoVenta > 0) {
            doc.text('SubTotal: S/ ', 35, index + 3, {align: 'right'});
            doc.text((venta.montoNeto + (venta.cantidadBolsa * 0.30)).toFixed(2), 43, index + 3, {align: 'right'});
            doc.text('Descuento: S/ ', 35, index + 5, {align: 'right'});
            doc.text(venta.descuentoVenta.toFixed(2), 43, index + 5, {align: 'right'});
            index = index + 4;
          }
          doc.text('Importe Total: S/ ', 35, index + 3, {align: 'right'});
          doc.text(venta.totalPagarVenta.toFixed(2), 43, index + 3, {align: 'right'});
          const vuelto = venta.montoPagado - venta.totalPagarVenta;
          if ((vuelto) > 0) {
            doc.text('Vuelto: S/ ', 35, index + 5, {align: 'right'});
            doc.text((vuelto).toFixed(2), 43, index + 5, {align: 'right'});
          }
          doc.setFontSize(3.5);
          // doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 9, {align: 'left'});
          doc.text(MontoALetras(venta.totalPagarVenta), 2, index + 7, {align: 'left'});
          doc.setFontSize(4);
          doc.text('Vendedor: ' + this.convertirMayuscula(venta.vendedor.nombre), 2, index + 9, {align: 'left'});
          // doc.text(this.venta.vendedor.nombre.toUpperCase(), 43, index + 11, {align: 'right'});

          doc.text('Forma de Pago: ' + this.convertirMayuscula(venta.tipoPago) , 2, index + 11, {align: 'left'});

          doc.setFontSize(5);
          // doc.text('===== COPIA DE COMPROBANTE =====', 22.5, index + 15, {align: 'center'});
          doc.text(this.generarmensaje(typoAccion, venta.estadoVenta), 22.5, index + 15, {align: 'center'});
          doc.text('GRACIAS POR SU PREFERENCIA', 22.5, index + 19, {align: 'center'}); // 13
          doc.text('DOCUMENTO NO VALIDO PARA SUNAT', 22.5, index + 21, {align: 'center'});
          doc.text('RECLAME SU COMPROBANTE', 22.5, index + 23, {align: 'center'});
          doc.text( '__________________________________________', 22.5, index + 24, {align: 'center'});
          index = index + 24;
          doc.text('EL VETERINARIO TE RECUERDA:', 2, index + 3, {align: 'left'});
          doc.text('-Desparasitar a tu mascota cada 2 meses', 2, index + 6, {align: 'left'});
          doc.text('-Completar todas sus vacunas', 2, index + 8, {align: 'left'});
          doc.text('-Cuida el aseo e higiene de tu engreido', 2, index + 10, {align: 'left'});

          doc.autoPrint();
          // doc.output('datauristring');
          window.open(doc.output('bloburl').toString(), '_blank');
          break;
        }
      }
    });
  }



}

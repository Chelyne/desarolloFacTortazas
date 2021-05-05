import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { formatDate } from '@angular/common';
import { MontoALetras } from 'src/app/global/monto-a-letra';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { DataBaseService } from './data-base.service';
import * as moment from 'moment';
import { StorageService } from 'src/app/services/storage.service';
import { GENERAL_CONFIG } from '../../config/generalConfig';



@Injectable({
  providedIn: 'root'
})
export class BoletasFacturasService {

  LogoEmpresa = GENERAL_CONFIG.datosEmpresa.logo;
  RUC = GENERAL_CONFIG.datosEmpresa.ruc;
  nombreEmpresa = GENERAL_CONFIG.datosEmpresa.razon_social;
  valueQR;
  sede = this.storage.datosAdmi.sede.toLocaleLowerCase();


  constructor(  private dataApi: DataBaseService, private storage: StorageService) { }
  // getImage() {
  //   const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  //   const imageData = canvas.toDataURL('image/jpeg').toString();
  //   return imageData;
  //   }
    async generarComprobante(venta) {
    venta.horaEmision = new Date(moment.unix(venta.fechaEmision.seconds).format('D MMM YYYY H:mm'));
    venta.fechaEmision = new Date(moment.unix(venta.fechaEmision.seconds).format('D MMM YYYY H:mm'));
    venta.fechaEmision = formatDate(venta.fechaEmision, 'dd/MM/yyyy', 'en');
    venta.horaEmision = formatDate(venta.horaEmision, 'HH:mm aa', 'en');
    // const qr = this.getImage();
    // console.log(qr);

    // tslint:disable-next-line:max-line-length
    await this.obtenerProductosVenta(venta.idListaProductos, venta.vendedor.sede.toLocaleLowerCase()).then((datos: ItemDeVentaInterface[]) => {
      console.log(venta);
      venta.listaItemsDeVenta =  datos;
      switch (venta.tipoComprobante) {
        case 'boleta':
          let index = 41;
          const doc = new jsPDF( 'p', 'mm', [45, index  + (venta.listaItemsDeVenta.length * 7) + 7 + 30 + 12]);
          doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
          doc.setFontSize(6);
          doc.setFont('helvetica');
          doc.text(this.nombreEmpresa, 22.5, 12, {align: 'center'});
          doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.direccionCorta, 22.5, 14, {align: 'center'});
          doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.referencia, 22.5, 16, {align: 'center'});
          doc.text('Telefono: ' + GENERAL_CONFIG.sedes[this.sede].direccion.telefono, 22.5, 19, {align: 'center'});
          doc.text('Ruc: ' + this.RUC, 22.5, 21, {align: 'center'});
          doc.text('Boleta de Venta electrónica', 22.5, 25, {align: 'center'});
          // tslint:disable-next-line:max-line-length
          doc.text(venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - venta.numeroComprobante.length)) + venta.numeroComprobante, 22.5, 27, {align: 'center'});
          doc.text(venta.cliente.tipoDoc.toUpperCase() + ': ' + venta.cliente.numDoc , 22.5, 31, {align: 'center'});
          doc.text( 'Cliente: ', 22.5, 33, {align: 'center'});
          if (venta.cliente.nombre.length  >= 40){
            const prue = venta.cliente.nombre.split(' ');
            let contador = 0;
            let count = 0;
            let restante = '';
            let primero = '';
            for (const iterator of prue) {
              count++;
              contador = contador + iterator.length + 1;
              // primero = primero + ' ' + iterator;
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
              // console.log(prueba);
            doc.text((this.convertirMayuscula(venta.cliente.nombre)), 22.5, 35, {align: 'center'});
            }
          // tslint:disable-next-line:max-line-length
          doc.text('Fecha: ' +  venta.fechaEmision + '  ' + 'Hora: ' + venta.horaEmision, 22.5, 39, {align: 'center'});
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
          doc.text(venta.montoNeto.toFixed(2), 43, index + 3, {align: 'right'});
          doc.text('Descuento: S/ ', 35, index + 5, {align: 'right'});
          doc.text(venta.descuentoVenta.toFixed(2), 43, index + 5, {align: 'right'});
          index = index + 4;
          doc.text('ICBP(0.30): S/ ', 35, index + 3, {align: 'right'});
          doc.text((venta.cantidadBolsa * 0.3).toFixed(2), 43, index + 3, {align: 'right'});
          doc.text('Importe Total: S/ ', 35, index + 5, {align: 'right'});
          doc.text(venta.totalPagarVenta.toFixed(2), 43, index + 5, {align: 'right'});
          // doc.text('Vuelto: S/ ', 35, index + 7, {align: 'right'});
          // doc.text(venta.vuelto.toFixed(2), 43, index + 7, {align: 'right'});
          // doc.setFontSize(3.5);
          // doc.text('SON ' + this.NumeroALetras(this.venta.totalPagarVenta), 2, index + 9, {align: 'left'});
          doc.text(MontoALetras(venta.totalPagarVenta), 2, index + 9, {align: 'left'});
          doc.setFontSize(4);
          doc.text('Vendedor: ' + this.convertirMayuscula(venta.vendedor.nombre), 2, index + 11, {align: 'left'});
          // doc.text(this.venta.vendedor.nombre.toUpperCase(), 43, index + 11, {align: 'right'});

          doc.text('Forma de Pago: ' + this.convertirMayuscula(venta.tipoPago) , 2, index + 13, {align: 'left'});
          // doc.text(this.venta.tipoPago.toUpperCase(), 43, index + 13, {align: 'right'});

          // doc.addImage(qr, 'JPEG', 15, index + 14, 15, 15);

          index = index + 30;
          if (venta.estadoVenta === 'anulado'){
            doc.text('===== COMPROBANTE ANULADO  =====', 22.5, index + 2, {align: 'center'});
            index = index + 2;
          }
          doc.setFontSize(4);
          doc.text('Representación impresa del comprobante de pago\r de Venta Electrónica, esta puede ser consultada en\r www.facturaciontooby.web.app/buscar\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
          doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
          doc.save(venta.serieComprobante + '-' + venta.numeroComprobante + '.pdf');
          // doc.autoPrint();
          // window.open(doc.output('bloburl').toString(), '_blank');

          // doc.output('dataurlnewwindow');
          // const canvas = document.getElementById('pdf');
          break;
          case'factura': {
            console.log('es una factura');
            // tslint:disable-next-line:no-shadowed-variable
            let index = 41;
            // tslint:disable-next-line:no-shadowed-variable
            const doc = new jsPDF( 'p', 'mm', [45, index  + (venta.listaItemsDeVenta.length * 7) + 19 + 25 + 12]);
            doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
            doc.setFontSize(6);
            doc.setFont('helvetica');
            doc.text(this.nombreEmpresa, 22.5, 12, {align: 'center'});
            doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.direccionCorta, 22.5, 14, {align: 'center'});
            doc.text(GENERAL_CONFIG.sedes[this.sede].direccion.referencia, 22.5, 16, {align: 'center'});
            doc.text('Telefono: ' + GENERAL_CONFIG.sedes[this.sede].direccion.telefono, 22.5, 19, {align: 'center'});
            doc.text('Ruc: ' + this.RUC, 22.5, 21, {align: 'center'});
            doc.text('Factura de Venta electrónica', 22.5, 25, {align: 'center'});
            // tslint:disable-next-line:max-line-length
            doc.text(venta.serieComprobante + '-' + this.digitosFaltantes('0', (8 - venta.numeroComprobante.length)) + venta.numeroComprobante, 22.5, 27, {align: 'center'});
            doc.text(venta.cliente.tipoDoc.toUpperCase() + ': ' + venta.cliente.numDoc , 22.5, 31, {align: 'center'});
            doc.text( 'Cliente:', 22.5, 33, {align: 'center'});
            // doc.text( this.convertirMayuscula(this.venta.cliente.nombre), 22.5, 35, {align: 'center'});
            if (venta.cliente.nombre.length  >= 40){
              const prue = venta.cliente.nombre.split(' ');
              let contador = 0;
              let count = 0;
              let restante = '';
              let primero = '';
              for (const iterator of prue) {
                count++;
                contador = contador + iterator.length + 1;
                // primero = primero + ' ' + iterator;
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
                // console.log(prueba);
              doc.text((this.convertirMayuscula(venta.cliente.nombre)), 22.5, 35, {align: 'center'});
              }
            // tslint:disable-next-line:max-line-length
            doc.text('Fecha: ' + venta.fechaEmision + '  ' + 'Hora: ' + venta.horaEmision, 22.5, 39, {align: 'center'});
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
            doc.text( (venta.descuentoVenta).toFixed(2), 43, index + 13, {align: 'right'});
            doc.text('I.G.V. (18%)', 2, index + 15, {align: 'left'});
            doc.text( (this.calcularIGVincluido(venta.totalPagarVenta)).toFixed(2), 43, index + 15, {align: 'right'});
            doc.text('ICBP(0.30)', 2, index + 17, {align: 'left'});
            doc.text( (venta.cantidadBolsa * 0.30).toFixed(2), 43, index + 17, {align: 'right'});
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

            // doc.addImage(qr, 'JPEG', 15, index + 10, 15, 15);
            index = index + 25;
            if (venta.estadoVenta === 'anulado'){
              doc.text('===== COMPROBANTE ANULADO  =====', 22.5, index + 2, {align: 'center'});
              index = index + 2;
            }
            doc.setFontSize(4);
            doc.text('Representación impresa del comprobante de pago\r de Factura Electrónica, esta puede ser consultada en\r www.facturaciontooby.web.app/buscar\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
            doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
            // doc.save('tiket' + '.pdf');
            doc.save(venta.serieComprobante + '-' + venta.numeroComprobante + '.pdf');

            // doc.autoPrint();
            // window.open(doc.output('bloburl').toString(), '_blank');
            // doc.output('dataurlnewwindow');
            break;
          }


    }
    });

  }
  obtenerProductosVenta(idVenta: string, sede: string) {
    return this.dataApi.obtenerProductosDeVenta(idVenta, sede).then(datos => {
      console.log('obtenido', datos);
      if (datos.length) {
        return (datos);
      }
    });
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
  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }
}

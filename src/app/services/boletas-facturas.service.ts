import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { VentaInterface } from '../models/venta/venta';
import { formatDate } from '@angular/common';
import { MontoALetras } from 'src/app/global/monto-a-letra';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { DbDataService } from 'src/app/services/db-data.service';



@Injectable({
  providedIn: 'root'
})
export class BoletasFacturasService {
  // Datos de la empresa
  RUC = '20601831032';
  LogoEmpresa = '../../../assets/img/TOOBY LOGO.png';
  valueQR;


  constructor(  private dataApi: DbDataService) { }
  // getImage() {
  //   const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  //   const imageData = canvas.toDataURL('image/jpeg').toString();
  //   return imageData;
  //   }
  generarComprobante(venta: VentaInterface) {
    // const qr = this.getImage();
    // console.log(qr);
    this.obtenerProductosVenta(venta.idListaProductos, venta.vendedor.sede.toLocaleLowerCase()).then((datos: ItemDeVentaInterface[]) => {
      console.log(venta);
      venta.listaItemsDeVenta =  datos;
      switch (venta.tipoComprobante) {
        case 'boleta':
          let index = 41;
          const doc = new jsPDF( 'p', 'mm', [45, index  + (venta.listaItemsDeVenta.length * 7) + 7 + 30 + 12]);
          doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
          doc.setFontSize(6);
          doc.setFont('helvetica');
          doc.text('CLÍNICA VETERINARIA TOOBY E.I.R.L', 22.5, 12, {align: 'center'});
          if (venta.vendedor.sede === 'Andahuaylas') {
          doc.text('Av. Peru 236 Andahuaylas Apurimac ', 22.5, 14, {align: 'center'});
          doc.text('Parque Lampa de Oro ', 22.5, 16, {align: 'center'});

          doc.text('Telefono: 983905066', 22.5, 19, {align: 'center'});
          }
          if (venta.vendedor.sede === 'Abancay') {
            doc.text('Av. Seoane 100 Abancay Apurimac', 22.5, 14, {align: 'center'});
            doc.text('Parque el Olivo', 22.5, 16, {align: 'center'});

            doc.text('Telefono: 988907777', 22.5, 19, {align: 'center'});
            }
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
          doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 39, {align: 'center'});
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
            console.log('es una facura');
            // tslint:disable-next-line:no-shadowed-variable
            let index = 41;
            // tslint:disable-next-line:no-shadowed-variable
            const doc = new jsPDF( 'p', 'mm', [45, index  + (venta.listaItemsDeVenta.length * 7) + 19 + 25 + 12]);
            doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
            doc.setFontSize(6);
            doc.setFont('helvetica');
            doc.text('CLÍNICA VETERINARIA TOOBY E.I.R.L', 22.5, 12, {align: 'center'});
            if (venta.vendedor.sede === 'Andahuaylas') {
            doc.text('Av. Peru 236 Andahuaylas Apurimac ', 22.5, 14, {align: 'center'});
            doc.text('Parque Lampa de Oro ', 22.5, 16, {align: 'center'});

            doc.text('Telefono: 983905066', 22.5, 19, {align: 'center'});
            }
            if (venta.vendedor.sede  === 'Abancay') {
              doc.text('Av. Seoane 100 Abancay Apurimac', 22.5, 14, {align: 'center'});
              doc.text('Parque el Olivo', 22.5, 16, {align: 'center'});

              doc.text('Telefono: 988907777', 22.5, 19, {align: 'center'});
              }
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
            doc.text('Fecha: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en') + '  ' + 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 39, {align: 'center'});
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
            doc.setFontSize(4);
            doc.text('Representación impresa del comprobante de pago\r de Factura Electrónica, esta puede ser consultada en\r www.facturaciontooby.web.app/buscar\rNO ACEPTAMOS DEVOLUCIONES', 22.5, index + 3, {align: 'center'});
            doc.text('GRACIAS POR SU COMPRA', 22.5, index + 10, {align: 'center'});
            // doc.save('tiket' + '.pdf');
            doc.autoPrint();
            window.open(doc.output('bloburl').toString(), '_blank');
            // doc.output('dataurlnewwindow');
            break;
          }


    }
    });

  }
  obtenerProductosVenta(id: string, sede: string) {
    console.log('obteniedo');
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.obtenerProductosDeVenta(id, sede).subscribe(datos => {
        console.log('obtenido', datos);
        if (datos) {
          resolve(datos.productos);
        }
      });
    });
    return promesa;
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

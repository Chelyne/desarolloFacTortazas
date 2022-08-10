import { Injectable } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { formatDate, DatePipe } from '@angular/common';
import { redondeoDecimal } from 'src/app/global/funciones-globales';
import 'jspdf-autotable';
import {UserOptions} from 'jspdf-autotable';
import { jsPDF } from 'jspdf';
import * as moment from 'moment';
import { StorageService } from 'src/app/services/storage.service';
import { DataBaseService } from './data-base.service';
import { GENERAL_CONFIG } from '../../config/generalConfig';
// tslint:disable-next-line:class-name
interface jsPDFWithPlugin extends jsPDF {

  autoTable: (options: UserOptions) => jsPDF;
 }
@Injectable({
  providedIn: 'root',
})

export class ReportesService {
  LogoEmpresa = GENERAL_CONFIG.datosEmpresa.logo;
  RUC = GENERAL_CONFIG.datosEmpresa.ruc;
  nombreEmpresa = GENERAL_CONFIG.datosEmpresa.nombreComercial;

  sede = this.storage.datosAdmi.sede;
  Ingresos = 0;
  Egresos = 0;


  constructor(
              private dataApi: DataBaseService,
              private datePipe: DatePipe,
              private storage: StorageService
  ) {}
  // ------------INICIO REPORTE GENERAL------------
  ReporteVentaDiaGeneralPDF(dia) {
    return this.consultaVentaReporteGeneral(dia).then( (data: any) => {
      console.log('datos Generales', data);
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Reporte General de ventas POS', 120, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(120, 35, 290, 35);
      doc.rect(30, 40, 387, 123); // empty square
      doc.setFontSize(12);
      doc.text( 'Empresa: ' + this.nombreEmpresa + ' ,' + this.sede, 40, 55);
      doc.text( 'RUC: ' + this.RUC, 40, 70);
      doc.text( 'Fecha reporte: ' + dia, 300, 55);
      doc.text( 'Ingresos: ' + this.Ingresos.toFixed(2) , 40, 130);
      doc.text( 'Egresos: ' + this.Egresos.toFixed(2) , 180, 130);
      doc.text( 'Total Venta: ' + data.totalVentas.toFixed(2), 40, 115);
      doc.text( 'Total Anulados: ' + data.totalAnulados.toFixed(2), 180, 115);
      doc.text( 'N° Facturas: ' + data.numFacturas, 40, 85);
      doc.text( 'N° Boletas: ' + data.numBoletas, 180, 85);
      doc.text( 'N° Notas de Venta: ' + data.numNotas, 300, 85);
      doc.text( 'Total Facturas: ' + data.totalFacturas.toFixed(2), 40, 100);
      doc.text( 'Total Boletas: ' + data.totalBoletas.toFixed(2), 180, 100);
      doc.text( 'Total N. Venta: ' + data.totalNotas.toFixed(2), 300, 100);
      doc.setFont('bolditalic', 'bold');
      doc.text( 'Total Efectivo: ' + data.totalEfectivo.toFixed(2) , 40, 145);
      doc.text( 'Total Tarjeta: ' + data.totalTarjeta.toFixed(2) , 180, 145);
      doc.text( 'Total Yape: ' + (data.totalYape).toFixed(2) , 300, 145);
      // tslint:disable-next-line:max-line-length
      doc.text( 'TOTAL CAJA: ' + (data.totalVentas + this.Ingresos - this.Egresos - data.totalTarjeta - data.totalYape).toFixed(2) , 40, 160);

      if (isNullOrUndefined(data.formatoVentasGeneral)) {
      doc.text( 'No se encontraron registros.', 40, 170);
      } else {
        doc.autoTable({
          head: [['#', 'Vend.', 'Tipo Doc.', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Doc.', 'Estado', 'M pago', 'Total']],
          body: data.formatoVentasGeneral,
          startY: 170,
          theme: 'grid',
        });
      }
      window.open(doc.output('bloburl').toString(), '_blank');
      // doc.save('reporte General Ventas ' + dia + '.pdf');
    });
  }
  // ------------FIN REPORTE GENERAL------------
  // ------------INICIO REPORTE GENERAL PDF TICKED FORMATEO-----------
  consultaVentaReporteGeneral(dia: any) {
    this.consultaIngresoEgreso(dia);
    // tslint:disable-next-line:prefer-const
    let datosReporteVentaGeneral = [];

    let totalVentas1 = 0;
    let totalAnulados1 = 0;
    let numBoletas1 = 0;
    let numFacturas1 = 0;
    let numNotas1 = 0;
    let totalBoletas1 = 0;
    let totalFacturas1 = 0;
    let totalNotas1 = 0;
    let totalEfectivo1 = 0;
    let totalETarjeta1 = 0;
    let totalYape1 = 0;
    let boletasAnuladas1 = 0;
    let facturasAnuladas1 = 0;
    let notasAnuladas1 = 0;
    let boletasAnuladasAnuladas1 = 0;
    let facturasAnuladasAnuladas1 = 0;
    let notasAnuladasAnuladas1 = 0;

    const arrayDni  = [];
    const vendedores = [];
    const arrayVendDatos = [];
    return this.dataApi.obtenerVentasPorDia(this.sede.toLowerCase(), dia).then( snapshot => {
      console.log('snapshot', snapshot);
      if (snapshot.length === 0) {
        const juntos = {
          totalVentas: totalVentas1,
          totalAnulados:  totalAnulados1,
          numBoletas : numBoletas1,
          numFacturas : numFacturas1,
          numNotas :  numNotas1,
          totalBoletas : totalBoletas1,
          totalFacturas : totalFacturas1,
          totalNotas : totalNotas1,
          totalEfectivo : totalEfectivo1,
          totalTarjeta : totalETarjeta1,
          totalYape : totalYape1,
          formatoVentasGeneral : null,
          formatoVentasTiked: null,

          boletasAnuladas: boletasAnuladas1,
          facturasAnuladas: facturasAnuladas1,
          notasAnuladas: notasAnuladas1,
          numBoletasAnuladas : boletasAnuladasAnuladas1,
          numFacturasAnuladas : facturasAnuladasAnuladas1,
          numNotasAnuladas :  notasAnuladasAnuladas1,

        };
        return(juntos);
      } else {
        let contador = 0;
        for (const datos of snapshot) {
          contador++;
          let formato: any;
          formato = [
            contador,
            this.convertirMayuscula(datos.vendedor.nombre) || null,
            this.convertirMayuscula(datos.tipoComprobante) || null,
            datos.serieComprobante + '-' + datos.numeroComprobante,
            // tslint:disable-next-line:max-line-length
            datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
            this.convertirMayuscula(datos.cliente.nombre) || null,
            datos.cliente.numDoc || null,
            this.convertirMayuscula(datos.estadoVenta),
            this.convertirMayuscula(datos.tipoPago),
            redondeoDecimal( datos.totalPagarVenta, 2).toFixed(2)
          ];
          datosReporteVentaGeneral.push(formato);

          if (datos.estadoVenta === 'anulado'){
            totalAnulados1 += datos.totalPagarVenta;
            if (datos.tipoComprobante === 'boleta'){
              boletasAnuladasAnuladas1++;
              boletasAnuladas1 = datos.totalPagarVenta;
            }
            if (datos.tipoComprobante === 'factura'){
              facturasAnuladasAnuladas1++;
              facturasAnuladas1 = datos.totalPagarVenta;
            }
            if (datos.tipoComprobante === 'n. venta'){
              notasAnuladasAnuladas1++;
              notasAnuladas1 = datos.totalPagarVenta;
            }
          }else {
            totalVentas1 += datos.totalPagarVenta;
            if (datos.tipoPago === 'efectivo') {
              totalEfectivo1 += datos.totalPagarVenta;
            }
            if (datos.tipoPago === 'tarjeta') {
              totalETarjeta1 += datos.totalPagarVenta;
            }
            if (datos.tipoPago === 'yape') {
              totalYape1 += datos.totalPagarVenta;
            }
          }
          if (datos.tipoComprobante === 'boleta'){
            numBoletas1++;
            if (datos.estadoVenta !== 'anulado'){
              totalBoletas1 += datos.totalPagarVenta;
            }
          }
          if (datos.tipoComprobante === 'factura'){
            numFacturas1++;
            if (datos.estadoVenta !== 'anulado'){
              totalFacturas1 += datos.totalPagarVenta;
            }
          }
          if (datos.tipoComprobante === 'n. venta'){
            numNotas1++;
            if (datos.estadoVenta !== 'anulado'){
              totalNotas1 += datos.totalPagarVenta;
            }
          }
          const dni = datos.vendedor.dni;
          if (typeof(vendedores[dni]) === 'undefined') {
            console.log('no existe aun', vendedores[dni], snapshot);
            vendedores[dni] = {
              montoFinal: 0,
              nombreVendedor: datos.vendedor.nombre,
              totalVentas: 0
            };
            arrayDni.push(dni);
            if (datos.estadoVenta !== 'anulado') {
              vendedores[dni].totalVentas++;
              vendedores[dni].montoFinal += redondeoDecimal( datos.totalPagarVenta, 2);
            }

          }
          else {
            console.log('ya existe solo apila');
            if (datos.estadoVenta !== 'anulado') {
              vendedores[dni].totalVentas++;
              vendedores[dni].montoFinal += redondeoDecimal( datos.totalPagarVenta, 2);
            }

          }
        }
        for (const dni of arrayDni) {
          arrayVendDatos.push(vendedores[dni]);
        }
        console.log('datos Vendedor', arrayVendDatos[0]);
        if (contador === snapshot.length) {
          const juntos = {
            totalVentas: totalVentas1,
            totalAnulados:  totalAnulados1,
            numBoletas : numBoletas1,
            numFacturas : numFacturas1,
            numNotas :  numNotas1,
            totalBoletas : totalBoletas1,
            totalFacturas : totalFacturas1,
            totalNotas : totalNotas1,
            totalEfectivo : totalEfectivo1,
            totalTarjeta : totalETarjeta1,
            totalYape : totalYape1,
            formatoVentasGeneral: datosReporteVentaGeneral,
            formatoVentasTiked: arrayVendDatos,

            boletasAnuladas: boletasAnuladas1,
            facturasAnuladas: facturasAnuladas1,
            notasAnuladas: notasAnuladas1,
            numBoletasAnuladas : boletasAnuladasAnuladas1,
            numFacturasAnuladas : facturasAnuladasAnuladas1,
            numNotasAnuladas :  notasAnuladasAnuladas1,

          };
          return(juntos);
        }
      }
    });
  }
  // ------------FIN REPORTE GENERAL PDF TICKED FORMATEO-----------
  // ------------INICIO REPORTE GENERAL TICKED-----------
  ReporteTiket(dia: any) {
    return this.consultaVentaReporteGeneral(dia).then((data: any) => {
      console.log('lista de ventas', data);
      let index = 0;

      const doc = new jsPDF( 'p', 'mm', [45, 70]);
      doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
      doc.setFontSize(6);
      doc.setFont('helvetica');
      doc.text('Reporte General de ventas POS', 22.5, 12, {align: 'center'});

      doc.text('HORA:' +  formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 17, {align: 'center'});
      doc.text(this.sede, 22.5, 20, {align: 'center'});
      doc.text( 'Fecha Inicio: ', 2 , 23, {align: 'left'});
      doc.text( dia, 43 , 23, {align: 'right'});
      doc.text( 'Fecha Final: ', 2 , 25, {align: 'left'});
      doc.text( dia, 43 , 25, {align: 'right'});
      if (!isNullOrUndefined(data.formatoVentasTiked)) {

      doc.text( '____________________________________', 22.5, 26, {align: 'center'});

      doc.text( 'Cajero. ', 2 , 29, {align: 'left'});
      doc.text( 'Cantidad. ', 22.5 , 29, {align: 'center'});
      doc.text( 'S/. ', 43 , 29, {align: 'right'});
      doc.text( '____________________________________', 22.5, 30, {align: 'center'});
      // tslint:disable-next-line:prefer-const
      index += 31;

      for (const vendedor of data.formatoVentasTiked) {
        console.log('numNotas' , typeof(vendedor.numNotas), vendedor.numNotas);
        console.log('vendedor', vendedor);
        doc.text( vendedor.nombreVendedor, 2 , index + 2, {align: 'left'});
        // tslint:disable-next-line:max-line-length
        doc.text( (vendedor.totalVentas) + '' , 22.5 , index + 2, {align: 'center'});
        doc.text( vendedor.montoFinal.toFixed(2), 43 , index + 2, {align: 'right'});
        index = index + 2;
      }
      doc.text( '____________________________________', 22.5, index + 1 , {align: 'center'});
      doc.text('Tipo', 2, index + 4 , {align: 'left'});
      doc.text( 'Nro. ', 22.5 , index + 4, {align: 'center'});
      doc.text( 'S/. ', 43 , index + 4, {align: 'right'});
      doc.text( '____________________________________', 22.5, index + 5, {align: 'center'});
      doc.text('Facturas', 2, index + 8 , {align: 'left'});
      doc.text( '' + data.numFacturas, 22.5 , index + 8, {align: 'center'});
      doc.text( '' + data.totalFacturas.toFixed(2), 43 , index + 8, {align: 'right'});
      doc.text('Boletas', 2, index + 10 , {align: 'left'});
      doc.text( '' + data.numBoletas, 22.5 , index + 10, {align: 'center'});
      doc.text( '' + data.totalBoletas.toFixed(2), 43 , index + 10, {align: 'right'});
      doc.text('N. venta', 2, index + 12 , {align: 'left'});
      doc.text( '' + data.numNotas, 22.5 , index + 12, {align: 'center'});
      doc.text( '' + data.totalNotas.toFixed(2), 43 , index + 12, {align: 'right'});
      doc.text('Fact. Anuladas', 2, index + 14 , {align: 'left'});
      doc.text( '' + data.numFacturasAnuladas, 22.5 , index + 14, {align: 'center'});
      doc.text( '' + data.facturasAnuladas.toFixed(2), 43 , index + 14, {align: 'right'});
      doc.text('Bol. Anuladas', 2, index + 16 , {align: 'left'});
      doc.text( '' + data.numBoletasAnuladas, 22.5 , index + 16, {align: 'center'});
      doc.text( '' + data.boletasAnuladas.toFixed(2), 43 , index + 16, {align: 'right'});
      doc.text('N.Ventas Anuladas', 2, index + 18 , {align: 'left'});
      doc.text( '' + data.numNotas, 22.5 , index + 18, {align: 'center'});
      doc.text( '' + data.notasAnuladas.toFixed(2), 43 , index + 18, {align: 'right'});
      doc.text( '____________________________________', 22.5, index + 19, {align: 'center'});
      doc.text('Total Efectivo', 2, index + 22 , {align: 'left'});
      doc.text( '' + data.totalEfectivo.toFixed(2), 43 , index + 22, {align: 'right'});
      doc.text('Total Tarjeta', 2, index + 24 , {align: 'left'});
      doc.text( '' + data.totalTarjeta.toFixed(2), 43 , index + 24, {align: 'right'});
      doc.text('Total Yape', 2, index + 26 , {align: 'left'});
      doc.text( '' + data.totalYape.toFixed(2), 43 , index + 26, {align: 'right'});
      doc.text('Total Ventas', 2, index + 28 , {align: 'left'});
      doc.text( '' + data.totalVentas.toFixed(2), 43 , index + 28, {align: 'right'});
      doc.text('Ingresos', 2, index + 30 , {align: 'left'});
      doc.text( '' + this.Ingresos.toFixed(2), 43 , index + 30, {align: 'right'});
      doc.text('Egresos', 2, index + 32 , {align: 'left'});
      doc.text( '' + this.Egresos.toFixed(2), 43 , index + 32, {align: 'right'});
      doc.text( '____________________________________', 22.5, index + 33, {align: 'center'});
      doc.setFontSize(6.5);
      doc.text('TOTAL CAJA: ' + ( data.totalVentas + this.Ingresos - this.Egresos).toFixed(2), 2, index + 36 , {align: 'left'});

      index = index + 37;

      }
      else{
      index += 28;
      doc.text( 'No se encontraron registros ', 2 , 29, {align: 'left'});

      }
      window.open(doc.output('bloburl').toString(), '_blank');
      // doc.save('reporte tiket General Ventas ' + dia + '.pdf');
      });
  }
  // ------------FIN REPORTE GENERAL TICKED-----------
  // ------------INICIO REPORTE INGRESOS EGRESOS GENERAL------------
  ReportePDFDiaIngresoEgreso(dia: any){
    return this.consultaIngresoEgreso(dia).then((data: any) => {
      console.log('datos', data);
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Reporte de Ingresos y Egresos', 120, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(120, 35, 290, 35);
      doc.rect(30, 40, 387, 60); // empty square
      doc.setFontSize(12);
      doc.text( 'Empresa: ' + this.nombreEmpresa + ' ,' + this.sede, 40, 55);
      doc.text( 'RUC: ' + this.RUC, 40, 70);
      doc.setFontSize(12);
      doc.text( 'Fecha reporte: ' + dia, 300, 55);
      doc.text( 'Ingresos: ' + this.Ingresos.toFixed(2)  , 40, 85);
      doc.text( 'Egresos: ' + this.Egresos.toFixed(2) , 180, 85);
      if (isNullOrUndefined(data)) {
        doc.text( 'No se encontraron registros.', 40, 115);
        } else {
          doc.autoTable({
            head: [['#', 'Nombre', 'Dni', 'Tipo', 'Detalles', 'Monto']],
            body: data,
            startY: 115 ,
            theme: 'grid',
          });
        }
      // doc.save('reporteIngresoEgreso ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
      window.open(doc.output('bloburl').toString(), '_blank');

    });
  }

  consultaIngresoEgreso(dia) {
    this.Ingresos = 0;
    this.Egresos = 0;
    // tslint:disable-next-line:prefer-const
    let datosEgresoIngreso = [];

    return this.dataApi.obtenerIngresoEgresoDia(this.sede.toLowerCase(), dia).then( snapshot => {
      console.log('Ingresos  y Egresos', snapshot);
      if (snapshot.length === 0) {
        this.Ingresos = 0;
        this.Egresos = 0;
        datosEgresoIngreso = null;
        return null;
      } else {
        let contador = 0;
        for (const datos of snapshot) {
          contador++;
          if (datos.tipo === 'ingreso'){
            this.Ingresos += parseFloat(datos.monto);
            console.log(parseFloat(datos.monto));
          }
          if (datos.tipo === 'egreso'){
            this.Egresos += parseFloat(datos.monto);
          }
          let formato: any;
          formato = [
            contador,
            datos.nombreVendedor ? datos.nombreVendedor.toUpperCase() : null,
            datos.dniVendedor ? datos.dniVendedor.toUpperCase() : null,
            datos.tipo.toUpperCase(),
            datos.detalles.toUpperCase(),
            datos.monto
            ];
          datosEgresoIngreso.push(formato);
        }
        console.log(this.Ingresos, this.Egresos);
        return datosEgresoIngreso;
      }
    });
  }
  // ------------FIN INGRESOS EGRESOS GENERAL------------
  // ------------INICIO REPORTE INGRESOS EGRESOS POR VENDEDOR------------
  ReportePDFDiaIngresoEgresoVendedor(dia: any, dniVendedor, nombreVendedor){
    this.consultaIngresoEgresoVendedor(dia, dniVendedor).then((data: any) => {
      console.log('datos', data);
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Reporte de Ingresos y Egresos ' + this.convertirMayuscula(nombreVendedor), 120, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(120, 35, 290, 35);
      doc.rect(30, 40, 387, 60); // empty square
      doc.setFontSize(12);
      doc.text( 'Empresa: ' + this.nombreEmpresa + ' - ' + this.sede.toUpperCase(), 40, 55);
      doc.text( 'RUC: ' + this.RUC, 40, 70);
      doc.setFontSize(12);
      doc.text( 'Fecha reporte: ' + dia, 300, 70);
      doc.text( 'Ingresos: ' + data.ingresosVend.toFixed(2)  , 40, 85);
      doc.text( 'Egresos: ' + data.egresosVend.toFixed(2) , 180, 85);
      if (isNullOrUndefined(data.FormatoIngresoEgresoVend)) {
        doc.text( 'No se encontraron registros.', 40, 115);
        } else {
          doc.autoTable({
            head: [['#', 'Dni', 'Nombre', 'Tipo', 'Detalles', 'Monto']],
            body: data.FormatoIngresoEgresoVend,
            startY: 115 ,
            theme: 'grid',
          });
        }
      window.open(doc.output('bloburl').toString(), '_blank');
      // doc.save('reporteIngresoEgreso ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }
  consultaIngresoEgresoVendedor(dia, dniVendedor) {
    let IngresosVend = 0;
    let EgresosVend = 0;
    let datosFormatoIngresoEgresoVend = [];
    return this.dataApi.obtenerIngresoEgresoDiaVendedor(this.sede.toLowerCase(), dia, dniVendedor).then( snapshot => {
      console.log('snapshot', snapshot);
      if (snapshot.length === 0) {
        IngresosVend = 0;
        EgresosVend = 0;
        const juntos = {
          ingresosVend: 0,
          egresosVend:  0,
          FormatoIngresoEgresoVend: null
        };
        return juntos;
      } else {
        datosFormatoIngresoEgresoVend = [];
        let contador = 0;
        for (const datos of snapshot) {
          if (datos.tipo === 'ingreso'){
            IngresosVend += parseFloat(datos.monto);
          }
          if (datos.tipo === 'egreso'){
            EgresosVend += parseFloat(datos.monto);
          }
          contador++;
          let formato: any;
          formato = [
            contador,
            datos.nombreVendedor ? datos.nombreVendedor.toUpperCase() : null,
            datos.dniVendedor ? datos.dniVendedor.toUpperCase() : null,
            datos.tipo ? datos.tipo.toUpperCase() : null,
            datos.detalles ? datos.detalles.toUpperCase() : null,
            datos.monto ? parseFloat(datos.monto).toFixed(2) : '0.00',
          ];
          datosFormatoIngresoEgresoVend.push(formato);
        }
        const juntos = {
          ingresosVend: IngresosVend,
          egresosVend:  EgresosVend,
          FormatoIngresoEgresoVend: datosFormatoIngresoEgresoVend
        };
        return juntos;
      }
    });

  }
  // ------------FIN REPORTE INGRESOS EGRESOS POR VENDEDOR------------


  convertirMayuscula(letra: string) {
    const textoAreaDividido = letra.split(' ');
    let letraCompleta = '';
    for (const iterator of textoAreaDividido) {
      letraCompleta = letraCompleta + iterator.charAt(0).toUpperCase() + iterator.slice(1) + ' ';
    }
    return letraCompleta;
  }


}

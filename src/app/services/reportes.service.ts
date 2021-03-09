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
import { GENERAL_CONFIG } from '../../config/apiPeruConfig';
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
  nombreEmpresa = GENERAL_CONFIG.datosEmpresa.razon_social;

  sede = this.storage.datosAdmi.sede;
  Ingresos = 0;
  Egresos = 0;
  datosReporteVentaGeneral = [];


  constructor(
              private dataApi: DataBaseService,
              private datePipe: DatePipe,
              private storage: StorageService
  ) {}
  ReporteVentaDiaGeneralPDF(dia) {
    this.consultaVentaReporteGeneral(dia).then( (data: any) => {
      console.log('datos', data);
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Reporte General de ventas POS', 120, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(120, 35, 290, 35);
      doc.rect(30, 40, 387, 115); // empty square
      doc.setFontSize(12);
      doc.text( 'Empresa:', 40, 55);
      doc.text( 'RUC:', 40, 70);
      doc.text( this.nombreEmpresa + ' ,' + this.sede, 75, 55);
      doc.text( this.RUC, 64, 70);
      doc.setFontSize(12);
      doc.text( 'Fecha reporte:', 300, 55);
      doc.text( dia, 355, 55);
      let totalVentas = 0;
      let totalAnulados = 0;
      let numBoletas = 0;
      let numFacturas = 0;
      let numNotas = 0;
      let totalBoletas = 0;
      let totalFacturas = 0;
      let totalNotas = 0;
      let totalEfectivo = 0;
      let totalETarjeta = 0;
      doc.text( 'Ingresos: ' + this.Ingresos.toFixed(2) , 40, 130);
      doc.text( 'Egresos: ' + this.Egresos.toFixed(2) , 180, 130);
      if (isNullOrUndefined(data)) {
      doc.text( 'TOTAL CAJA: ' + (totalVentas + this.Ingresos - this.Egresos - totalETarjeta).toFixed(2) , 300, 145);
      doc.text( 'Total Venta: ' + totalVentas.toFixed(2), 40, 115);
      doc.text( 'Total Anulados: ' + totalAnulados.toFixed(2), 180, 115);
      doc.text( 'N° Facturas: ' + numFacturas, 40, 85);
      doc.text( 'N° Boletas: ' + numBoletas, 180, 85);
      doc.text( 'N° Notas de Venta: ' + numNotas, 300, 85);
      doc.text( 'Total Facturas: ' + totalFacturas.toFixed(2), 40, 100);
      doc.text( 'Total Boletas: ' + totalBoletas.toFixed(2), 180, 100);
      doc.text( 'Total N. Venta: ' + totalNotas.toFixed(2), 300, 100);
      doc.text( 'Total Efectivo: ' + totalEfectivo.toFixed(2) , 40, 145);
      doc.text( 'Total Tarjeta: ' + totalETarjeta.toFixed(2) , 180, 145);
      doc.text( 'No se encontraron registros.', 40, 165);
      } else {
        for (const item of data) {
          if (item.estadoVenta === 'anulado'){
            totalAnulados += item.totalPagarVenta;
          }else {
            totalVentas += item.totalPagarVenta;
            if (item.tipoPago === 'efectivo') {
              totalEfectivo += item.totalPagarVenta;
            }
            if (item.tipoPago === 'tarjeta') {
              totalETarjeta += item.totalPagarVenta;
            }
          }
          if (item.tipoComprobante === 'boleta'){
            numBoletas++;
            if (item.estadoVenta !== 'anulado'){
              totalBoletas += item.totalPagarVenta;
            }
          }
          if (item.tipoComprobante === 'factura'){
            numFacturas++;
            if (item.estadoVenta !== 'anulado'){
              totalFacturas += item.totalPagarVenta;
            }
          }
          if (item.tipoComprobante === 'n. venta'){
            numNotas++;
            if (item.estadoVenta !== 'anulado'){
              totalNotas += item.totalPagarVenta;
            }
          }
        }
        doc.setFont('Arial');
        doc.text( 'Total Venta: ' + totalVentas.toFixed(2), 40, 115);
        doc.text( 'Total Anulados: ' + totalAnulados.toFixed(2), 180, 115);
        doc.text( 'N° Facturas: ' + numFacturas, 40, 85);
        doc.text( 'N° Boletas: ' + numBoletas, 180, 85);
        doc.text( 'N° Notas de Venta: ' + numNotas, 300, 85);
        doc.text( 'Total Facturas: ' + totalFacturas.toFixed(2), 40, 100);
        doc.text( 'Total Boletas: ' + totalBoletas.toFixed(2), 180, 100);
        doc.text( 'Total N. Venta: ' + totalNotas.toFixed(2), 300, 100);
        doc.text( 'Total Efectivo: ' + totalEfectivo.toFixed(2) , 40, 145);
        doc.text( 'Total Tarjeta: ' + totalETarjeta.toFixed(2) , 180, 145);
        doc.text( 'TOTAL CAJA: ' + (totalVentas + this.Ingresos - this.Egresos - totalETarjeta).toFixed(2) , 300, 145);
        doc.autoTable({
          head: [['#', 'Tip. Trans.', 'Tipo Doc.', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Doc.', 'Estado', 'M pago', 'Total']],
          body: this.datosReporteVentaGeneral,
          startY: 165,
          theme: 'grid',
        });
      }
      doc.save('reporte General Ventas ' + dia + '.pdf');
    });
  }
  consultaVentaReporteGeneral(dia: any) {
    this.consultaIngresoEgreso(dia);
    let productosArray;
    return this.dataApi.obtenerVentasPorDia(this.sede.toLowerCase(), dia).then( snapshot => {
      console.log('snapshot', snapshot);
      if (snapshot.length === 0) {
        this.datosReporteVentaGeneral = null;
        productosArray = null;
        return(productosArray);
      } else {
        productosArray = snapshot;
        this.datosReporteVentaGeneral = [];
        let contador = 0;
        for (const datos of snapshot) {
          contador++;
          let formato: any;
          formato = [
            contador,
           'Venta',
           datos.tipoComprobante.toUpperCase() || null,
           datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,
           // tslint:disable-next-line:max-line-length
           datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
           datos.cliente.nombre.toUpperCase() || null,
           datos.cliente.numDoc || null,
           this.convertirMayuscula(datos.estadoVenta),
           this.convertirMayuscula(datos.tipoPago),
           redondeoDecimal( datos.totalPagarVenta, 2).toFixed(2)
          ];
          this.datosReporteVentaGeneral.push(formato);
        }
        return(productosArray);
      }
    });
  }

  ReporteTiket(dia: any) {
    this.listaVendedoresDatos(dia).then((data: any) => {
      console.log('lista de vendedores', data);
      let index = 0;

      const doc = new jsPDF( 'p', 'mm', [45, 70]);
      doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
      doc.setFontSize(6);
      doc.setFont('helvetica');
      // doc.text('CLINICA VETERINARIA TOOBY', 22.5, 12, {align: 'center'});
      // doc.text('CUADRE PARCIAL Nro. ' + formatDate(new Date(), 'dd-MM', 'en'), 22.5, 16, {align: 'center'});
      doc.text('Reporte General de ventas POS', 22.5, 12, {align: 'center'});

      doc.text('HORA:' +  formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 17, {align: 'center'});
      doc.text(this.sede, 22.5, 20, {align: 'center'});
      // tslint:disable-next-line:max-line-length
      doc.text( 'Fecha Inicio: ', 2 , 23, {align: 'left'});
      doc.text( dia, 43 , 23, {align: 'right'});

      doc.text( 'Fecha Final: ', 2 , 25, {align: 'left'});
      doc.text( dia, 43 , 25, {align: 'right'});
      if (data) {

      doc.text( '____________________________________', 22.5, 26, {align: 'center'});

      doc.text( 'Cajero. ', 2 , 29, {align: 'left'});
      doc.text( 'Cantidad. ', 22.5 , 29, {align: 'center'});
      doc.text( 'S/. ', 43 , 29, {align: 'right'});
      doc.text( '____________________________________', 22.5, 30, {align: 'center'});
      // tslint:disable-next-line:prefer-const
      index += 31;
      let montoFinal = 0;
      let numFacturas = 0;
      let numBoletas = 0;
      let numNotas = 0;
      let totalNotas = 0;
      let FacAnulada = 0;
      let BolAnuladas = 0;
      let NotasAnuladas = 0; // notas anuladas
      let MontoFacAnulado = 0;
      let montoBolAnulado = 0;
      let montoNotasAnulado = 0; // inicializar monto notas anuladas
      let montoBoleta = 0;
      let montoFactura = 0;
      let montoTarjeta = 0;
      let montoEfectivo = 0;

      for (const vendedor of data) {
        console.log('numNotas' , typeof(vendedor.numNotas), vendedor.numNotas);
        montoFinal += vendedor.montoFinal;
        numFacturas += vendedor.numFacturas;
        numBoletas += vendedor.numBoletas;
        numNotas += vendedor.numNotas;
        totalNotas += vendedor.totalNotas;
        FacAnulada += vendedor.FacAnuladas;
        BolAnuladas += vendedor.BolAnuladas;
        NotasAnuladas += vendedor.NotasAnuladas; // notas anuladas
        MontoFacAnulado += vendedor.MontoFacAnulado;
        montoBolAnulado += vendedor.montoBolAnulado;
        montoNotasAnulado += vendedor.montoNotasAnulado; // monto notas anuladas
        montoBoleta += vendedor.montoBoleta;
        montoFactura += vendedor.montoFactura;
        montoTarjeta += vendedor.montoTarjeta;
        montoEfectivo += vendedor.montoEfectivo;
        console.log('vendedor', vendedor);
        doc.text( vendedor.nombreVendedor, 2 , index + 2, {align: 'left'});
        // tslint:disable-next-line:max-line-length
        doc.text( (vendedor.numFacturas + vendedor.numBoletas + vendedor.numNotas) + '' , 22.5 , index + 2, {align: 'center'});
        doc.text( vendedor.montoFinal.toFixed(2), 43 , index + 2, {align: 'right'});
        index = index + 2;
      }
      doc.text( '____________________________________', 22.5, index + 1 , {align: 'center'});
      doc.text('Tipo', 2, index + 4 , {align: 'left'});
      doc.text( 'Nro. ', 22.5 , index + 4, {align: 'center'});
      doc.text( 'S/. ', 43 , index + 4, {align: 'right'});
      doc.text( '____________________________________', 22.5, index + 5, {align: 'center'});
      doc.text('Facturas', 2, index + 8 , {align: 'left'});
      doc.text( '' + numFacturas, 22.5 , index + 8, {align: 'center'});
      doc.text( '' + montoFactura.toFixed(2), 43 , index + 8, {align: 'right'});
      doc.text('Boletas', 2, index + 10 , {align: 'left'});
      doc.text( '' + numBoletas, 22.5 , index + 10, {align: 'center'});
      doc.text( '' + montoBoleta.toFixed(2), 43 , index + 10, {align: 'right'});
      doc.text('N. venta', 2, index + 12 , {align: 'left'});
      doc.text( '' + numNotas, 22.5 , index + 12, {align: 'center'});
      doc.text( '' + totalNotas.toFixed(2), 43 , index + 12, {align: 'right'});
      doc.text('Fact. Anuladas', 2, index + 14 , {align: 'left'});
      doc.text( '' + FacAnulada, 22.5 , index + 14, {align: 'center'});
      doc.text( '' + MontoFacAnulado.toFixed(2), 43 , index + 14, {align: 'right'});
      doc.text('Bol. Anuladas', 2, index + 16 , {align: 'left'});
      doc.text( '' + BolAnuladas, 22.5 , index + 16, {align: 'center'});
      doc.text( '' + montoBolAnulado.toFixed(2), 43 , index + 16, {align: 'right'});
      doc.text('N.Ventas Anuladas', 2, index + 18 , {align: 'left'});
      doc.text( '' + NotasAnuladas, 22.5 , index + 18, {align: 'center'});
      doc.text( '' + montoNotasAnulado.toFixed(2), 43 , index + 18, {align: 'right'});
      doc.text( '____________________________________', 22.5, index + 19, {align: 'center'});
      doc.text('Total Efectivo', 2, index + 22 , {align: 'left'});
      doc.text( '' + montoEfectivo.toFixed(2), 43 , index + 22, {align: 'right'});
      doc.text('Total Tarjeta', 2, index + 24 , {align: 'left'});
      doc.text( '' + montoTarjeta.toFixed(2), 43 , index + 24, {align: 'right'});
      doc.text('Total Ventas', 2, index + 26 , {align: 'left'});
      doc.text( '' + montoFinal.toFixed(2), 43 , index + 26, {align: 'right'});
      doc.text('Ingresos', 2, index + 28 , {align: 'left'});
      doc.text( '' + this.Ingresos.toFixed(2), 43 , index + 28, {align: 'right'});
      doc.text('Egresos', 2, index + 30 , {align: 'left'});
      doc.text( '' + this.Egresos.toFixed(2), 43 , index + 30, {align: 'right'});
      doc.text( '____________________________________', 22.5, index + 31, {align: 'center'});
      doc.setFontSize(6.5);
      doc.text('TOTAL CAJA: ' + ( montoFinal + this.Ingresos - this.Egresos).toFixed(2), 2, index + 34 , {align: 'left'});

      index = index + 35;

      }
      else{
      index += 28;
      doc.text( 'No se encontraron registros ', 2 , 29, {align: 'left'});

      }
      doc.save('reporte tiket General Ventas ' + dia + '.pdf');
      doc.autoPrint();
      });
  }
  listaVendedoresDatos(dia: any) {
    const arrayDni  = [];
    const vendedores = [];
    const arrayVendDatos = [];
    return this.consultaVentaReporteGeneral(dia).then((res: any) => {
      console.log(res);
      if (!isNullOrUndefined(res)) {
        console.log('datos de ventas generales', res);
        let contador = 0;
        for (const venta of res) {
          contador ++;
          const dni = venta.vendedor.dni;
          if (typeof(vendedores[dni]) === 'undefined') {
            vendedores[dni] = {
              montoFinal: 0,
              montoTarjeta: 0,
              montoEfectivo: 0,
              nombreVendedor: venta.vendedor.nombre,
              numFacturas: 0,
              numBoletas: 0,
              numNotas: 0,
              numAnulados: 0,
              totalDescuentos: 0,
              montoAnulado: 0,
              montoBoleta: 0,
              montoFactura: 0,
              FacAnuladas: 0,
              BolAnuladas: 0,
              NotasAnuladas: 0,
              MontoFacAnulado: 0,
              montoBolAnulado: 0,
              montoNotasAnulado: 0,
              totalNotas: 0
            };
            arrayDni.push(dni);
            if (venta.tipoPago === 'efectivo' && venta.estadoVenta !== 'anulado') {
              vendedores[dni].montoEfectivo += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoPago === 'tarjeta' && venta.estadoVenta !== 'anulado') {
              vendedores[dni].montoTarjeta += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoComprobante === 'factura' && venta.estadoVenta === 'anulado') {
              vendedores[dni].FacAnuladas += 1;
              vendedores[dni].MontoFacAnulado += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoComprobante === 'boleta' && venta.estadoVenta === 'anulado') {
              vendedores[dni].BolAnuladas += 1;
              vendedores[dni].montoBolAnulado += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoComprobante === 'n. venta' && venta.estadoVenta === 'anulado') {
              vendedores[dni].NotasAnuladas += 1;
              vendedores[dni].montoNotasAnulado += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoComprobante === 'boleta') {vendedores[dni].numBoletas += 1; }
            if (venta.tipoComprobante === 'factura') {vendedores[dni].numFacturas += 1; }
            if (venta.tipoComprobante === 'n. venta') {
              vendedores[dni].numNotas += 1;
              vendedores[dni].totalNotas += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.descuentoVenta) {
              vendedores[dni].totalDescuentos += redondeoDecimal(venta.descuentoVenta, 2);
            }
            if (venta.estadoVenta !== 'anulado') {
              vendedores[dni].montoFinal += redondeoDecimal( venta.totalPagarVenta, 2);
              if (venta.tipoComprobante === 'boleta') {redondeoDecimal(vendedores[dni].montoBoleta += venta.totalPagarVenta, 2); }
              if (venta.tipoComprobante === 'factura') {redondeoDecimal(vendedores[dni].montoFactura += venta.totalPagarVenta, 2 ); }
            }else {
              vendedores[dni].numAnulados += 1;
              vendedores[dni].montoAnulado += redondeoDecimal( venta.totalPagarVenta, 2);
            }

          }
          else {
            if (venta.tipoPago === 'efectivo' && venta.estadoVenta !== 'anulado') {
              vendedores[dni].montoEfectivo += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoPago === 'tarjeta' && venta.estadoVenta !== 'anulado') {
              vendedores[dni].montoTarjeta += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoComprobante === 'factura' && venta.estadoVenta === 'anulado') {
              vendedores[dni].FacAnuladas += 1;
              vendedores[dni].MontoFacAnulado += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoComprobante === 'boleta' && venta.estadoVenta === 'anulado') {
              vendedores[dni].BolAnuladas += 1;
              vendedores[dni].montoBolAnulado += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.tipoComprobante === 'boleta') {vendedores[dni].numBoletas += 1; }
            if (venta.tipoComprobante === 'factura') {vendedores[dni].numFacturas += 1; }
            if (venta.tipoComprobante === 'n. venta') {
              vendedores[dni].numNotas += 1;
              vendedores[dni].totalNotas += redondeoDecimal( venta.totalPagarVenta, 2);
            }
            if (venta.descuentoVenta) {
              vendedores[dni].totalDescuentos += redondeoDecimal(venta.descuentoVenta, 2);
            }
            if (venta.estadoVenta !== 'anulado') {
              vendedores[dni].montoFinal += redondeoDecimal( venta.totalPagarVenta, 2);
              if (venta.tipoComprobante === 'boleta') {redondeoDecimal(vendedores[dni].montoBoleta += venta.totalPagarVenta, 2); }
              if (venta.tipoComprobante === 'factura') {redondeoDecimal(vendedores[dni].montoFactura += venta.totalPagarVenta, 2 ); }
            }else {
              vendedores[dni].numAnulados += 1;
              vendedores[dni].montoAnulado += redondeoDecimal( venta.totalPagarVenta, 2);
            }
          }
          console.log('vendedores', vendedores);
          console.log('array dni', arrayDni);

        }
        for (const dni of arrayDni) {
          arrayVendDatos.push(vendedores[dni]);
        }
        console.log('datos Vendedor', arrayVendDatos[0]);
        if (contador === res.length) {
          return(arrayVendDatos);
        }
      }else {
        console.log('no hay datos que mostrar');
        return (null);
      }
    });
  }

  ReportePDFDiaIngresoEgreso(dia: any){
    this.consultaIngresoEgreso(dia).then((data: any) => {
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
      doc.text( 'Empresa:', 40, 55);
      doc.text( 'RUC:', 40, 70);
      doc.text( this.nombreEmpresa + ' ,' + this.sede, 75, 55);
      doc.text( this.RUC, 64, 70);
      doc.setFontSize(12);
      doc.text( 'Fecha reporte:', 300, 55);
      doc.text( dia, 355, 55);
      if (isNullOrUndefined(data)) {
        doc.text( 'No se encontraron registros.', 40, 115);
        } else {
          let ingreso = 0;
          let egreso = 0;
          let contador = 0;
          // tslint:disable-next-line:prefer-const
          let datosEgresoIngreso = [];
          for (const item of data) {
            contador++;
            if (item.tipo === 'ingreso'){
              ingreso += Number(item.monto);
              console.log(Number(item.monto));
            }
            if (item.tipo === 'egreso'){
              egreso += Number(item.monto);
            }
            let formato: any;
            formato = [
              contador,
              item.tipo.toUpperCase(),
              item.detalles.toUpperCase(),
              item.monto
            ];
            datosEgresoIngreso.push(formato);

          }
          doc.text( 'Ingresos: ' + ingreso.toFixed(2)  , 40, 85);
          doc.text( 'Egresos: ' + egreso.toFixed(2) , 180, 85);
          doc.autoTable({
            head: [['#', 'Tipo', 'Detalles', 'Monto']],
            body: datosEgresoIngreso,
            startY: 115 ,
            theme: 'grid',
          });
        }
      doc.save('reporteIngresoEgreso ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }

  consultaIngresoEgreso(dia) {
    this.Ingresos = 0;
    this.Egresos = 0;
    return this.dataApi.obtenerIngresoEgresoDia(this.sede.toLowerCase(), dia).then( snapshot => {
      console.log('snapshot', snapshot);
      if (snapshot.length === 0) {
        this.Ingresos = 0;
        this.Egresos = 0;
        throw null;
      } else {
        for (const datos of snapshot) {
          if (datos.tipo === 'ingreso'){
            this.Ingresos += parseFloat(datos.monto);
            console.log(parseFloat(datos.monto));
          }
          if (datos.tipo === 'egreso'){
            this.Egresos += parseFloat(datos.monto);
          }
        }
        console.log(this.Ingresos, this.Egresos);
        return snapshot;
      }
    });

  }

  convertirMayuscula(letra: string) {
    return letra.charAt(0).toUpperCase() + letra.slice(1);
  }

  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }

}

import { Component, OnInit, ɵConsole } from '@angular/core';
import { MenuController, ModalController, AlertController, ToastController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbrirCerrarCajaPage } from '../../modals/abrir-cerrar-caja/abrir-cerrar-caja.page';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from '../../services/storage.service';
import * as moment from 'moment';
import { DatePipe, formatDate } from '@angular/common';
import { ExportarPDFService } from '../../services/exportar-pdf.service';
// pdf
// import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import {UserOptions} from 'jspdf-autotable';
// import domtoimage from 'dom-to-image';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { isNullOrUndefined } from 'util';
import { CajaChicaInterface } from '../../models/CajaChica';
import { jsPDF } from 'jspdf';
import { redondeoDecimal } from 'src/app/global/funciones-globales';
// tslint:disable-next-line:class-name
interface jsPDFWithPlugin extends jsPDF {

  autoTable: (options: UserOptions) => jsPDF;
 }

@Component({
  selector: 'app-caja-chica',
  templateUrl: './caja-chica.page.html',
  styleUrls: ['./caja-chica.page.scss'],
  providers: [
    DatePipe
  ]
})
export class CajaChicaPage implements OnInit {
  buscando: boolean;
  sede;
  LogoEmpresa = '../../../assets/img/TOOBY LOGO.png';
  RUC = '20601831032';
  listaCajaChica;

  sinResultados: string;
  lastDocument: any = null;
  firtDocument: any = null;
  datosReporteVentaGeneral = [];
  datosReportePuntoVentaVendedor = [];
  datosReporteIngresoPagoVendedorDia = [];
  totalEfectivo = 0;
  totalTargeta = 0;
  totalGeneral = 0;

  productosArray;
  contadorConsultaProdcutos = 0;
  apilados = [];
  constructor(private menuCtrl: MenuController,
              private router: Router,
              private afs: AngularFirestore,
              private excelService: ExportarPDFService,
              private alertCtrl: AlertController,
              private dataApi: DbDataService,
              private storage: StorageService,
              private datePipe: DatePipe,
              private toastController: ToastController,
              private popoverCtrl: PopoverController,
              private modalController: ModalController) {
                this.sede = this.storage.datosAdmi.sede;
                this.listaCajaChicaSede(this.sede);
                // this.pruebaPaginacion();

              }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }
  ReporteVentaDiaGeneralPDF() {
    this.consultaVentaReporteGeneral().then( (data: any) => {
      console.log('datos', data);
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Reporte General de ventas POS', 120, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(120, 35, 290, 35);
      doc.rect(30, 40, 387, 85); // empty square
      doc.setFontSize(12);
      doc.text( 'Empresa:', 40, 55);
      doc.text( 'RUC:', 40, 70);
      doc.text( 'Veterinarias Tooby ,' + this.sede, 75, 55);
      doc.text( this.RUC, 64, 70);
      doc.setFontSize(12);
      doc.text( 'Fecha reporte:', 300, 55);
      doc.text( formatDate(new Date(), 'dd-MM-yyyy', 'en'), 355, 55);
      let totalVentas = 0;
      let totalAnulados = 0;
      let numBoletas = 0;
      let numFacturas = 0;
      let numNotas = 0;
      let totalBoletas = 0;
      let totalFacturas = 0;
      let totalNotas = 0;
      if (isNullOrUndefined(data)) {
      doc.text( 'No se encontraron registros.', 40, 135);
      } else {
        for (const item of data) {
          if (item.estadoVenta === 'anulado'){
            totalAnulados += item.totalPagarVenta;
          }else {
            totalVentas += item.totalPagarVenta;
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
        doc.text( 'Total Venta: ' + totalVentas.toFixed(2), 40, 115);
        doc.text( 'Total Anulados: ' + totalAnulados.toFixed(2), 180, 115);
        doc.text( 'N° Facturas: ' + numFacturas, 40, 85);
        doc.text( 'N° Boletas: ' + numBoletas, 180, 85);
        doc.text( 'N° Notas de Venta: ' + numNotas, 300, 85);
        doc.text( 'Total Facturas: ' + totalFacturas.toFixed(2), 40, 100);
        doc.text( 'Total Boletas: ' + totalBoletas.toFixed(2), 180, 100);
        doc.text( 'Total N. Venta: ' + totalNotas.toFixed(2), 300, 100);
        doc.autoTable({
          // tslint:disable-next-line:max-line-length
          head: [['#', 'Tipo transacción', 'Tipo Doc.', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Doc.', 'Estado', 'Total']],
          body: this.datosReporteVentaGeneral,
          startY: 135,
          theme: 'grid',
          // foot:  [['ID', 'Name', 'Country']],
        });
      }
      doc.save('reporte General Ventas ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }
  consultaVentaReporteGeneral() {
    // tslint:disable-next-line:prefer-const
    let productosArray;
    const dia = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.ObtenerReporteVentaGeneralDia (this.sede.toLowerCase(), dia).subscribe( snapshot => {
        console.log('snapshot', snapshot);
        if (snapshot.length === 0) {
          this.datosReporteVentaGeneral = null;
          productosArray = null;
          resolve(productosArray);
        } else {
          productosArray = snapshot;
          this.datosReporteVentaGeneral = [];
          let contador = 0;
          for (const datos of snapshot) {
            contador++;
            // console.log(doc.id, '=>', doc.data());
            let formato: any;
            formato = [
              contador,
             'Venta',
             datos.tipoComprobante.toUpperCase() || null,
             datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,
             datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
             datos.cliente.nombre.toUpperCase() || null,
             datos.cliente.numDoc || null,
             datos.estadoVenta,
             redondeoDecimal( datos.totalPagarVenta, 2).toFixed(2)
            ];
            this.datosReporteVentaGeneral.push(formato);
          }
          resolve(productosArray);
        }
      });
    });
    return promesa;
  }
  ReportePuntoVenta(datosCaja: CajaChicaInterface) {
    console.log('fecha consulta', datosCaja.FechaConsulta , ' dni', datosCaja.dniVendedor);
    this.ConsultaPuntoVentaVendedor(datosCaja.FechaConsulta, datosCaja.dniVendedor).then((data: any) => {
      console.log(data);
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;

      doc.setFontSize(18);
      doc.setFont('bold');
      doc.text('Reporte Punto de Venta', 120, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(110, 35, 280, 35);
      doc.rect(30, 50, 387, 80); // empty square
      doc.setFontSize(12);

      doc.text( 'Empresa:', 40, 60);
      doc.text( 'RUC:', 40, 70);
      doc.text( 'Vendedor:', 40, 80);
      doc.text( 'Estado de Caja:', 40, 90);
      doc.text( 'Montos de operación:', 40, 100);
      doc.text( 'Saldo inicial:', 40, 110);
      doc.text( 'Saldo final:', 40, 120);

      doc.setFontSize(11);
      // doc.setFont('default');
      doc.text( 'Veterinarias Tooby', 75, 60);
      doc.text( this.RUC, 64, 70);
      doc.text( datosCaja.nombreVendedor.toUpperCase(), 81, 80);
      doc.text( datosCaja.estado, 98, 90);
      doc.text( 'S./ ' + datosCaja.saldoInicial.toFixed(2), 90, 110);
      doc.text( 'S./ ' + datosCaja.saldoFinal.toFixed(2), 90, 120);

      doc.setFontSize(12);
      doc.text( 'Fecha reporte:', 185, 60);
      doc.text( 'Establecimiento:', 185, 70);
      doc.text( 'Fecha y hora apertura:', 185, 80);
      doc.text( 'Fecha y hora cierre:', 185, 90);
      doc.text( 'Ingreso:', 185, 110);
      doc.text( 'Egreso:', 185, 120);

      doc.setFontSize(11);
      doc.text( datosCaja.FechaConsulta, 240, 60);
      doc.text(datosCaja.sede, 247, 70);
      doc.text( datosCaja.FechaApertura, 267, 80);
      doc.text( datosCaja.FechaCierre, 258, 90);
      doc.text( 'S./ ' + (this.totalGeneral).toFixed(2), 225, 110);
      doc.text( 'S./ 00.00', 225, 120);
      const metodoPago = [
        [1, 'Efectivo', this.totalEfectivo.toFixed(2)],
        [2, 'Tarjeta de credito o debito', this.totalTargeta.toFixed(2)],
        [3, 'Total Ventas', this.totalGeneral.toFixed(2)],
      ];

      if (isNullOrUndefined(data)) {
      doc.text( 'No se encontraron registros.', 35, 150);
      } else {
        console.log('dato regresados', data);
        doc.autoTable({
        // tslint:disable-next-line:max-line-length
            head: [['#', 'Descripción', 'suma']],
            body: metodoPago,
            startY: 150,
            theme: 'grid',
            // foot:  [['ID', 'Name', 'Country']],
          });
        doc.autoTable({
          // tslint:disable-next-line:max-line-length
          head: [['#', 'Tipo transacción', 'Tipo documento', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Documento', 'Moneda', 'Total']],
          body: this.datosReportePuntoVentaVendedor,
          startY: 230,
          theme: 'grid',
        });
      }
      doc.save('reporte Punto de Venta ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }
  ConsultaPuntoVentaVendedor(dia: string, dniVendedor: string) {
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.ObtenerReporteVentaDiaVendedor(this.sede.toLowerCase(), dia, dniVendedor).then( (snapshot: any) => {
        this.datosReportePuntoVentaVendedor = [];
        if (snapshot.empty) {
          this.datosReportePuntoVentaVendedor = null;
        } else {
          this.totalEfectivo = 0;
          this.totalTargeta = 0;
          this.totalGeneral = 0;
          let contador = 0;
          // tslint:disable-next-line:no-shadowed-variable
          snapshot.forEach(doc => {
            contador++;
            // console.log(doc.id, '=>', doc.data());
            const datos = doc.data();
            this.totalGeneral =  this.totalGeneral + datos.totalPagarVenta  ;
            console.log('totalgeneral', this.totalGeneral);

            if (datos.tipoPago === 'efectivo') {
            this.totalEfectivo =  this.totalEfectivo + datos.totalPagarVenta;
            console.log('totalEfectivo', this.totalEfectivo);
            }
            if (datos.tipoPago === 'tarjeta') {
            this.totalTargeta =  this.totalTargeta + datos.totalPagarVenta;
            console.log('totalTargeta', this.totalTargeta);
            }
            let formato: any;
            formato = [
              contador,
             'Venta',
             datos.tipoComprobante.toUpperCase() || null,
            //  datos.serieComprobante || null,
            datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,
             datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
             datos.cliente.nombre.toUpperCase() || null,
             datos.cliente.numDoc || null,
             'PEN',
             redondeoDecimal( datos.totalPagarVenta, 2).toFixed(2)
            ];
            this.datosReportePuntoVentaVendedor.push(formato);
          });
        }
        console.log('datos generales a meter', this.datosReportePuntoVentaVendedor);
        resolve(this.datosReportePuntoVentaVendedor);
      });

    });
    return promesa;
  }
  ReporteIngresoMetPagoVendedor(datosCaja: CajaChicaInterface) {
    console.log('fecha consulta', datosCaja.FechaConsulta , ' dni', datosCaja.dniVendedor);
    this.ConsultaRepIngresoMetPagoVendedor(datosCaja.FechaConsulta, datosCaja.dniVendedor).then(data => {
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Resúmen de ingresos por métodos de pago', 100, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(100, 35, 305, 35);
      doc.rect(30, 50, 387, 50); // empty square
      doc.setFontSize(12);

      doc.text( 'Empresa:', 40, 60);
      doc.text( 'RUC:', 40, 70);
      doc.text( 'Vendedor:', 40, 80);
      doc.text( 'Estado de Caja:', 40, 90);

      doc.setFontSize(11);
      // doc.setFont('default');
      doc.text( 'Veterinarias Tooby', 75, 60);
      doc.text( this.RUC, 64, 70);
      doc.text( datosCaja.nombreVendedor.toUpperCase(), 81, 80);
      doc.text( datosCaja.estado, 98, 90);

      doc.setFontSize(12);
      doc.text( 'Fecha reporte:', 185, 60);
      doc.text( 'Establecimiento:', 185, 70);
      doc.text( 'Fecha y hora apertura:', 185, 80);
      doc.text( 'Fecha y hora cierre:', 185, 90);

      doc.setFontSize(11);
      doc.text( datosCaja.FechaConsulta, 240, 60);
      doc.text( datosCaja.sede, 247, 70);
      doc.text( datosCaja.FechaApertura, 267, 80);
      doc.text( datosCaja.FechaCierre, 258, 90);
      if (isNullOrUndefined(data)) {
        doc.text( 'No se encontraron registros.', 35, 150);
        } else {
          doc.autoTable({
            head: [['#', 'Fecha y hora emisión', 'Tipo documento', 'Documento', 'Método de pago', 'Moneda', 'Importe', 'Vuelto', 'Monto']],
            body: this.datosReporteIngresoPagoVendedorDia,
            startY: 110,
            theme: 'grid',
          });
        }


      doc.save('reporteIngresos' + datosCaja.FechaConsulta + '.pdf');
      });
  }
  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }
  ConsultaRepIngresoMetPagoVendedor(dia: string, dniVendedor: string) {
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.ObtenerReporteVentaDiaVendedor(this.sede.toLowerCase(), dia, dniVendedor).then( snapshot => {
        this.datosReporteIngresoPagoVendedorDia = [];
        if (snapshot.empty) {
          this.datosReporteIngresoPagoVendedorDia = null;
        } else {
          let contador = 0;
          // tslint:disable-next-line:no-shadowed-variable
          snapshot.forEach(doc => {
            contador++;
            // console.log(doc.id, '=>', doc.data());
            const datos = doc.data();
            let formato: any;
            formato = [
              contador,
              datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
              datos.tipoComprobante.toUpperCase() || null,
              datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,

              // datos.serieComprobante || null,
              datos.tipoPago ? datos.tipoPago.toUpperCase() : null,
              'PEN',
              1,
              0.00,
              redondeoDecimal( datos.totalPagarVenta, 2).toFixed(2)

            ];
            this.datosReporteIngresoPagoVendedorDia.push(formato);
          });
        }
        console.log('datos generales a meter', this.datosReporteIngresoPagoVendedorDia);
        resolve(this.datosReporteIngresoPagoVendedorDia);
      });

    });
    return promesa;
  }
  ReporteProductosVendedorDia(datosCaja: CajaChicaInterface, formato: string) {
    this.ConsultaRepProductosVendedorDia(datosCaja.FechaConsulta, datosCaja.dniVendedor, formato, datosCaja).then( snapshot => {
      console.log('datos obtenidos', snapshot);
    });
  }
  async ConsultaRepProductosVendedorDia(dia: string, dniVendedor: string, formato: string, datosCaja: CajaChicaInterface) {
    // let datoos;
    let productosArray = [];
    const promesa = await new Promise((resolve, reject) => {
      this.dataApi.ObtenerReporteVentaDiaVendedor(this.sede.toLowerCase(), dia, dniVendedor).then( snapshot => {
        if (snapshot.empty) {
          console.log('no hay boletas');
          // datoos = null;
          productosArray = null;
          resolve(productosArray);
          this.crearArchivoExportar(datosCaja, formato, null);

        } else {
          this.productosArray = snapshot;
          console.log('si hay boletas', this.productosArray);
          this.consultaDetallesVenta(formato, datosCaja).then(data => {
            console.log('EMPEZAM0000000000000OS', data);
          });
          resolve(productosArray);
        }
      });

    });
    return promesa;

  }

  async consultaDetallesVenta( formato: string, datosCaja: CajaChicaInterface) {
    console.log('consultamos', this.productosArray.docs.length);
    const promesa = await new Promise((resolve, reject) => {
      if (this.contadorConsultaProdcutos < this.productosArray.docs.length) {
        const datos = this.productosArray.docs[this.contadorConsultaProdcutos].data();
        console.log('Consulta', this.contadorConsultaProdcutos, datos);
        this.dataApi.ObtenerDetallesProdVentas( this.sede.toLowerCase(), datos.idListaProductos).subscribe((res: any) => {
          res.productos.forEach(element => {
            element.serieComprobante = datos.serieComprobante;
          });
          console.log('DETALLES: ', res);
          console.log('PONERRR SERIEEE: ', res.productos);
          this.contadorConsultaProdcutos++;
          this.apilados = this.apilados.concat(res.productos);
          console.log('APILAOS: ', this.apilados);
          this.consultaDetallesVenta(formato, datosCaja);
        });
      } else {
        console.log('APILADoS final: ', this.apilados);
        this.crearArchivoExportar(datosCaja, formato, this.apilados);
        resolve(this.apilados);
      }
    });
    return promesa;
  }

  crearArchivoExportar(datosCaja: CajaChicaInterface, formato: string, productos: any) {
      if (formato === 'pdf') {
        console.log('formato pdf');
        const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
        doc.setFontSize(16);
        doc.setFont('bold');
        doc.text('Resúmen de ingresos por métodos de pago', 100, 30);
        doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
        doc.setLineWidth(0.5);
        doc.line(100, 35, 305, 35);
        doc.rect(30, 50, 387, 50); // empty square
        doc.setFontSize(12);
        doc.text( 'Empresa:', 40, 60);
        doc.text( 'RUC:', 40, 70);
        doc.text( 'Vendedor:', 40, 80);
        doc.text( 'Estado de Caja:', 40, 90);
        doc.setFontSize(11);
        // doc.setFont('default');
        doc.text( 'Veterinarias Tooby', 75, 60);
        doc.text( this.RUC, 64, 70);
        doc.text( datosCaja.nombreVendedor, 81, 80);
        doc.text( datosCaja.estado, 98, 90);
        doc.setFontSize(12);
        doc.text( 'Fecha reporte:', 185, 60);
        doc.text( 'Establecimiento:', 185, 70);
        doc.text( 'Fecha y hora apertura:', 185, 80);
        doc.text( 'Fecha y hora cierre:', 185, 90);
        doc.setFontSize(11);
        doc.text( datosCaja.FechaConsulta, 240, 60);
        doc.text( datosCaja.sede, 247, 70);
        doc.text( datosCaja.FechaApertura, 267, 80);
        doc.text( datosCaja.FechaCierre, 258, 90);
        if (isNullOrUndefined(productos)) {
          doc.setFontSize(15);
          doc.text( 'No se encontraron registros.', 35, 120);
          } else {
            let contador = 0;
            productos.forEach(datos => {
              contador++ ;
              // tslint:disable-next-line:no-shadowed-variable
              let formato: any;
              formato = [
                contador,
                datos.producto.nombre.toUpperCase() || null,
                datos.cantidad || null,
                datos.serieComprobante || null,
              ];
              this.datosReporteIngresoPagoVendedorDia.push(formato);
            });
            doc.autoTable({
              head: [['#', 'Producto', 'cantidad', 'Comprobante']],
              body: this.datosReporteIngresoPagoVendedorDia,
              startY: 110,
              theme: 'grid',
            });
          }
        doc.save('reporteProductos' + datosCaja.FechaConsulta + '.pdf');
      }
      if (formato === 'excel') {
        const dataExcel = [
          // {'Reporte Punto de Venta': null},
          // {'Empresa: Veterinarias Tooby': null},
          // {'Ruc: 10465290311': null},
          // {
          //   // 'Vendedor:' +  datosCaja.nombreVendedor: null ,
          //   'Estado de caja: ': datosCaja.estado
          // }
        ];
        if (!isNullOrUndefined(productos)) {
          console.log(productos);
          let contador = 0;
          const prod = [];
          productos.forEach(datos => {
            console.log(datos);
            contador++;
            // tslint:disable-next-line:no-shadowed-variable
            const formato: any = {
              '#': contador,
              Producto: datos.producto.nombre.toUpperCase(),
              Cantidad: datos.cantidad,
              Comprobante: datos.serieComprobante,
              Fecha: datosCaja.FechaConsulta,
              Caja: datosCaja.nombreVendedor.toUpperCase()
            };
            dataExcel.push(formato);
            });
          console.log('formato excel');
          this.excelService.exportAsExcelFile(dataExcel, 'ReporteProductos' + datosCaja.FechaConsulta);
        }
        else{
          this.presentToast('Datos no encontrados', 'warning', 'alert-circle-outline');
        }
      }
  }

  async modalAperturaCajaChica(modoCaja: string, datos: any) {
    const modal = await this.modalController.create({
      component: AbrirCerrarCajaPage,
      cssClass: 'my-custom-class',
      backdropDismiss: false,
      componentProps: {
        modo: modoCaja,
        datosCaja: datos
      }
    });
    return await modal.present();
  }

  buscador(ev) {
    console.log('Reporte general', ev);
  }
  async confirmarCerrarCaja(id) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Cerrar Caja Chica POS',
      message: '¿Está seguro de cerrar caja?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.modalAperturaCajaChica('cerrar', id);
          }
        }
      ]
    });
    await alert.present();
  }
  Search(ev) {
    this.sinResultados = null;
    this.buscando = true;
    console.log(ev.detail.value);
    const key = ev.detail.value;
    console.log('dato a buscar', key);
    const lowercaseKey = key.toLowerCase();
    // const lowercaseKey = key; // esto es para buscar sin convertir en minuscula
    console.log('dato convertido en minuscula', key);
    // console.log(lowercaseKey);
    if ( lowercaseKey.length > 0) {
      // console.log('sede', this.sede);
      console.log('lowercase> 0');
      // tslint:disable-next-line:max-line-length
      // tslint:disable-next-line:max-line-length
      // this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos', res => res.where('categoria', '==', this.categoria).orderBy('nombre').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')).snapshotChanges()
      // .pipe(map(changes => {
      //    return changes.map(action => {
      //     const data = action.payload.doc.data();
      //     data.id = action.payload.doc.id;
      //     console.log(data);
      //     return data;
      //   });
      // }
      // )).subscribe(res => {
      //   if (res.length === 0 ) {
      //     console.log('no hay datos');
      //     this.productos = null;
      //     this.buscando = false;
      //     this.sinResultados = 'No se encontró el producto';
      //   } else {
      //     console.log(res );
      //     this.productos = res;
      //     this.buscando = false;
      //   }
      // }, error => { alert('error de subscribe'  + error); }
      // );
     } else  {
      console.log('lowercase 0');
      // this.productos = null;
      this.buscando = null;
     }
  }
  listaCajaChicaSede(sede: string){
    this.dataApi.ObtenerListaCajaChica(sede).subscribe(data => {
      this.listaCajaChica = data;
      this.convertirFecha(this.listaCajaChica);
      console.log('lista de caja chica', this.listaCajaChica);
    });
  }
  convertirFecha(lista) {
    lista.forEach(element => {
      // element.fecha = moment.unix(element.fecha).format('DD/MM/yyyy');
      element.FechaConsulta = new Date(moment.unix(element.FechaApertura.seconds).format('D MMM YYYY H:mm'));
      element.FechaConsulta = formatDate(element.FechaConsulta, 'dd-MM-yyyy', 'en');
      element.FechaApertura = new Date(moment.unix(element.FechaApertura.seconds).format('D MMM YYYY H:mm'));
      element.FechaApertura = this.datePipe.transform(element.FechaApertura, 'short');
      if (element.FechaCierre ) {
        element.FechaCierre = new Date(moment.unix(element.FechaCierre.seconds).format('D MMM YYYY H:mm'));
        element.FechaCierre = this.datePipe.transform(element.FechaCierre, 'short');
      }
    });
  }
  async confirmarBorrarCaja(id) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Borrar Caja Chica POS',
      message: '¿Está seguro de borrar caja?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.EliminarCaja( id);
          }
        }
      ]
    });
    await alert.present();
  }
  EliminarCaja(id: string) {
    console.log(id);
    this.dataApi.EliminarCajaChica(id).then(res => {
      this.presentToast('Eliminado Correctamente', 'success', 'checkmark-circle-outline');
    }
    ).catch(() => {
      this.presentToast('No se pudo eliminar', 'danger', 'alert-circle-outline');
    });
  }
  limpiar() {
    this.buscando = null;
  }
  async presentToast(mensaje: string, colors?: string, icono?: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: colors,
      buttons: [
        {
          side: 'start',
          icon: icono,
          // text: 'Favorite',
        }
      ]
    });
    toast.present();
  }
  async ReporteVentaGeneralDia(ev: any){
    const popover = await this.popoverCtrl.create({
      component: PoppoverEditarComponent,
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        formato: true
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      switch (data.action) {
        case 'a4': console.log('a4'); this.ReporteVentaDiaGeneralPDF(); break;
        case 'ticked': console.log('ticked'); this.ReporteTiket(); break;
      }
    }

  }
  listaVendedoresDatos() {
    const arrayDni  = [];
    const vendedores = [];
    const arrayVendDatos = [];
    const promesa = new Promise((resolve, reject) => {
      this.consultaVentaReporteGeneral().then((res: any) => {
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
                MontoFacAnulado: 0,
                montoBolAnulado: 0,
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
            resolve(arrayVendDatos);
          }
        }else {
          console.log('no hay datos que mostrar');
          resolve(null);
        }
      });
    });
    return promesa;
  }
  async ReporteProductos(ev: any, item: CajaChicaInterface) {
    const popover = await this.popoverCtrl.create({
      component: PoppoverEditarComponent,
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        exportar: true
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      switch (data.action) {
        case 'pdf': this.ReporteProductosVendedorDia( item, 'pdf'); break;
        case 'excel': this.ReporteProductosVendedorDia( item, 'excel'); break;
      }
    }
  }
  ReporteTiket() {
    this.listaVendedoresDatos().then((data: any) => {
      console.log('lista de vendedores', data);
      let index = 0;

      const doc = new jsPDF( 'p', 'mm', [45, 60]);
      doc.addImage(this.LogoEmpresa, 'JPEG', 11, 1, 22, 8);
      doc.setFontSize(6);
      doc.setFont('helvetica');
      doc.text('CLINICA VETERINARIA TOOBY', 22.5, 12, {align: 'center'});
      doc.text('CUADRE PARCIAL Nro. ' + formatDate(new Date(), 'dd-MM', 'en'), 22.5, 16, {align: 'center'});
      doc.text('HORA:' +  formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 18, {align: 'center'});
      doc.text(this.sede, 22.5, 20, {align: 'center'});
      // tslint:disable-next-line:max-line-length
      doc.text( 'Fecha Inicio: ', 2 , 23, {align: 'left'});
      doc.text( formatDate(new Date(), 'dd/MM/yyyy', 'en'), 43 , 23, {align: 'right'});

      doc.text( 'Fecha Final: ', 2 , 25, {align: 'left'});
      doc.text( formatDate(new Date(), 'dd/MM/yyyy', 'en'), 43 , 25, {align: 'right'});
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
      let MontoFacAnulado = 0;
      let montoBolAnulado = 0;
      let montoBoleta = 0;
      let montoFactura = 0;
      for (const vendedor of data) {
        console.log('numNotas' , typeof(vendedor.numNotas), vendedor.numNotas);
        montoFinal += vendedor.montoFinal;
        numFacturas += vendedor.numFacturas;
        numBoletas += vendedor.numBoletas;
        numNotas += vendedor.numNotas;
        totalNotas += vendedor.totalNotas;
        FacAnulada += vendedor.FacAnuladas;
        BolAnuladas += vendedor.BolAnuladas;
        MontoFacAnulado += vendedor.MontoFacAnulado;
        montoBolAnulado += vendedor.montoBolAnulado;
        montoBoleta += vendedor.montoBoleta;
        montoFactura += vendedor.montoFactura;

        console.log('vendedor', vendedor);
        doc.text( vendedor.nombreVendedor, 2 , index + 2, {align: 'left'});
        // tslint:disable-next-line:max-line-length
        doc.text( (vendedor.numFacturas + vendedor.numBoletas + vendedor.numNotas) + '' , 22.5 , index + 2, {align: 'center'});
        doc.text( vendedor.montoFinal.toFixed(2), 43 , index + 2, {align: 'right'});
        index = index + 2;
        // if (contador === 10) {
        //   break;
        // }
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
      doc.setFontSize(7);

      doc.text('Total: ' + montoFinal.toFixed(2), 2, index + 19 , {align: 'left'});
      index = index + 20;

      }
      else{
      index += 28;
      doc.text( 'No se encontraron registros ', 2 , 29, {align: 'left'});

      }

      // doc.text( 'FechaF.: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en'), 2 , 26, {align: 'left'});
      doc.save('tiket' + '.pdf');
      doc.autoPrint();
      });
  }

  // pruebaPaginacion() {
  //   const cajaRef = this.afs.collection('CajaChica').ref.orderBy('nombreVendedor').startAfter(this.lastDocument);
  //   cajaRef.limit(3).get().then(snap => {
  //     this.firtDocument = snap.docs[0] || null;
  //     this.lastDocument = snap.docs[snap.docs.length - 1] || null;
  //     if (snap.empty) {
  //       // si esta vacio
  //       console.log('vacio');
  //     } else {
  //       snap.forEach(doc => {
  //         const dato = doc.data();
  //         console.log('datos', dato);
  //       });
  //     }
  //   });
  // }
  // pruebaPaginacion2() {
  //   const cajaRef = this.afs.collection('CajaChica').ref.orderBy('nombreVendedor').endBefore(this.firtDocument);
  //   cajaRef.limitToLast(3).get().then(snap => {
  //     this.firtDocument = snap.docs[0] || null;
  //     console.log('firts', this.firtDocument);
  //     this.lastDocument = snap.docs[snap.docs.length - 1] || null;
  //     if (snap.empty) {
  //       // si esta vacio
  //       console.log('vacio');
  //     } else {
  //       snap.forEach(doc => {
  //         const dato = doc.data();
  //         console.log('datos', dato);
  //       });
  //     }
  //   });
  // }



}

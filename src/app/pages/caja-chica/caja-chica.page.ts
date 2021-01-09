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
  ReporteVentaDiaGeneral(formato: string) {
    this.consultaVentaReporteGeneral(formato).then( (data: any) => {
      if (formato === 'ticked') {
        // this.ReporteTiket();
        console.log('datos ticked', data);
        let totalEfectivo = 0;
        let totalTargeta = 0;
        let totalGeneral = 0;

        data.forEach(element => {
          totalGeneral = totalGeneral + element.totalPagarVenta;
          if (element.tipoPago === 'efectivo') {
          totalEfectivo = totalEfectivo + element.totalPagarVenta;
          }
          if (element.tipoPago === 'tarjeta') {
            totalTargeta = totalTargeta + element.totalPagarVenta;
            }
        });
        console.log('dtos de efectivo: ', totalEfectivo , 'total tarjeta: ', totalTargeta , 'total general: ', totalGeneral );

      }
      if (formato === 'a4') {
        console.log(data);
        const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
        doc.setFontSize(16);
        doc.setFont('bold');
        doc.text('Reporte General de ventas POS', 120, 30);
        doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
        doc.setLineWidth(0.5);
        doc.line(120, 35, 290, 35);
        doc.rect(30, 40, 387, 40); // empty square
        doc.setFontSize(12);
        doc.text( 'Empresa:', 40, 55);
        doc.text( 'RUC:', 40, 70);
        doc.text( 'Veterinarias Tooby ,' + this.sede, 75, 55);
        doc.text( this.RUC, 64, 70);
        doc.setFontSize(12);
        doc.text( 'Fecha reporte:', 220, 55);
        doc.text( formatDate(new Date(), 'dd-MM-yyyy', 'en'), 275, 55);
        if (isNullOrUndefined(data)) {
        doc.text( 'No se encontraron registros.', 35, 100);
        } else {
          doc.autoTable({
            // tslint:disable-next-line:max-line-length
            head: [['#', 'Tipo transacción', 'Tipo documento', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Documento', 'Moneda', 'Total']],
            body: this.datosReporteVentaGeneral,
            startY: 90,
            theme: 'grid',
            // foot:  [['ID', 'Name', 'Country']],
          });
        }
        doc.save('reporte General Ventas ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
      }
    });
  }
  consultaVentaReporteGeneral(format: string) {
    const dia = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.ObtenerReporteVentaGeneralDia (this.sede.toLowerCase(), dia).then( snapshot => {
        if (snapshot.empty) {
          this.datosReporteVentaGeneral = null;
        } else {
          if (format === 'a4') {
            this.datosReporteVentaGeneral = [];
            let contador = 0;
            // tslint:disable-next-line:no-shadowed-variable
            snapshot.forEach(doc => {
              contador++;
              console.log(doc.id, '=>', doc.data());
              const datos = doc.data();
              let formato: any;
              formato = [
                contador,
               'Venta',
               datos.tipoComprobante.toUpperCase() || null,
               datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,
               datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
               datos.cliente.nombre.toUpperCase() || null,
               datos.cliente.numDoc || null,
               'PEN',
               datos.totalPagarVenta.toFixed(2)
              ];
              this.datosReporteVentaGeneral.push(formato);
            });


          }
          if (format === 'ticked') {
            // this.datosReporteVentaGeneral = snapshot;
            let contador = 0;

            snapshot.forEach(doc => {
              contador++;
              console.log(doc.id, '=>', doc.data());
              const datos = doc.data();
              datos.numeracion = contador;
              this.datosReporteVentaGeneral.push(datos);
            });
          }

        }
        console.log('datos generales a meter', this.datosReporteVentaGeneral);
        resolve(this.datosReporteVentaGeneral);
      });
    });
    return promesa;
  }
  ReportePuntoVenta(datosCaja: CajaChicaInterface) {
    console.log('fecha consulta', datosCaja.FechaConsulta , ' dni', datosCaja.dniVendedor);
    this.ConsultaPuntoVentaVendedor(datosCaja.FechaConsulta, datosCaja.dniVendedor).then(data => {
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
      doc.text( 'S./ ' + datosCaja.saldoInicial, 90, 110);
      doc.text( 'S./ ' + datosCaja.saldoFinal, 90, 120);

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
      doc.text( 'S./ ' + (datosCaja.saldoFinal - datosCaja.saldoInicial), 225, 110);
      doc.text( 'S./ 00.00', 225, 120);
      const metodoPago = [
        [1, 'Efectivo', datosCaja.saldoFinal - datosCaja.saldoInicial],
        [2, 'Tarjeta de crédito', 0.00],
        [3, 'Tarjeta de débito', 0.00],
        [4, 'Transferencia', 0.00],
        [5, 'Factura 30 días', 0.00],
        [6, 'Tarjeta de crédito visa', 0.00],
        [7, 'Contado contraentrega', 0.00],
        [8, 'A 30 días', 0.00],
        [9, 'Crédito', 0.00],
        [10, 'contado ', 0.00],
      ];

      doc.autoTable({
        // tslint:disable-next-line:max-line-length
            head: [['#', 'Descripción', 'suma']],
            body: metodoPago,
            startY: 150,
            theme: 'grid',
            // foot:  [['ID', 'Name', 'Country']],
          });
      if (isNullOrUndefined(data)) {
      doc.text( 'No se encontraron registros.', 35, 150);
      } else {
        doc.autoTable({
          // tslint:disable-next-line:max-line-length
          head: [['#', 'Tipo transacción', 'Tipo documento', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Documento', 'Moneda', 'Total']],
          body: this.datosReportePuntoVentaVendedor,
          startY: 350,
          theme: 'grid',
        });
      }
      doc.save('reporte Punto de Venta ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }
  ConsultaPuntoVentaVendedor(dia: string, dniVendedor: string) {
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.ObtenerReporteVentaDiaVendedor(this.sede.toLowerCase(), dia, dniVendedor).then( snapshot => {
        this.datosReportePuntoVentaVendedor = [];
        if (snapshot.empty) {
          this.datosReportePuntoVentaVendedor = null;
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
             'Venta',
             datos.tipoComprobante.toUpperCase() || null,
            //  datos.serieComprobante || null,
            datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,
             datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
             datos.cliente.nombre.toUpperCase() || null,
             datos.cliente.numDoc || null,
             'PEN',
             datos.totalPagarVenta
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
              datos.totalPagarVenta || null
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
          // snapshot.forEach(doc => {
          //   const datos = doc.data();
          //   // console.log('id de boleta', datos.idListaProductos );
          //   this.consultaDetallesVenta(datos).then(data => {
          //     if (!isNullOrUndefined(data)) {
          //       productosArray = productosArray.concat(data);
          //       }
          //   });
          // });
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
        case 'a4': console.log('a4'); this.ReporteVentaDiaGeneral('a4'); break;
        case 'ticked': console.log('ticked'); this.ReporteVentaDiaGeneral('ticked'); break;
      }
    }

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
    const doc = new jsPDF( 'p', 'mm', [45, 60]);
    doc.addImage(this.LogoEmpresa, 'JPEG', 15, 5, 15, 7);
    doc.setFontSize(6);
    doc.setFont('courier');
    doc.text('CUADRE PARCIAL Nro. ' + formatDate(new Date(), 'dd-MM', 'en'), 22.5, 16, {align: 'center'});
    doc.text('HORA:' +  formatDate(new Date(), 'HH:mm aa', 'en'), 22.5, 18, {align: 'center'});

    doc.text(this.sede, 22.5, 20, {align: 'center'});

    doc.text( '________________________________________', 22.5, 22, {align: 'center'});
    doc.text('Cajero.%  Caja.%  TND:%', 2, 24, {align: 'left'});
    // tslint:disable-next-line:max-line-length
    doc.text( 'FechaI.: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en'), 2 , 26, {align: 'left'});
    doc.text( 'FechaF.: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en'), 2 , 28, {align: 'left'});
    doc.text( '________________________________________', 22.5, 29, {align: 'center'});

    doc.text( 'Cajero. ', 2 , 31, {align: 'left'});
    doc.text( 'Cantidad. ', 22.5 , 31, {align: 'center'});
    doc.text( 'S/. ', 43 , 31, {align: 'right'});

    doc.text( 'Ana ', 2 , 33, {align: 'left'});
    doc.text( '23 ', 22.5 , 33, {align: 'center'});
    doc.text( '12.00', 43 , 33, {align: 'right'});

    // doc.text( 'FechaF.: ' + formatDate(new Date(), 'dd/MM/yyyy', 'en'), 2 , 26, {align: 'left'});
    doc.save('tiket' + '.pdf');
    doc.autoPrint();
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

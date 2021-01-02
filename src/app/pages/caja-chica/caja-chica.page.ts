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
import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import {UserOptions} from 'jspdf-autotable';
import domtoimage from 'dom-to-image';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { isNullOrUndefined } from 'util';
import { CajaChicaInterface } from '../../models/CajaChica';
// tslint:disable-next-line:class-name
interface jsPDFWithPlugin extends jspdf.jsPDF {
  autoTable: (options: UserOptions) => jspdf.jsPDF;
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
  ReporteVentaDiaGeneral() {
    this.consultaVentaReporteGeneral().then(data => {
      console.log(data);
      const doc = new jspdf.jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
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
      doc.text( '10232323235', 64, 70);
      doc.setFontSize(12);
      doc.text( 'Fecha reporte:', 220, 55);
      doc.text( formatDate(new Date(), 'dd-MM-yyyy', 'en'), 275, 55);
      if (isNullOrUndefined(data)) {
      doc.text( 'No se encontraron registros.', 35, 100);
      } else {
        doc.autoTable({
          head: [['#', 'Tipo transacción', 'Tipo documento', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Documento', 'Moneda', 'Total']],
          body: this.datosReporteVentaGeneral,
          startY: 90,
          theme: 'grid',
          // foot:  [['ID', 'Name', 'Country']],
        });
      }
      doc.save('reporte General Ventas ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }
  consultaVentaReporteGeneral() {
    const dia = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.ObtenerReporteVentaGeneralDia (this.sede.toLowerCase(), dia).then( snapshot => {
        this.datosReporteVentaGeneral = [];
        if (snapshot.empty) {
          this.datosReporteVentaGeneral = null;
        } else {
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
             datos.tipoComprobante || null,
             datos.serieComprobante || null,
             datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
             datos.cliente.nombre || null,
             datos.cliente.dni || datos.cliente.ruc || 'null',
             'PEN',
             datos.total
            ];
            this.datosReporteVentaGeneral.push(formato);
          });
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
      const doc = new jspdf.jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;

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
      doc.text( '10232323235', 64, 70);
      doc.text( datosCaja.nombreVendedor, 81, 80);
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
             datos.tipoComprobante || null,
             datos.serieComprobante || null,
             datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
             datos.cliente.nombre || null,
             datos.cliente.dni || datos.cliente.ruc || null,
             'PEN',
             datos.total
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
      const doc = new jspdf.jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
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
      doc.text( '10232323235', 64, 70);
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
              datos.tipoComprobante || null,
              datos.serieComprobante || null,
              datos.metodoPago || null,
              'PEN',
              1,
              0.00,
              datos.total || null
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
        const doc = new jspdf.jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
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
        doc.text( '10232323235', 64, 70);
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
                datos.producto.nombre || null,
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
              Producto: datos.producto.nombre,
              Cantidad: datos.cantidad,
              Comprobante: datos.serieComprobante,
              Fecha: datosCaja.FechaConsulta,
              Caja: datosCaja.nombreVendedor
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
  tiket() {
    // const opciones = {
    //   orientation: 'p',
    //   unit: 'mm',
    //   format: [240, 300]
    // };

    // const doc = new jspdf.jsPDF( 'p', 'mm', [45, 350]) as jsPDFWithPlugin;
    // doc.setFontSize(6);
    // doc.setFont('Arial', 'B');
    // doc.text('CUADRE PARCIAL NRO. ' + '30-12', 8, 10);
    // doc.text('Hora.' + '20:02:03', 15, 12);
    // doc.text('-------------------------------------------------------------', 1, 14);
    // doc.text('CAJERO.% CAJA.% TNO.%', 2, 16);
    // doc.text('fECHAI. 30-12-2020 FECHAF.30-12-2020', 2, 18);
    // doc.text('-------------------------------------------------------------', 1, 20);
    // doc.save('tiket' + '.pdf');
    // doc.autoPrint();
    // doc.output('dataurlnewwindow');
    // const canvas = document.getElementById('pdf');

    // domtoimage.toPng(canvas).then((dataUrl) => {
    //     // tslint:disable-next-line:prefer-const
    //     let imagen = new Image(350);
    //     imagen.src = dataUrl; /*obtengo el screenshot*/
    //     // const doc = new jspdf.jsPDF( 'p', 'mm', [45, 350]) as jsPDFWithPlugin;

    //     const  doc = new jspdf.jsPDF( 'p', 'mm', [45, 350]);
    //     /* creamos el pdf con jspdf, l es de landscape, mm: medidas en milímetros, y A4 el formato*/
    //     // tslint:disable-next-line:max-line-length
    // tslint:disable-next-line:max-line-length
    //     doc.addImage( imagen, 18, 10, 260, 189); /*imagen: es la captura que insertaremos en el pdf, 18: margen izquierdo, 10: margen superior, 260:ancho, 189:alto, pueden jugar con estos valores, de esta forma me quedó prolijo en A4 horizontal*/
    //     doc.save( 'documento.pdf' ); /* descargamos el pdf con ese nombre.*/
    // }
    // );

    const doc = new jspdf.jsPDF( 'p', 'mm', [45, 350]) as jsPDFWithPlugin;
    doc.addImage(this.LogoEmpresa, 'JPEG', 18, 7, 10, 7);
    doc.setFontSize(6);
    doc.setFont('Arial', 'B');
    doc.text('Veterinarias Tooby', 12, 16);
    doc.text('Av. Peru 236 Parque Lampa de Oro ', 9, 18);
    doc.text('Telefono: 989898989', 12, 20);
    doc.text('Ruc: 20706679362', 15, 22);
    doc.text('Boleta de Venta electronica', 8, 24);
    doc.text('B0000378', 2, 28);
    doc.text('Fecha:12/12/2020', 2, 30);
    doc.text('Ruc o Rason social: 00000000 clientevarios', 1, 32);
    let index = 34;
    for (const c of ['papel higienico', 'papel higienico', 'papel higienico', ]) {
      doc.text( '______________________________________', 2, index);
      index = index + 3;
      doc.text( c, 2, index);
      doc.text( '4' + '.000    ' + 'UND' + '         ' + '10.00                  ' + '40' + '.00' , 2, index + 3);

      doc.text( '______________________________________', 2, index +  3);
      index = index + 3;

    }
    doc.text('Importe Total:                                   ' + 45.00, 2, index + 3);

    doc.save('tiket' + '.pdf');
    doc.autoPrint();
    // doc.output('dataurlnewwindow');
    const canvas = document.getElementById('pdf');

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

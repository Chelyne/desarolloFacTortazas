import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, AlertController, PopoverController, LoadingController } from '@ionic/angular';
import { AbrirCerrarCajaPage } from '../../modals/abrir-cerrar-caja/abrir-cerrar-caja.page';
import { StorageService } from '../../services/storage.service';
import * as moment from 'moment';
import { DatePipe, formatDate } from '@angular/common';
import { ExportarPDFService } from '../../services/exportar-pdf.service';
// pdf
import 'jspdf-autotable';
import {UserOptions} from 'jspdf-autotable';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { isNullOrUndefined } from 'util';
import { CajaChicaInterface } from '../../models/CajaChica';
import { jsPDF } from 'jspdf';
import { redondeoDecimal } from 'src/app/global/funciones-globales';
import { ReportesService } from '../../services/reportes.service';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from 'src/app/global/global.service';
import { VentaInterface } from 'src/app/models/venta/venta';
import { GENERAL_CONFIG } from '../../../config/generalConfig';
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
  sede =  this.storage.datosAdmi.sede;
  rolDatosAdmi = this.storage.datosAdmi.rol;
  LogoEmpresa = GENERAL_CONFIG.datosEmpresa.logo;
  RUC = GENERAL_CONFIG.datosEmpresa.ruc;
  nombreEmpresa = GENERAL_CONFIG.datosEmpresa.razon_social;

  listaCajaChica;

  datosReportePuntoVentaVendedor = [];
  datosReporteIngresoPagoVendedorDia = [];
  totalEfectivo = 0;
  totalTargeta = 0;
  totalGeneral = 0;

  contadorConsultaProdcutos = 0;
  apilados = [];
  loading;
  constructor(
    private dataApi: DataBaseService,
    private globalSrv: GlobalService,
    private menuCtrl: MenuController,
    private excelService: ExportarPDFService,
    private alertCtrl: AlertController,
    private storage: StorageService,
    private datePipe: DatePipe,
    private popoverCtrl: PopoverController,
    private reportesservice: ReportesService,
    private loadingController: LoadingController,
    private modalController: ModalController) {
      this.listaCajaChicaSede(this.sede);
    }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }
  listaCajaChicaSede(sede: string){
    this.dataApi.obtenerListaCajaChica(sede).subscribe(data => {
      this.listaCajaChica = data;
      this.convertirFecha(this.listaCajaChica);
    });
  }

  convertirFecha(lista) {
    lista.forEach(element => {
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
    this.dataApi.eliminarCajaChica(id).then(res => {
      this.globalSrv.presentToast('Eliminado Correctamente', {color: 'success', icon: 'checkmark-circle-outline', position: 'top'});
    }
    ).catch(() => {
      this.globalSrv.presentToast('No se pudo eliminar', {color: 'danger', icon: 'alert-circle-outline', position: 'top'});
    });
  }
  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      // duration: 5000
    });
    await this.loading.present();
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

  ReportePDFDiaIngresoEgreso(){
    this.presentLoading('Consultando... Por Favor espere');
    const dia = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    this.reportesservice.ReportePDFDiaIngresoEgreso(dia).then(() => {this.loading.dismiss(); });
  }

  async ReporteVentaGeneralDia(ev: any){
    const dia = formatDate(new Date(), 'dd-MM-yyyy', 'en');
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
      this.presentLoading('consultando Datos...');
      switch (data.action) {
        case 'a4': console.log('a4'); this.reportesservice.ReporteVentaDiaGeneralPDF(dia).then(() => this.loading.dismiss()); break;
        case 'ticked': console.log('ticked'); this.reportesservice.ReporteTiket(dia).then(() => this.loading.dismiss()); break;
      }
    }
  }

  ReportePuntoVenta(datosCaja: CajaChicaInterface) {
    console.log('fecha consulta', datosCaja.FechaConsulta , ' dni', datosCaja.dniVendedor);
    this.ConsultaPuntoVentaVendedor(datosCaja.FechaConsulta, datosCaja.dniVendedor, 'ventas').then((data: any) => {
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
      doc.text( 'Apertura Caja:' + 'S./ ' + datosCaja.saldoInicial.toFixed(2), 40, 110);
      doc.text( 'Cierre Caja:' + 'S./ ' + datosCaja.saldoFinal.toFixed(2), 40, 120);

      doc.setFontSize(11);
      doc.text( this.nombreEmpresa, 75, 60);
      doc.text( this.RUC, 64, 70);
      doc.text( datosCaja.nombreVendedor.toUpperCase(), 81, 80);
      doc.text( datosCaja.estado, 98, 90);

      doc.setFontSize(12);
      doc.text( 'Fecha reporte: ' + datosCaja.FechaConsulta, 320, 60);
      doc.text( 'Establecimiento:', 185, 70);
      doc.text( 'Fecha y hora apertura:', 185, 80);
      doc.text( 'Fecha y hora cierre:', 185, 90);
      doc.text( 'TOTAL VENTAS: ' + 'S./ ' + (this.totalGeneral).toFixed(2), 185, 110);

      doc.setFontSize(11);
      doc.text(datosCaja.sede, 247, 70);
      doc.text( datosCaja.FechaApertura, 267, 80);
      doc.text( datosCaja.FechaCierre, 258, 90);
      const metodoPago = [
        [1, 'Efectivo', this.totalEfectivo.toFixed(2)],
        [2, 'Tarjeta de credito o debito', this.totalTargeta.toFixed(2)],
        [3, 'Total Ventas', this.totalGeneral.toFixed(2)],
      ];

      if (isNullOrUndefined(data)) {
      doc.text( 'No se encontraron registros.', 35, 150);
      } else {
        doc.autoTable({
            head: [['#', 'Descripción', 'suma']],
            body: metodoPago,
            startY: 150,
            theme: 'grid',
          });
        doc.autoTable({
          head: [['#', 'Tipo transacción', 'Tipo documento', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Documento', 'Moneda', 'Total']],
          body: this.datosReportePuntoVentaVendedor,
          startY: 230,
          theme: 'grid',
        });
      }
      doc.save('reporte Punto de Venta ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }

  ConsultaPuntoVentaVendedor(dia: string, dniVendedor: string, tipo: string) {
    return this.dataApi.obtenerVentaPorDiaVendedor(this.sede.toLowerCase(), dia, dniVendedor).then( (snapshot: any) => {
      this.datosReportePuntoVentaVendedor = [];
      if (snapshot.length === 0) {
        this.datosReportePuntoVentaVendedor = null;
      } else {
        this.totalEfectivo = 0;
        this.totalTargeta = 0;
        this.totalGeneral = 0;
        let contador = 0;
        snapshot.forEach(doc => {
          contador++;
          this.totalGeneral =  this.totalGeneral + doc.totalPagarVenta  ;

          if (doc.tipoPago === 'efectivo') {
          this.totalEfectivo =  this.totalEfectivo + doc.totalPagarVenta;
          }
          if (doc.tipoPago === 'tarjeta') {
          this.totalTargeta =  this.totalTargeta + doc.totalPagarVenta;
          }
          let formato: any;

          if (tipo === 'ventas'){
            formato = [
              contador,
              'Venta',
              doc.tipoComprobante.toUpperCase() || null,
              doc.serieComprobante + '-' + this.digitosFaltantes('0', (8 - doc.numeroComprobante.length)) + doc.numeroComprobante,
              doc.fechaEmision ? this.datePipe.transform(new Date(moment.unix(doc.fechaEmision.seconds)
                                                                  .format('D MMM YYYY H:mm')), 'short') : null,
              doc.cliente.nombre.toUpperCase() || null,
              doc.cliente.numDoc || null,
             'PEN',
             redondeoDecimal( doc.totalPagarVenta, 2).toFixed(2)
            ];
          }else if ( tipo === 'ventasMetodoPago'){
            formato = [
              contador,
              doc.fechaEmision ? this.datePipe.transform(new Date(moment.unix(doc.fechaEmision.seconds)
                                                                  .format('D MMM YYYY H:mm')), 'short') : null,
              doc.tipoComprobante.toUpperCase() || null,
              doc.serieComprobante + '-' + this.digitosFaltantes('0', (8 - doc.numeroComprobante.length)) + doc.numeroComprobante,
              doc.tipoPago ? doc.tipoPago.toUpperCase() : null,
              'PEN',
              1,
              0.00,
              redondeoDecimal( doc.totalPagarVenta, 2).toFixed(2)

            ];

          }
          this.datosReportePuntoVentaVendedor.push(formato);
        });
      }
      return(this.datosReportePuntoVentaVendedor);
    });
  }

  ReporteIngresoMetPagoVendedor(datosCaja: CajaChicaInterface) {
    this.ConsultaPuntoVentaVendedor(datosCaja.FechaConsulta, datosCaja.dniVendedor, 'ventasMetodoPago').then(data => {
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
      doc.text( this.nombreEmpresa, 75, 60);
      doc.text( this.RUC, 64, 70);
      doc.text( datosCaja.nombreVendedor.toUpperCase(), 81, 80);
      doc.text( datosCaja.estado, 98, 90);

      doc.setFontSize(12);
      doc.text( 'Fecha reporte: ' + datosCaja.FechaConsulta, 320, 60);
      doc.text( 'Establecimiento:', 185, 70);
      doc.text( 'Fecha y hora apertura:', 185, 80);
      doc.text( 'Fecha y hora cierre:', 185, 90);

      doc.setFontSize(11);
      doc.text( datosCaja.sede, 247, 70);
      doc.text( datosCaja.FechaApertura, 267, 80);
      doc.text( datosCaja.FechaCierre, 258, 90);
      const metodoPago = [
        [1, 'Efectivo', this.totalEfectivo.toFixed(2)],
        [2, 'Tarjeta de credito o debito', this.totalTargeta.toFixed(2)],
        [3, 'TOTAL VENTAS', this.totalGeneral.toFixed(2)],
      ];
      if (isNullOrUndefined(data)) {
        doc.text( 'No se encontraron registros.', 35, 150);
        } else {
          doc.autoTable({
            head: [['#', 'Descripción', 'suma']],
            body: metodoPago,
            startY: 110,
            theme: 'grid',
          });
          doc.autoTable({
            head: [['#', 'Fecha y hora emisión', 'Tipo documento', 'Documento', 'Método de pago', 'Moneda', 'Importe', 'Vuelto', 'Monto']],
            body: this.datosReportePuntoVentaVendedor,
            startY: 190,
            theme: 'grid',
          });
        }
      doc.save('reporteIngresos' + datosCaja.FechaConsulta + '.pdf');
      });
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

  ReporteProductosVendedorDia(datosCaja: CajaChicaInterface, formato: string) {
    console.log('datos caja', datosCaja );
    this.ConsultaRepProductosVendedorDia(datosCaja.FechaConsulta, datosCaja.dniVendedor, formato, datosCaja).then( listaProductos => {
      console.log('datos obtenidos', listaProductos);
      this.crearArchivoExportar(datosCaja, formato, listaProductos);
    });
  }

  async ConsultaRepProductosVendedorDia(dia: string, dniVendedor: string, extencionDoc: string, datosCaja: CajaChicaInterface) {
    let productosArray = [];
    return await  this.dataApi.obtenerVentaPorDiaVendedor(this.sede.toLowerCase(), dia, dniVendedor)
    .then( async (listaVentas: VentaInterface[]) => {
      if (!listaVentas.length) {
        productosArray = null;
        this.crearArchivoExportar(datosCaja, extencionDoc, null);
        return (productosArray);

      } else {
        for (const venta of listaVentas) {
          await this.dataApi.obtenerProductosDeVenta(venta.idListaProductos, this.sede ).then( productoVenta => {
            const produtosformteados: any[] = [];
            for (const producto of productoVenta) {
              produtosformteados.push({
                serieComprobante: venta.serieComprobante + '-' +
                this.digitosFaltantes('0', (8 - venta.numeroComprobante.length))  + venta.numeroComprobante, ... producto
              });
            }
            productosArray = [...productosArray, ... produtosformteados];
          });
        }
        return (productosArray);
      }
    });

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
        doc.text( this.nombreEmpresa, 75, 60);
        doc.text( this.RUC, 64, 70);
        doc.text( datosCaja.nombreVendedor, 81, 80);
        doc.text( datosCaja.estado, 98, 90);
        doc.setFontSize(12);
        doc.text( 'Fecha reporte: ' + datosCaja.FechaConsulta, 320, 60);
        doc.text( 'Establecimiento:', 185, 70);
        doc.text( 'Fecha y hora apertura:', 185, 80);
        doc.text( 'Fecha y hora cierre:', 185, 90);
        doc.setFontSize(11);
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
        const dataExcel = [];
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
          this.globalSrv.presentToast('Datos no encontrados', {color: 'warning', icon: 'alert-circle-outline', position: 'top'});
        }
      }
  }

  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }



}

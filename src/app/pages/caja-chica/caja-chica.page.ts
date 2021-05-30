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
  dniAdmi = this.storage.datosAdmi.dni;

  nombreVendedor: string;
  LogoEmpresa = GENERAL_CONFIG.datosEmpresa.logo;
  RUC = GENERAL_CONFIG.datosEmpresa.ruc;
  nombreEmpresa = GENERAL_CONFIG.datosEmpresa.razon_social;
  fechaActualFormateado = formatDate(new Date(), 'dd-MM-yyyy', 'en');

  listaCajaChica;

  loading;
  sinDatos: boolean;
  totalEnCaja = 0;

  ingresoCaja = 0;
  egresoCaja = 0;

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
      this.nombreVendedor = this.storage.datosAdmi.nombre;
    }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }
  listaCajaChicaSede(sede: string){
    this.dataApi.obtenerListaCajaChica(sede).subscribe(data => {
      if (data.length) {
        this.listaCajaChica = data;
        this.convertirFecha(this.listaCajaChica);
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
      }
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
  // ------------INICIO APERTURAR CERRAR CAJA CHICA------------
  async modalAperturaCajaChica(modoCaja: string, datos: any) {
    if (modoCaja === 'cerrar'){
      this.loading.dismiss();
      // await this.ReporteProductosVendedorDia( datos, 'pdf');
      await this.ReportePuntoVenta(datos);
      datos.saldoFinal = this.totalEnCaja;
    }
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
  // ------------INICIO APERTURAR CERRAR CAJA CHICA------------
  // ------------INICIO BORRAR CAJA------------
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
  // ------------FIN BORRAR CAJA------------
  // ------------INICIO CERRAR CAJA------------

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
          handler: async () => {
            await this.presentLoading('Consultando... Por Favor espere');
            this.modalAperturaCajaChica('cerrar', id);
          }
        }
      ]
    });
    await alert.present();
  }
  // ------------FIN CERRAR CAJA------------
  // ------------INICIO REPORTE INGRESO EGRESO GENERAL CAJA CHICA------------

  async ReportePDFDiaIngresoEgreso(){
    await this.presentLoading('Consultando... Por Favor espere');
    const dia = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    this.reportesservice.ReportePDFDiaIngresoEgreso(dia).then(() => {this.loading.dismiss(); });
  }
  // ------------FIN  REPORTE INGRESO EGRESO GENERAL CAJA CHICA------------
  // ------------INICIO REPORTE  GENERAL ------------

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
      await this.presentLoading('consultando Datos...');
      switch (data.action) {
        case 'a4': console.log('a4'); this.reportesservice.ReporteVentaDiaGeneralPDF(dia).then(() => this.loading.dismiss()); break;
        case 'ticked': console.log('ticked'); this.reportesservice.ReporteTiket(dia).then(() => this.loading.dismiss()); break;
      }
    }
  }
  // ------------FIN REPORTE  GENERAL ------------
  // ------------INICIO REPORTE  VENDEDOR TABLA METODOS PAGO (reporte) ------------

 async  ReportePuntoVenta(datosCaja: CajaChicaInterface) {
    this.totalEnCaja = 0;
    console.log('fecha consulta', datosCaja.FechaConsulta , ' dni', datosCaja.dniVendedor);
    await this.ConsultaPuntoVentaVendedor(datosCaja.FechaConsulta, datosCaja.id, 'ventas').then((data: any) => {
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;

      doc.setFontSize(18);
      // doc.setFont('bold');
      doc.text('Reporte Punto de Venta ' + this.convertirMayuscula(datosCaja.nombreVendedor), 120, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(110, 35, 320, 35);
      doc.rect(30, 50, 387, 110); // empty square
      doc.setFontSize(12);

      doc.text( 'Empresa: ' + this.nombreEmpresa, 40, 60);
      doc.text( 'RUC: ' + this.RUC, 40, 70);
      doc.text( 'Vendedor: ' + this.convertirMayuscula(datosCaja.nombreVendedor), 40, 80);
      doc.text( 'Establecimiento: ' + this.convertirMayuscula(datosCaja.sede), 185, 70);
      doc.text( 'Fecha: ' + datosCaja.FechaConsulta, 320, 60);
      doc.text( 'Estado de Caja: ' + this.convertirMayuscula(datosCaja.estado), 40, 90);
      doc.text( 'Fecha y hora apertura: ' + datosCaja.FechaApertura, 185, 80);
      doc.text( 'Fecha y hora cierre: ' + (datosCaja.FechaCierre ? datosCaja.FechaCierre : 'Aun no cerrado'), 185, 90);
      doc.text( 'MONTOS DE OPERACIÓN:', 40, 105);
      doc.text( 'Apertura Caja: '  + datosCaja.saldoInicial.toFixed(2), 40, 120);
      doc.text( 'Cierre Caja:   ' + datosCaja.saldoFinal.toFixed(2), 40, 130);
      doc.text( 'Ingresos: ' + (this.ingresoCaja ).toFixed(2), 185, 120);
      doc.text( 'Egresos: ' + (this.egresoCaja ).toFixed(2), 185, 130);
      doc.text( 'Total Ventas: ' + 'S./ ' + (data.totalGeneral).toFixed(2), 300, 130);
      doc.setFont('bolditalic', 'bold');
      doc.text( 'TOTAL SIN SALDO INICIAL: ' + 'S./ ' + (data.totalEfectivo + this.ingresoCaja - this.egresoCaja).toFixed(2), 185, 145);
      // tslint:disable-next-line:max-line-length
      this.totalEnCaja = datosCaja.saldoInicial + data.totalGeneral - data.totalTargeta + this.ingresoCaja - this.egresoCaja;
      doc.text( 'TOTAL CAJA: ' + 'S./ ' + (this.totalEnCaja ).toFixed(2), 40, 145);

      const metodoPago = [
        ['Efectivo', data.totalEfectivo.toFixed(2)],
        ['Tarjeta de credito o debito', data.totalTargeta.toFixed(2)],
        ['Total Ventas', data.totalGeneral.toFixed(2)],
      ];
      doc.autoTable({
        head: [['Descripción', 'suma']],
        body: metodoPago,
        startY: 180,
        theme: 'grid',
      });

      if (isNullOrUndefined(data.FormatoVentas)) {
      doc.text( 'No se encontraron registros.', 35, 150);
      } else {
        doc.autoTable({
          head: [['#', 'Tipo transacción', 'Tipo documento', 'Documento', 'Fecha emisión', 'Cliente' , 'N. Documento', 'Moneda', 'Total']],
          body: data.FormatoVentas,
          startY: false,
          theme: 'grid',
        });
      }
      window.open(doc.output('bloburl').toString(), '_blank');
      // doc.save('reporte Punto de Venta ' + formatDate(new Date(), 'dd-MM-yyyy', 'en') + '.pdf');
    });
  }

  ConsultaPuntoVentaVendedor(dia: string, idVendedor: string, tipo: string) {
    // tslint:disable-next-line:prefer-const
    let datosReportePuntoVentaVendedor = [];
    let totalEfectivo1 = 0;
    let totalTargeta1 = 0;
    let totalGeneral1 = 0;
    this.consultaIngresoEgresoCajaChica(dia, idVendedor);
    return this.dataApi.obtenerVentaPorDiaCajaChica(this.sede.toLowerCase(), dia, idVendedor).then( (snapshot: any) => {
      if (snapshot.length === 0) {
        const juntos = {
          FormatoVentas: null,
          totalEfectivo: totalEfectivo1,
          totalTargeta: totalTargeta1,
          totalGeneral: totalGeneral1,
        };
        return (juntos);
      } else {
        let contador = 0;
        snapshot.forEach(doc => {
          contador++;
          totalGeneral1 =  totalGeneral1 + doc.totalPagarVenta  ;

          if (doc.tipoPago === 'efectivo') {
          totalEfectivo1 =  totalEfectivo1 + doc.totalPagarVenta;
          }
          if (doc.tipoPago === 'tarjeta') {
          totalTargeta1 =  totalTargeta1 + doc.totalPagarVenta;
          }
          let formato: any;

          if (tipo === 'ventas'){
            formato = [
              contador,
              'Venta',
              doc.tipoComprobante.toUpperCase() || null,
              doc.serieComprobante + '-' + doc.numeroComprobante,
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
              doc.serieComprobante + '-' + doc.numeroComprobante,
              doc.tipoPago ? doc.tipoPago.toUpperCase() : null,
              'PEN',
              1,
              0.00,
              redondeoDecimal( doc.totalPagarVenta, 2).toFixed(2)

            ];

          }
          datosReportePuntoVentaVendedor.push(formato);
        });
        const juntos = {
          FormatoVentas: datosReportePuntoVentaVendedor,
          totalEfectivo: totalEfectivo1,
          totalTargeta: totalTargeta1,
          totalGeneral: totalGeneral1,
        };
        return juntos;
      }
    });
  }
  // ------------FIN REPORTE  VENDEDOR TABLA METODOS PAGO  (reporte)------------
  // ------------INICIO REPORTE  VENDEDOR TABLA METODOS PAGO (INGRESOS)------------

  ReporteIngresoMetPagoVendedor(datosCaja: CajaChicaInterface) {
    this.ConsultaPuntoVentaVendedor(datosCaja.FechaConsulta, datosCaja.id, 'ventasMetodoPago').then(data => {
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Resúmen de ingresos por métodos de pago', 100, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(100, 35, 305, 35);
      doc.rect(30, 50, 387, 50); // empty square
      doc.setFontSize(12);

      doc.text( 'Empresa: ' + this.nombreEmpresa, 40, 60);
      doc.text( 'RUC: ' + this.RUC, 40, 70);
      doc.text( 'Vendedor: ' + this.convertirMayuscula(datosCaja.nombreVendedor), 40, 80);
      doc.text( 'Estado de Caja: ' + this.convertirMayuscula(datosCaja.estado), 40, 90);
      doc.text( 'Fecha reporte: ' + datosCaja.FechaConsulta, 320, 60);
      doc.text( 'Establecimiento: ' + this.convertirMayuscula(datosCaja.sede) , 185, 70);
      doc.text( 'Fecha y hora apertura: ' + datosCaja.FechaApertura, 185, 80);
      doc.text( 'Fecha y hora cierre: ' + datosCaja.FechaCierre , 185, 90);
      const metodoPago = [
        [1, 'Efectivo', data.totalEfectivo.toFixed(2)],
        [2, 'Tarjeta de credito o debito', data.totalTargeta.toFixed(2)],
        [3, 'TOTAL VENTAS', data.totalGeneral.toFixed(2)],
      ];
      doc.autoTable({
        head: [['#', 'Descripción', 'suma']],
        body: metodoPago,
        startY: 110,
        theme: 'grid',
      });
      if (isNullOrUndefined(data.FormatoVentas)) {
        doc.text( 'No se encontraron registros.', 35, 150);
      } else {
        doc.autoTable({
          head: [['#', 'Fecha y hora emisión', 'Tipo documento', 'Documento', 'Método de pago', 'Moneda', 'Importe', 'Vuelto', 'Monto']],
          body: data.FormatoVentas,
          startY: false,
          theme: 'grid',
        });
        }
      window.open(doc.output('bloburl').toString(), '_blank');

    });
  }
  // ------------FIN REPORTE  VENDEDOR TABLA METODOS PAGO (INGRESOS)------------
  // ------------INICIO REPORTE PRODUCTOS CAJA PDF EXCEL------------

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

  async ReporteProductosVendedorDia(datosCaja: CajaChicaInterface, formato: string) {
    await this.presentLoading('Generando reporte...');
    console.log('datos caja', datosCaja );
    await this.ConsultaRepProductosVendedorDia(datosCaja.FechaConsulta, datosCaja.id)
    .then( async listaProductos => {
      console.log('datos obtenidos', listaProductos);
      const DatosFormateados = this.FormateandoProductosVentas( listaProductos.productos, listaProductos.listaDeVentas);
      console.log('Datos Formateados' + DatosFormateados);
      await this.crearArchivoExportar(datosCaja, formato, DatosFormateados);

    });
  }

  async ConsultaRepProductosVendedorDia(dia: string, idCajaChica: string) {
    let productosArray = [];
    return await  this.dataApi.obtenerVentaPorDiaCajaChica(this.sede.toLowerCase(), dia, idCajaChica)
    .then( async (listaVentas: VentaInterface[]) => {
      if (!listaVentas.length) {
        const juntos = {
          productos: null,
          listaDeVentas: null
        };
        return (juntos);

      } else {
        for (const venta of listaVentas) {
          if (venta.estadoVenta !== 'anulado'){
            await this.dataApi.obtenerProductosDeVenta(venta.idListaProductos, this.sede ).then( productoVenta => {
              const produtosformteados: any[] = [];
              for (const producto of productoVenta) {
                produtosformteados.push({
                  serieComprobante: venta.serieComprobante + '-'  + venta.numeroComprobante, ... producto
                });
              }
              productosArray = [...productosArray, ... produtosformteados];
            });
          }
        }
        const juntos = {
          productos: productosArray,
          listaDeVentas: listaVentas
        };
        return (juntos);
      }
    });
  }
  FormateandoProductosVentas(productos: any, ventas: any){
    const datosReporteIngresoPagoVendedorDia = [];
    let totalVentas1 = 0;
    let totalAnulados1 = 0;
    let descuento1 = 0;
    let totalEfectivo1 = 0;
    let totalETarjeta1 = 0;

    if (!isNullOrUndefined(ventas)){
      let contador = 0;
      for (const item of ventas) {
        if (item.estadoVenta === 'anulado'){
          totalAnulados1 += item.totalPagarVenta;
        }else {
          totalVentas1 += item.totalPagarVenta;
          if (item.tipoPago === 'efectivo') {
            totalEfectivo1 += item.totalPagarVenta;
          }
          if (item.tipoPago === 'tarjeta') {
            totalETarjeta1 += item.totalPagarVenta;
          }
          if (item.descuentoVenta) {
            descuento1 += item.descuentoVenta;
          }
        }
      }
      productos.forEach(datos => {
        contador++ ;
        // tslint:disable-next-line:no-shadowed-variable
        let formato: any;
        formato = [
          contador,
          this.convertirMayuscula(datos.producto.nombre) || null,
          (datos.cantidad || null) + '- ' + (datos.medida ? datos.medida : (datos.producto.medida || null) ) ,
          datos.serieComprobante || null,
          datos.totalxprod.toFixed(2) || null,
        ];
        datosReporteIngresoPagoVendedorDia.push(formato);
      });
      const juntos = {
        totalVentas: totalVentas1,
        totalAnulados: totalAnulados1,
        descuento: descuento1,
        totalEfectivo: totalEfectivo1,
        totalTarjeta: totalETarjeta1,
        FormatoProductos: datosReporteIngresoPagoVendedorDia,
        productosVenta: productos
      };
      return juntos;

    }else{
      const juntos = {
        totalVentas: totalVentas1,
        totalAnulados: totalAnulados1,
        descuento: descuento1,
        totalEfectivo: totalEfectivo1,
        totalTarjeta: totalETarjeta1,
        FormatoProductos: null,
        productosVenta: null
      };
      return juntos;
    }

  }
  async crearArchivoExportar(datosCaja: CajaChicaInterface, formato: string, DatosFormateados: any) {
    console.log('Datos Formateados', DatosFormateados);
    this.totalEnCaja = 0;
    if (formato === 'pdf') {
      await this.consultaIngresoEgresoCajaChica(datosCaja.FechaConsulta, datosCaja.id).then(datosIngresos => {
      console.log('formato pdf');
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Resúmen de ingresos por métodos de pago', 100, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(100, 35, 305, 35);
      doc.rect(30, 50, 387, 80); // empty square
      doc.setFontSize(12);
      doc.text( 'Empresa: ' + this.nombreEmpresa, 40, 60);
      doc.text( 'RUC: ' + this.RUC, 40, 70);
      doc.text( 'Vendedor: ' + datosCaja.nombreVendedor, 40, 80);
      doc.text( 'Estado de Caja: ' + datosCaja.estado, 40, 90);
      doc.setFontSize(12);
      doc.text( 'Fecha reporte: ' + datosCaja.FechaConsulta, 320, 60);
      doc.text( 'Hora: ' + formatDate(new Date(), 'HH:mm aa', 'en'), 320, 70);
      doc.text( 'Establecimiento: ' + this.convertirMayuscula(datosCaja.sede), 185, 70);
      doc.text( 'Fecha y hora apertura: ' + datosCaja.FechaApertura, 185, 80);
      doc.text( 'Fecha y hora cierre: ' + (datosCaja.FechaCierre ? datosCaja.FechaCierre : 'Aun no cerrado'), 185, 90);
      doc.text( 'Ingresos: ' + datosIngresos.ingresos.toFixed(2), 40, 110);
      doc.text( 'Egresos: ' + datosIngresos.egresos.toFixed(2), 185, 110);
      doc.setFont('Arial');
      doc.text( 'Total Venta: ' + DatosFormateados.totalVentas.toFixed(2), 40, 100);
      doc.text( 'Total Anulados: ' + DatosFormateados.totalAnulados.toFixed(2), 180, 100);
      doc.text( 'Saldo Inicial: ' + datosCaja.saldoInicial.toFixed(2), 300, 100);
      doc.text( 'Descuento: ' + DatosFormateados.descuento.toFixed(2) , 300, 110);
      doc.text( 'Total Efectivo: ' + DatosFormateados.totalEfectivo.toFixed(2) , 40, 120);
      doc.text( 'Total Tarjeta: ' + DatosFormateados.totalTarjeta.toFixed(2) , 180, 120);
      // tslint:disable-next-line:max-line-length
      this.totalEnCaja = datosCaja.saldoInicial + DatosFormateados.totalVentas + (datosIngresos.ingresos - datosIngresos.egresos ) - DatosFormateados.totalTarjeta;
      doc.text( 'TOTAL CAJA: ' + (this.totalEnCaja).toFixed(2) , 300, 120);

      if (isNullOrUndefined(DatosFormateados.FormatoProductos)) {
        if (!isNullOrUndefined(datosIngresos.formateadoIngresosCaja)) {
          doc.autoTable({
            head: [['#', 'Descripción', 'Tipo', 'Monto']],
            body: datosIngresos.formateadoIngresosCaja,
            startY: 140,
            theme: 'grid',
          });

        }else{
          doc.text( 'No se encontraron registros de Productos, Ingresos y Egresos.', 35, 140);
        }
      } else {
          doc.autoTable({
            head: [['#', 'Producto', 'cantidad', 'Comprobante', 'Precio']],
            body: DatosFormateados.FormatoProductos,
            startY: 140,
            theme: 'grid',
          });
          if (!isNullOrUndefined(datosIngresos.formateadoIngresosCaja)) {
            doc.autoTable({
              head: [['#', 'Descripción', 'Tipo', 'Monto']],
              body: datosIngresos.formateadoIngresosCaja,
              startY: false,
              theme: 'grid',
            });
          }
        }
      this.loading.dismiss();
      window.open(doc.output('bloburl').toString(), '_blank');
    });
      // doc.save('reporteProductos' + datosCaja.FechaConsulta + '.pdf');
    }
    if (formato === 'excel') {
      const dataExcel = [];
      this.loading.dismiss();
      if (!isNullOrUndefined(DatosFormateados.productosVenta)) {
        console.log(DatosFormateados.productosVenta);
        let contador = 0;
        const prod = [];
        DatosFormateados.productosVenta.forEach(datos => {
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
  consultaIngresoEgresoCajaChica(dia, idCaja: string) {
    console.log('INGRESOS EGRESOS', dia);
    let ingreso = 0;
    let egreso = 0;
    this.ingresoCaja = 0;
    this.egresoCaja = 0;
    // tslint:disable-next-line:prefer-const
    let formatoEgresosCaja = [];
    return this.dataApi.obtenerIngresoEgresoDiaCaja(this.sede.toLowerCase(), dia, idCaja).then( (snapshot: any) => {
      console.log('datos ingresos', snapshot);
      if (snapshot.length === 0) {
        this.ingresoCaja = 0;
        this.egresoCaja = 0;
        const juntos = {
          ingresos: 0,
          egresos: 0,
          formateadoIngresosCaja: null
        };
        return juntos;
      } else {
        let contador = 0;
        let formato1: any;
        snapshot.forEach(datos => {
          contador ++;
          if (datos.tipo === 'ingreso'){
            ingreso += parseFloat(datos.monto);
            } else if (datos.tipo === 'egreso') {
            egreso += parseFloat(datos.monto);
          }
          formato1 = [
            contador,
            this.convertirMayuscula(datos.detalles),
            datos.tipo ? this.convertirMayuscula(datos.tipo) : null,
            datos.monto ? parseFloat(datos.monto).toFixed(2) : null,
          ];
          formatoEgresosCaja.push(formato1);
        });
        this.ingresoCaja = ingreso;
        this.egresoCaja = egreso;
        const juntos = {
          ingresos: ingreso,
          egresos: egreso,
          formateadoIngresosCaja: formatoEgresosCaja
        };
        console.log('juntos', juntos);
        return juntos;
      }
    });

  }

  // ------------FIN REPORTE PRODUCTOS CAJA PDF EXCEL------------
  // ------------INICIO REPORTE TARJETAS------------
  ventasTarjeta(fechaFormateada) {
    let formatoListaVentasTarjeta = [];
    let sumaTotal = 0;
    return this.dataApi.obtenerVentasDiaTarjeta(this.sede, fechaFormateada).then(ventas => {
      console.log('ventas por tarjeta', ventas);
      if (ventas.length === 0){
          formatoListaVentasTarjeta = [];
          sumaTotal = 0;
          return { suma: sumaTotal, ventasTarjeta: formatoListaVentasTarjeta};
      }
      else{
        let contador = 0;
        ventas.forEach(datos => {
          contador++ ;
          if (datos.estadoVenta !== 'anulado'){
            sumaTotal += datos.totalPagarVenta;
          }
          let formato: any;
          formato = [
            contador,
           datos.vendedor.nombre.toUpperCase() || null,
           datos.tipoComprobante.toUpperCase() || null,
           datos.serieComprobante + '-' + datos.numeroComprobante,
           // tslint:disable-next-line:max-line-length
           datos.fechaEmision ? this.datePipe.transform(new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'short') : null,
           datos.cliente.nombre.toUpperCase() || null,
           datos.cliente.numDoc || null,
           // tslint:disable-next-line:max-line-length
           this.convertirMayuscula(datos.estadoVenta) ,
           this.convertirMayuscula(datos.tipoPago),
           redondeoDecimal( datos.totalPagarVenta, 2).toFixed(2)
          ];
          formatoListaVentasTarjeta.push(formato);
          });
        return { suma: sumaTotal, ventasTarjeta: formatoListaVentasTarjeta};
      }

    }).catch(err => console.log(err));
  }
  async GenerarPDFReporteVentasTarjeta(fechaFormateada) {
    await this.presentLoading('Generando Reporte...');
    this.ventasTarjeta(fechaFormateada).then((VentasFormateada: any) => {
      const ListaVentasTarjeta = VentasFormateada.ventasTarjeta;
      const sumaTotal = VentasFormateada.suma;
      console.log('Ventas Formateadas' + VentasFormateada.ventasTarjeta + VentasFormateada.suma);
      const doc = new jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
      doc.setFontSize(16);
      doc.setFont('bold');
      doc.text('Resúmen General de Ventas por Tarjeta : ', 100, 30);
      doc.addImage(this.LogoEmpresa, 'JPEG', 370, 20, 30, 15);
      doc.setLineWidth(0.5);
      doc.line(100, 35, 305, 35);
      doc.rect(30, 50, 387, 45); // empty square
      doc.setFontSize(12);
      doc.text( 'Empresa: ' + this.nombreEmpresa, 40, 60);
      doc.text( 'RUC: ' + this.RUC, 40, 70);
      doc.text( 'SEDE: ' + this.sede, 40, 80);
      doc.text( 'Fecha reporte: ' + fechaFormateada, 300, 60);
      doc.text( 'TOTAL VENTAS: ' + sumaTotal.toFixed(2) , 300, 80);
      if ( ListaVentasTarjeta.length){
        doc.autoTable({
          head: [['#', 'Vend.', 'Tipo Doc.', 'Num Doc.', 'Fecha emisión', 'Cliente' , 'N. Doc.', 'Estado', 'M pago', 'Total']],
          body: ListaVentasTarjeta,
          startY: 110,
          theme: 'grid',
        });
      }
      else {
        doc.text( 'No se encontraron registros.', 40, 110);
      }
      this.loading.dismiss();
      window.open(doc.output('bloburl').toString(), '_blank');

    });
  }
  // ------------FIN REPORTE TARJETAS------------
  // ------------INICIO REPORTE INGRESOS EGRESOS POR VENDEDOR------------
  ReporteVendedorDiaIngresoEgreso(){
    const dia = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    this.reportesservice.ReportePDFDiaIngresoEgresoVendedor(dia, this.dniAdmi, this.storage.datosAdmi.nombre);
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
  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      // duration: 5000
    });
    await this.loading.present();
  }



}

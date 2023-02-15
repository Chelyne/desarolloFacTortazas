import { Component, OnInit } from '@angular/core';
import { DbDataService } from 'src/app/services/db-data.service';
import { MenuController, PopoverController, LoadingController } from '@ionic/angular';
import { ExportarPDFService } from '../../services/exportar-pdf.service';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { PopoverMesesComponent } from '../../components/popover-meses/popover-meses.component';
import { StorageService } from 'src/app/services/storage.service';
import { FormGroup, FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { ReportesService } from '../../services/reportes.service';
import * as FileSaver from 'file-saver';
import { timer } from 'rxjs';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from 'src/app/global/global.service';
import { BoletasFacturasService } from '../../services/boletas-facturas.service';
import { formatearDateTime } from 'src/app/global/funciones-globales';
import { CategoriaInterface } from '../../models/CategoriaInterface';
import { GLOBAL_FACTOR_ICBPER } from 'src/config/otherConfig';

@Component({
  selector: 'app-reporte-ventas',
  templateUrl: './reporte-ventas.page.html',
  styleUrls: ['./reporte-ventas.page.scss'],
})
export class ReporteVentasPage implements OnInit {
  arrayMes = [];
  sede = this.storage.datosAdmi.sede.toLocaleLowerCase();
  ventasDiaForm: FormGroup;

  contador = 0;
  contadorXML = 0;
  mesActual;
  loading;
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  fechaActual;
  fechaLimite;
  fechaInicio;
  fechaFinal;
  listaDeCategorias: CategoriaInterface[] = [{ categoria: 'accesorios' }];

  constructor(
               private dataApi: DataBaseService,
               private globalSrv: GlobalService,
               private excelService: ExportarPDFService,
               private menuCtrl: MenuController,
               private popoverCtrl: PopoverController,
               private storage: StorageService,
               private reportesservice: ReportesService,
               private comprobanteSrv: BoletasFacturasService,
               private loadingController: LoadingController
              ) {
                this.ventasDiaForm = this.createFormGroup();
              }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // this.ObtenerVentas();
    this.mesActual = this.meses[moment().month()];
    this.fechaActual = formatearDateTime('YYYY-MM-DD');
    this.fechaLimite = this.fechaActual;
    this.ObtenerCategorias();

    // this.ObtenerVentas();
  }

  createFormGroup() {
    return new FormGroup({
      fechadeventa: new FormControl(),
    });
  }

  ObtenerVentasDia(ev: any) {
    if (isNullOrUndefined(this.ventasDiaForm.value.fechadeventa)) {
      this.globalSrv.presentToast('Ingrese Fecha', {color: 'warning', position: 'top'});

    }else {
      this.ventasDiaForm.value.fechadeventa = this.ventasDiaForm.value.fechadeventa.split('-').reverse().join('-');
      console.log(this.ventasDiaForm.value.fechadeventa);
      this.ReporteVentaGeneralDia(ev, this.ventasDiaForm.value.fechadeventa);

    }
  }

  async ReporteVentaGeneralDia(ev: any, dia: any){
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
      this.presentLoading('Consultando Datos...Por favor espere.....');
      switch (data.action) {
        case 'a4': console.log('a4'); this.reportesservice.ReporteVentaDiaGeneralPDF(dia).then(() => this.loading.dismiss());  break;
        case 'ticked': console.log('ticked'); this.reportesservice.ReporteTiket(dia).then(() => this.loading.dismiss()); break;
      }
    }
  }

  ReporteProoductosSede(){
    this.presentLoading('Por favor espere.....');
    const dataExcel = [];
    const sus = this.dataApi.obtenerListaProductosSinLIMITE(this.storage.datosAdmi.sede).subscribe((data: any) => {
      sus.unsubscribe();
      console.log(data);
      if (data.length === 0){
        this.loading.dismiss();
        this.globalSrv.presentToast('No hay productos de sede: ' + this.sede, {color: 'danger', position: 'top'});
      }else{
        for (const datos of data) {
          if (datos.medida !== 'servicios'){
            const formato: any = {
              UID: datos.id,
              'Nombre Producto': datos.nombre.toUpperCase(),
              Codigo: datos.codigo ? datos.codigo : null,
              'Codigo Barra': datos.codigoBarra ? datos.codigoBarra : null,
              Stock: datos.cantStock ? datos.cantStock  : null,
              Categoria: datos.subCategoria ? datos.subCategoria : null,
              Estado: null
            };
            this.loading.dismiss();
            dataExcel.push(formato);
          }
        }
        this.excelService.exportAsExcelFile(dataExcel, 'ReporteProductos' + this.sede);

      }
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

  ObtenerVentasMes(){
    this.presentLoading('Por favor espere...');
    const d = new Date();
    const mes = d.getMonth() + 1;
    const anio = d.getFullYear();
    this.ObtenerVentasMesAnio(mes, anio).then(() => {
      this.loading.dismiss();
    });
  }

  async ObtenerVentasMesAnio(mes: number, anio: number) {
    this.arrayMes = [];
    let formato: string;
    for (let contador = 1 ; contador <= 31; contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + ((mes <= 9 ) ? '0' + mes : mes)  + '-' + anio;
      await this.dataApi.obtenerVentasBoletasFacturasPorDia(this.sede.toLocaleLowerCase(), formato).then(async (res: any) => {
        if (res.length === 0) {
          console.log('no hay datos de dia', contador );
        }else {
          console.log('datos de dia', contador );
          console.log('datos ', res );
          for (const venta of res) {
            if (venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura'){
              // this.arrayMes = [...this.arrayMes, ...res];
              this.arrayMes = [...this.arrayMes, venta];

              }
          }
        }
        if (contador === 31) {
        console.log('boletas y facturas ', this.arrayMes);
        if (!this.arrayMes.length) {
          this.globalSrv.presentToast('No hay productos de sede: ' + this.sede, {color: 'danger', position: 'top'});

        } else {
          // tslint:disable-next-line:no-shadowed-variable
          let contador = 0;
          console.log('total ', this.arrayMes);
          this.exelVentas(this.arrayMes, mes, anio);


          // for (const venta of this.arrayMes) {
          //   contador++;
          //   await this.dataApi.obtenerProductosDeVenta(venta.idListaProductos, this.sede ).then( productoVenta => {
          //     let  nombres = '';
          //     console.log('producto venta', productoVenta);
          //     for (const item2 of productoVenta) {
          //       // if (item2.subCategoria === 'cortes' || item2.subCategoria === 'servicio') {
          //         nombres = nombres + item2.producto.nombre.toUpperCase()  + '( s/. ' + (item2.totalxprod ) + ')' + ', ';
          //         venta.productos = nombres;
          //         console.log('item:' ,  item2.producto.nombre + '(' + item2.producto.precio  + ')');

          //       // }
          //     }
          //     if (contador === this.arrayMes.length) {
          //     console.log(this.arrayMes);
          //     this.exelVentas(this.arrayMes, mes, anio);

          //     }
          //   });
          // }
        }
        }
      });
    }
  }

  async ReporteVentaMes(ev: any){
    console.log(ev);
    const popover = await this.popoverCtrl.create({
      component: PopoverMesesComponent,
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        mes: true
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      this.presentLoading('Por favor espere....');
      const d = new Date();
      const mes = data.action;
      const anio = d.getFullYear();
      this.ObtenerVentasMesAnio(mes, anio).then(() => this.loading.dismiss());
    }

  }

  async exelVentas(data, mes: number, anio: number, fechas?: string) {
    console.log('PRODUCTOS', data);
    // tslint:disable-next-line:prefer-const
    let dataExcel = [];
    if (data.length === 0) {
      console.log('toast de no hay datos');
      this.globalSrv.presentToast('No existe datos del mes ', {color: 'danger', position: 'top'});
    }else {
      let contador = 0;
      console.log('datos', data);
      for (const datos of data) {
        contador++;
        // tslint:disable-next-line:prefer-const
        let FechaConsulta = new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm'));
        const formato: any = {
          'Nombre/Razon social': datos.cliente.nombre.toUpperCase(),
          'Tipo Doc': datos.cliente.tipoDoc.toUpperCase(),
          'DNI/RUC': datos.cliente.numDoc,
          'Tipo Comprobante': datos.tipoComprobante.toUpperCase(),
          // tslint:disable-next-line:max-line-length
          'Serie Comprobante': datos.serieComprobante,
          // tslint:disable-next-line:max-line-length
          'Num. Comprobante': datos.numeroComprobante,
          // tslint:disable-next-line:max-line-length
          'Serie con Numero': datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,
          'Grabada: ': (datos.montoBase).toFixed(2),
          'Exonerada: ': '0.00',
          'Inafecta: ': '0.00',
          'Igv: ': (datos.igv).toFixed(2),
          'Imp. bolsa': (datos.cantidadBolsa * GLOBAL_FACTOR_ICBPER).toFixed(2),
          'Monto Pagado': datos.totalPagarVenta,
          'Metodo Pago': datos.tipoPago.toUpperCase(),
          'Fecha Emision': formatDate(FechaConsulta, 'dd-MM-yyyy', 'en'),
          'Sede: ': datos.vendedor.sede,
          'Estado Comprobante': datos.estadoVenta,
          'Descuento ': datos.descuentoVenta ? datos.descuentoVenta : null ,
          'Nota de Crédito ': datos.cdrAnulado ? datos.cdrAnulado.serie + '-' + datos.cdrAnulado.correlacion : null ,
          'Servicio / Producto ': datos.productos ? datos.productos : null ,
        };
        dataExcel.push(formato);
        if (contador === data.length){
          this.excelService.exportAsExcelFile(dataExcel, 'ReporteVentas ' + this.sede + mes + '-' + anio + (fechas ? fechas : '' ));
        }
      }
    }

  }
  async ObtenerVentasMesAnioDescargarComprobantes(mes: number, anio: number) {
    this.presentLoading('Consultando Comprobantes... Por Favor Espere...');
    console.log(mes, anio);
    this.arrayMes = [];
    let formato: string;
    for (let contador = 1 ; contador <= 31; contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + ((mes <= 9 ) ? '0' + mes : mes)  + '-' + anio;
      await this.dataApi.obtenerVentasBoletasFacturasPorDia(this.sede.toLocaleLowerCase(), formato).then(async (res: any) => {
        if (res.length === 0) {
          console.log('no hay datos de dia', contador );
        }else {
          console.log('datos de dia', contador );
          this.arrayMes = [...this.arrayMes, ...res];
        }
        if (contador === 31) {
        if (!this.arrayMes.length) {
          this.loading.dismiss();
          this.globalSrv.presentToast('No hay productos de sede: ' + this.sede, {color: 'danger', position: 'top'});

        } else {
          // tslint:disable-next-line:no-shadowed-variable
          let contadorarray = 0;
          let ContadorBoletas = 0;

          for (const venta of this.arrayMes) {
            contadorarray++;
            if (venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura') {
              ContadorBoletas++ ;
              await this.comprobanteSrv.generarComprobante(venta, this.sede);
            }
            if (contadorarray === this.arrayMes.length) {
              console.log(this.arrayMes);
              console.log('BOLEEETAS: ', ContadorBoletas);
              this.loading.dismiss();

              this.globalSrv.presentToast('se descarganron todos los comprobantes' + ContadorBoletas);

              }
          }
        }
        }
      });
    }
  }

  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }

  async obtenerZipXml(mes: number, anio: number) {
    this.arrayMes = [];
    let formato: string;
    // tslint:disable-next-line:no-shadowed-variable
    for (let contador = 1 ; contador <= 31; contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + ((mes <= 9 ) ? '0' + mes : mes)  + '-' + anio;
      console.log(formato);
      await this.dataApi.obtenerVentasPorDia(this.sede.toLocaleLowerCase(), formato).then(async (res: any) => {
        if (res.length === 0) {
          console.log('no hay datos de dia', contador );
        }else {
          console.log('datos de dia', contador );
          this.arrayMes = [...this.arrayMes, ...res];
        }
        if (contador === 31) {
          console.log('todos datos', this.arrayMes);
          this.saveZip().then(() => {
            console.log('generando ZIP');
          });
          this.saveXml().then(() => {
            console.log('generando XML');
          });
        }
      });
    }
  }



  // async saveZip(cdrZip, nombre) {
  //   const data = await this.base64ToBlob(cdrZip);
  //   // this.base64ToBlob(cdrZip).then((data: any) => {
  //   //   FileSaver.saveAs(data, nombre);
  //   // });
  //   await FileSaver.saveAs(data, nombre);
  // }


  async saveZip() {
    const lista = [];
    this.arrayMes.forEach(element => {
      // tslint:disable-next-line:max-line-length
      if ((element.tipoComprobante === 'boleta' || element.tipoComprobante === 'factura') && element.cdr && (element.cdr.sunatResponse.success === true)) {
        lista.push(element);
      }
    });
    console.log('FUNCION', this.contador, lista.length);
    const promesa = await new Promise<void>((resolve, reject) => {
      if (this.contador < lista.length) {
        console.log('arrayMes', this.arrayMes);
        console.log('UNO', this.arrayMes[this.contador]);
        if (lista[this.contador] && lista[this.contador].cdr) {
          console.log(lista[this.contador]);
          const binaryString = window.atob(lista[this.contador].cdr.sunatResponse.cdrZip);
          const binaryLen = binaryString.length;
          const ab = new ArrayBuffer(binaryLen);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < binaryLen; i++) {
            ia[i] = binaryString.charCodeAt(i);
          }
          // tslint:disable-next-line:prefer-const
          let bb: any = new Blob([ab]);
          bb.lastModifiedDate = new Date();
          bb.name = 'archive.zip';
          // bb.type = 'zip';
          // return bb;
          FileSaver.saveAs(bb, lista[this.contador].serieComprobante + '-' + lista[this.contador].numeroComprobante + '.zip');
          this.contador ++;
          timer(2000).subscribe(() => {
            this.saveZip();
          });
        }
      } else {
        console.log('FIN');
        resolve();
        return promesa;
      }
    });
  }


  async saveXml() {
    const lista = [];
    this.arrayMes.forEach(element => {
      // tslint:disable-next-line:max-line-length
      if ((element.tipoComprobante === 'boleta' || element.tipoComprobante === 'factura') && element.cdr && (element.cdr.sunatResponse.success === true)) {
        lista.push(element);
      }
    });
    const promesa = await new Promise<void>((resolve, reject) => {
      if (this.contadorXML < lista.length) {
        const fileToExport = new Blob([lista[this.contadorXML].cdr.xml], {type: 'text/xml'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(fileToExport);
        a.target = '_blank';
        a.download = lista[this.contadorXML].serieComprobante + '-' + lista[this.contadorXML].numeroComprobante + '.xml';
        a.click();
        this.contadorXML ++;
        timer(2000).subscribe(() => {
          this.saveXml();
        });
      } else {
        console.log('FIN XML');
        resolve();
        return promesa;
      }
    });
  }
  // REPORTE POR CATEGORIAS
  ObtenerCategorias() {
    this.dataApi.obtenerListaCategorias(this.sede).subscribe(data => {
      if (data.length) {
        this.listaDeCategorias = data;
      } else {
        this.globalSrv.presentToast('Por favor agregue un categoria para agregar productos');
      }
    });
  }

  BuscarProductosCategoria(ev: any){
    console.log('cambiando', ev.target.value);
    const categoria = ev.target.value;
    this.presentLoading('Consultando Productos... Por Favor Espere...');
    const dataExcel = [];
    const sus = this.dataApi.obtenerListaProductosCategoriaSinLIMITE(this.storage.datosAdmi.sede, categoria).subscribe((data: any) => {
      sus.unsubscribe();
      console.log(data);
      if (data.length === 0){
        this.loading.dismiss();
        this.globalSrv.presentToast('No hay productos de ' + categoria + ' en la sede ' + this.sede, {color: 'danger', position: 'top'});
      }else{
        for (const datos of data) {
          if (datos.medida !== 'servicios'){
            const formato: any = {
              // UID: datos.id,
              'Nombre Producto': datos.nombre.toUpperCase(),
              Codigo: datos.codigo ? datos.codigo : null,
              'Codigo Barra': datos.codigoBarra ? datos.codigoBarra : null,
              Stock: datos.cantStock ? datos.cantStock  : null,
              Categoria: datos.subCategoria ? datos.subCategoria : null,
              Estado: null
            };
            this.loading.dismiss();
            dataExcel.push(formato);
          }
        }
        this.excelService.exportAsExcelFile(dataExcel, 'ReporteCategoria' + '_' + categoria + '_' + this.sede);

      }
    });

  }
  // REPORTE ENTRE FECHAS
  actualizarFechaLimite(event){
    const dateObj1 = new Date(this.fechaInicio);
    if (!isNullOrUndefined(this.fechaInicio) ){
      if (this.fechaActual.split('-')[1] === this.fechaInicio.split('-')[1]){
        console.log('es igual');
        this.fechaLimite = this.fechaActual;
      }else {
        const anio = moment(dateObj1).year();
        const mes = moment(dateObj1).month();
        const diasMes = new Date(anio, mes + 1, 0).getDate();
        console.log('el mes: ', mes + 1 , ' tiene ' + diasMes + ' dias.'  );
        this.fechaLimite = anio.toString() + '-' +  this.fechaInicio.split('-')[1] + '-' + diasMes;
        console.log('fecha limite', this.fechaLimite );
      }
    }
    this.fechaFinal = null;
  }
  ObtenerVentasEntreFechas(){
    this.presentLoading('Por favor espere...');
    const d = new Date();
    const mes = d.getMonth() + 1;
    const anio = d.getFullYear();
    this.ObtenerReporteEntreFechas().then(() => {
      this.loading.dismiss();
    });
  }
  async ObtenerReporteEntreFechas(){
    const diaInicio = this.fechaInicio.split('-')[2];
    const diaFin = this.fechaFinal.split('-')[2];
    const mes = this.fechaFinal.split('-')[1];
    const anio = this.fechaInicio.split('-')[0];
    let formato: string;
    this.arrayMes = [];
    console.log('reporte entre fechas', diaInicio, diaFin, mes);

    for (let contador = parseInt( diaInicio, 10 ) ; contador <= parseInt( diaFin, 10 ); contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + mes  + '-' + anio;
      console.log(formato);
      await this.dataApi.obtenerVentasPorDia(this.sede.toLocaleLowerCase(), formato).then(async (res: any) => {
        if (res.length === 0) {
          console.log('no hay datos de dia', contador );
        }else {
          console.log('datos de dia', contador );
          console.log('datos ', res );
          for (const venta of res) {
            // if (venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura'){
              // this.arrayMes = [...this.arrayMes, ...res];
              this.arrayMes = [...this.arrayMes, venta];

              // }
          }
        }
        if (contador === parseInt( diaFin, 10 )) {
        console.log('boletas y facturas ', this.arrayMes);
        if (!this.arrayMes.length) {
          this.globalSrv.presentToast('No hay productos de sede: ' + this.sede, {color: 'danger', position: 'top'});
          this.fechaInicio = null;
          this.fechaFinal = null;

        } else {
          this.exelVentas(this.arrayMes, mes, anio, '(' + this.fechaInicio + 'hasta' + this.fechaFinal + ')');
          this.fechaInicio = null;
          this.fechaFinal = null;

          // tslint:disable-next-line:no-shadowed-variable
          // let contador = 0;
          console.log('total ', this.arrayMes);


          // for (const venta of this.arrayMes) {
          //   contador++;
          //   await this.dataApi.obtenerProductosDeVenta(venta.idListaProductos, this.sede ).then( productoVenta => {
          //     let  nombres = '';
          //     console.log('producto venta', productoVenta);
          //     for (const item2 of productoVenta) {
          //       // if (item2.subCategoria === 'cortes' || item2.subCategoria === 'servicio') {
          //         nombres = nombres + item2.producto.nombre.toUpperCase()  + '( s/. ' + (item2.totalxprod ) + ')' + ', ';
          //         venta.productos = nombres;
          //         console.log('item:' ,  item2.producto.nombre + '(' + item2.producto.precio  + ')');

          //       // }
          //     }
          //     if (contador === this.arrayMes.length) {
          //     console.log(this.arrayMes);
          //     this.exelVentas(this.arrayMes, mes, anio);

          //     }
          //   });
          // }
        }
        }
      });

    }

  }

}

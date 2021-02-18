import { Component, OnInit } from '@angular/core';
import { DbDataService } from 'src/app/services/db-data.service';
import { MenuController, ToastController, PopoverController } from '@ionic/angular';
import { ExportarPDFService } from '../../services/exportar-pdf.service';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { PopoverMesesComponent } from '../../components/popover-meses/popover-meses.component';
import { StorageService } from 'src/app/services/storage.service';
import { FormGroup, FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reporte-ventas',
  templateUrl: './reporte-ventas.page.html',
  styleUrls: ['./reporte-ventas.page.scss'],
})
export class ReporteVentasPage implements OnInit {
  arrayMes = [];
  sede: string;
  ventasDiaForm: FormGroup;

  constructor( private dataSrvc: DbDataService,
               private excelService: ExportarPDFService,
               private menuCtrl: MenuController,
               private toastController: ToastController,
               private popoverCtrl: PopoverController,
               private storage: StorageService,
               private reportesservice: ReportesService
              ) {
                this.sede = this.storage.datosAdmi.sede;
                this.ventasDiaForm = this.createFormGroup();

              }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // this.ObtenerVentas();
  }
  createFormGroup() {
    return new FormGroup({
      fechadeventa: new FormControl(),
    });
  }
  ReporteProoductosSede(){
    const dataExcel = [];
    const sus = this.dataSrvc.ObtenerListaProductosSinLIMITE(this.storage.datosAdmi.sede).subscribe((data: any) => {
      sus.unsubscribe();
      console.log(data);
      if (isNullOrUndefined(data)){
        this.presentToast('no hay productos de sede: ' + this.sede, 'danger');
      }else{
        for (const datos of data) {
          const formato: any = {
            'Nombre Producto': datos.nombre.toUpperCase(),
            Codigo: datos.codigo ? datos.codigo : null,
            'Codigo Barra': datos.codigoBarra ? datos.codigoBarra : null,
            Stock: datos.cantStock,
            Estado: null
          };
          dataExcel.push(formato);
        }
        this.excelService.exportAsExcelFile(dataExcel, 'ReporteProductos' + this.sede);

      }
    });
  }
  ObtenerVentasDia(ev: any) {
    if (isNullOrUndefined(this.ventasDiaForm.value.fechadeventa)) {
      this.presentToast('Ingrese Fecha', 'warning');

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
      switch (data.action) {
        case 'a4': console.log('a4'); this.reportesservice.ReporteVentaDiaGeneralPDF(dia); break;
        case 'ticked': console.log('ticked'); this.reportesservice.ReporteTiket(dia); break;
      }
    }
  }
  ObtenerVentasMes(){
    const d = new Date();
    const mes = d.getMonth() + 1;
    const anio = d.getFullYear();
    this.ObtenerVentasMesAnio(mes, anio);
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
      const d = new Date();
      const mes = data.action;
      const anio = d.getFullYear();
      // console.log(data);
      this.ObtenerVentasMesAnio(mes, anio);
    }

  }
  // tslint:disable-next-line:member-ordering
  async ObtenerVentasMesAnio(mes: number, anio: number) {
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa', this.sede.toLocaleLowerCase());
    this.arrayMes = [];
    let formato: string;
    // tslint:disable-next-line:no-shadowed-variable
    for (let contador = 1 ; contador <= 31; contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + ((mes <= 9 ) ? '0' + mes : mes)  + '-' + anio;
      await this.dataSrvc.listaVentasDia(this.sede.toLocaleLowerCase(), formato).subscribe((res: any) => {
        if (res.length === 0) {
          console.log('no hay datos de dia', contador );
        }else {
          console.log('datos de dia', contador );
          this.arrayMes = [...this.arrayMes, ...res];
          // console.log('fecha', formato, res);
        }
        if (contador === 31) {
        console.log('todos datos', this.arrayMes);
        this.exelVentas(this.arrayMes, mes, anio);


        }
      });
    }
  }
  exelVentas(data, mes: number, anio: number) {
    console.log('datos');
    // tslint:disable-next-line:prefer-const
    let dataExcel = [];
    if (data.length === 0) {
      console.log('toast de no hay datos');
      this.presentToast('No existe datos del mes ', 'danger');

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
          'Monto Pagado': datos.totalPagarVenta,
          'Metodo Pago': datos.tipoPago.toUpperCase(),
          'Fecha Emision': formatDate(FechaConsulta, 'dd-MM-yyyy', 'en'),
          'Cant. bolsa': datos.cantidadBolsa,
          'Sede: ': datos.vendedor.sede,
          'Estado Comprobante': datos.estadoVenta,

        };
        dataExcel.push(formato);
        if (contador === data.length){
          this.excelService.exportAsExcelFile(dataExcel, 'ReporteVentas ' + mes + '-' + anio);
        }
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
  async presentToast(mensaje: string, colors?: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: colors,
      position: 'top'
    });
    toast.present();
  }

}

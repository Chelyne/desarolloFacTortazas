import { Component, OnInit } from '@angular/core';
import { DbDataService } from 'src/app/services/db-data.service';
import { MenuController, ToastController, PopoverController } from '@ionic/angular';
import { ExportarPDFService } from '../../services/exportar-pdf.service';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { PopoverMesesComponent } from '../../components/popover-meses/popover-meses.component';

@Component({
  selector: 'app-reporte-ventas',
  templateUrl: './reporte-ventas.page.html',
  styleUrls: ['./reporte-ventas.page.scss'],
})
export class ReporteVentasPage implements OnInit {
  arrayMes = [];
  constructor( private dataSrvc: DbDataService,
               private excelService: ExportarPDFService,
               private menuCtrl: MenuController,
               private toastController: ToastController,
               private popoverCtrl: PopoverController
              ) { }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // this.ObtenerVentas();
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
    this.arrayMes = [];
    let formato: string;
    // tslint:disable-next-line:no-shadowed-variable
    for (let contador = 1 ; contador <= 31; contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + ((mes <= 9 ) ? '0' + mes : mes)  + '-' + anio;
      await this.dataSrvc.listaVentasDia('andahuaylas', formato).subscribe((res: any) => {
        if (res.length === 0) {
          console.log('no hay datos', formato );
        }else {
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
          'Estado Comprobante': datos.estadoVenta

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

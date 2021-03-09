import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { MenuController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { formatDate, DatePipe } from '@angular/common';
import { DataBaseService } from '../../services/data-base.service';
import * as moment from 'moment';
import { formatearDateTime } from '../../global/funciones-globales';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  providers: [
    DatePipe
  ]
})
export class DashboardPage implements OnInit {
  sede = this.storge.datosAdmi.sede.toLocaleLowerCase();
  periodo = 'hoy';
  fechaActual = formatDate(new Date(), 'fullDate', 'es');
  private investmentchart: Chart;

  customYearValues = [2020, 2016, 2008, 2004, 2000, 1996];
  customDayShortNames = ['s\u00f8n', 'man', 'tir', 'ons', 'tor', 'fre', 'l\u00f8r'];
  customPickerOptions: any;

  // TOTAL POR COMPROBANTE
  totalBoleta = 0;
  totalFactura = 0;
  totalNotaVenta = 0;

  // TOTAL INGRESO EGRESO
  totalIngreso = 0;
  totalEgreso = 0;

  constructor(
    private menuCtrl: MenuController,
    private storge: StorageService,
    private dataApi: DataBaseService,
    private datePipe: DatePipe
  ){
    this.menuCtrl.enable(true);
    this.customPickerOptions = {
      buttons: [{
        text: 'Save',
        handler: () => console.log('Clicked Save!')
      }, {
        text: 'Log',
        handler: () => {
          console.log('Clicked Log. Do not Dismiss.');
          return false;
        }
      }]
    };

  }

  async ngOnInit() {
    this.consultaVentas();
    this.consultaIngresosEgresos();
  }

  consultaIngresosEgresos() {
    const hoy  = formatDate(new Date(), 'dd-MM-yyyy', 'es');
    this.dataApi.obtenerIngresoEgresoDia(this.sede, hoy).then(data => {
      console.log(data);
      if (data.length) {
        for (const iterator of data) {
          if (iterator.tipo === 'ingreso') {
            this.totalIngreso += parseInt(iterator.monto, 10);
          }
          if (iterator.tipo === 'egreso') {
            this.totalEgreso += parseInt(iterator.monto, 10);
          }
        }
      }
    });
  }

  consultaVentas() {
    const hoy  = formatDate(new Date(), 'dd-MM-yyyy', 'es');
    this.dataApi.ObtenerListaDeVentas(this.sede, hoy).subscribe(ventas => {
      console.log('VENTAS: ', ventas);
      const datos = [];
      const intervalo = [];
      for (let index = 6; index <= 22; index++) {
        datos[index] = 0;
        let hora;
        if (index < 12) {
          hora = index + 'AM';
        } else {
          hora = index + 'PM';
        }
        intervalo.push(hora);
      }
      for (const venta of ventas) {
        // COMPROBAR CON LIBIO
        const date = formatearDateTime('H', venta.fechaEmision);
        // const date = this.datePipe.transform(new Date(moment.unix(venta.fechaEmision.seconds).format('D MMM YYYY H:mm')), 'H');
        console.log('DAAAAAAATE: ', date);
        if (venta.tipoComprobante === 'boleta' && venta.estadoVenta !== 'anulado') {
          this.totalBoleta += venta.totalPagarVenta;
          datos[date] += 1;
        }
        if (venta.tipoComprobante === 'factura' && venta.estadoVenta !== 'anulado') {
          this.totalFactura += venta.totalPagarVenta;
          datos[date] += 1;
        }
        if (venta.tipoComprobante === 'n. venta' && venta.estadoVenta !== 'anulado') {
          this.totalNotaVenta += venta.totalPagarVenta;
          datos[date] += 1;
        }
      }
      this.generarChartsNotasVenta();
      this.generarChardsConprovantes();
      // tslint:disable-next-line:max-line-length
      // const intervalo = ['6AM', '7A', '03d', '04d', '05d', '06d', '07d', '08d', '09d', '10d', '11d', '12d', '13d', '14d', '15d', '16d', '17d', '18d', '19d', '20d', '21d', '22d', '23d', '24d', '25d', '26d', '27d', '28d', '29d', '30d', '31d'];
      const arrayDatos = this.resetArray(datos);
      console.log('data: ', datos, arrayDatos);
      this.generarChardsVentas(intervalo, arrayDatos);

      this.generarChartsBalanceIngresoEgreso();
      this.generarChardsGanancias();
      this.generarChardsCompras();
    });
  }

  resetArray(array: number[]) {
    console.log(array);
    const newArr: number[] = [];
    let count = 0;
    // tslint:disable-next-line:forin
    for (const iterator in array) {
      newArr[count++] = array[iterator];
    }
    return newArr;
}

  // NOTA DE VENTA
  generarChartsNotasVenta() {
    const ctx = 'chartNotasVenta';
    this.investmentchart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['#', 'Notas de venta'],
        datasets: [{
          label: '# of Votes',
          data: [0, this.totalNotaVenta],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 2,
        }]
      }
    });
  }

  generarChardsConprovantes() {
    const ctx = 'chartpie';
    this.investmentchart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Facturas', 'Boletas'],
        datasets: [{
          label: '# of Votes',
          data: [this.totalFactura, this.totalBoleta],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1
        }]
      }
    });
  }


  generarChardsVentas(intervalo: string[], datos: number[]) {
    const ctx = 'chartss';
    this.investmentchart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: intervalo,
        datasets: [{
          label: '# de ventas',
          data: datos,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }
        // ,
        // {
        //   label: '# of Votes',
        //   data: [0, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 7, 12, 15, 20, 4, 8, 18, 23, 2, 7, 12, 15, 20, 4, 8, 18, 23, 2, 7, 12, 15, 20, 4],
        //   backgroundColor: [
        //     'rgba(54, 162, 235, 0.2)'
        //   ],
        //   borderColor: [
        //     'rgba(54, 162, 235, 1)'
        //   ],
        //   borderWidth: 1
        // }
      ]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  generarChartsBalanceIngresoEgreso() {
    const ctx = 'chartBalanceIngresoEgreso';
    this.investmentchart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Egreso', 'Ingreso'],
        datasets: [{
          label: '# of Votes',
          data: [this.totalEgreso, this.totalIngreso],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1,
        }]
      }
    });
  }

  generarChardsGanancias() {
    const ctx = 'chartGanancias';
    this.investmentchart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Red', 'Blue'],
        datasets: [{
          label: '# of Votes',
          data: [12, 19],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1
        }]
      }
    });
  }


  generarChardsCompras() {
    const ctx = 'chartsCompras';
    this.investmentchart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['01d', '02d', '03d', '04d', '05d', '06d', '07d', '08d', '09d', '10d', '11d', '12d', '13d', '14d', '15d', '16d', '17d', '18d', '19d', '20d', '21d', '22d', '23d', '24d', '25d', '26d', '27d', '28d', '29d', '30d', '31d'],
        datasets: [{
          label: '# de compras',
          data: [2000, 19, 3, 5, 22, 600],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }
}

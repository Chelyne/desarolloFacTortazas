import { Component, OnInit } from '@angular/core';
import * as Chart from 'chart.js';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  private investmentchart: Chart;

  customYearValues = [2020, 2016, 2008, 2004, 2000, 1996];
  customDayShortNames = ['s\u00f8n', 'man', 'tir', 'ons', 'tor', 'fre', 'l\u00f8r'];
  customPickerOptions: any;

  constructor(private menuCtrl: MenuController) {
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

   async ngOnInit(){
    this.menuCtrl.enable(true);
    this.generarChartsNotasVenta();
    this.generarChardsConprovantes();
    this.generarChardsTotales();

    this.generarChartsBalanceVenta();
    this. generarChardsGanancias();
    this.generarChardsCompras();
  }
// NOTA DE VENTA
  generarChartsNotasVenta(){
    const ctx = 'chartNotasVenta';
    this.investmentchart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Red', 'Blue'],
            datasets: [{
                label: '# of Votes',
                data: [41348.21, 6.90],
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

  generarChardsConprovantes(){
    const ctx = 'chartpie';
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


  generarChardsTotales(){
    const ctx = 'chartss';
    this.investmentchart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['01d', '02d', '03d', '04d', '05d', '06d', '07d', '08d', '09d', '10d', '11d', '12d', '13d', '14d', '15d', '16d', '17d', '18d', '19d', '20d', '21d', '22d', '23d', '24d', '25d', '26d', '27d', '28d', '29d', '30d', '31d'],
            datasets: [{
                label: '# of Votes',
                data: [2, 19, 3, 5, 22, 25, 19, 3, 5, 22, 25, 19, 3, 5, 22, 25, 19, 3, 5, 22, 25, 19, 3, 5, 22, 25, 19, 3, 5, 22, 25],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            },
            {
                label: '# of Votes',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 12, 15, 20, 4, 8, 18, 23, 2, 7, 12, 15, 20, 4, 8, 18, 23, 2, 7, 12, 15, 20, 4],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)'
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

  generarChartsBalanceVenta(){
    const ctx = 'chartBalanceVenta';
    this.investmentchart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Red', 'Blue'],
            datasets: [{
                label: '# of Votes',
                data: [41348.21, 6.90],
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

  generarChardsGanancias(){
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


  generarChardsCompras(){
    const ctx = 'chartsCompras';
    this.investmentchart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['01d', '02d', '03d', '04d', '05d', '06d', '07d', '08d', '09d', '10d', '11d', '12d', '13d', '14d', '15d', '16d', '17d', '18d', '19d', '20d', '21d', '22d', '23d', '24d', '25d', '26d', '27d', '28d', '29d', '30d', '31d'],
            datasets: [{
                label: '# of Votes',
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

import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DataBaseService } from 'src/app/services/data-base.service';
import { StorageService } from 'src/app/services/storage.service';
import { formatearDateTime } from '../../global/funciones-globales';


@Component({
  selector: 'app-reporte-intentos-venta',
  templateUrl: './reporte-intentos-venta.page.html',
  styleUrls: ['./reporte-intentos-venta.page.scss'],
})
export class ReporteIntentosVentaPage implements OnInit {

  fechaActual = formatearDateTime('YYYY-MM-DD');
  sede = this.storage.datosAdmi.sede;
  listaRegistro = [];

  sinDatos;
  buscando;
  constructor(
    private menuCtrl: MenuController,
    private dataApi: DataBaseService,
    private storage: StorageService
  ) {
   }

  ngOnInit() {
    this.menuCtrl.enable(true);
    const event = {
      detail: {
        value:  this.fechaActual
      }
    };
    this.consultarReporte(event);
  }

  consultarReporte(event) {
    this.buscando = true;
    const fecha = event.detail.value.split('-').reverse().join('-');
    this.dataApi.obtenerReporteRegistroListaVentas(fecha, this.sede).subscribe(lista => {
      console.log(lista);
      if (lista.length) {
        this.listaRegistro = lista;
        this.sinDatos = false;
        this.buscando = false;
      } else {
        this.listaRegistro = [];
        this.sinDatos = true;
        this.buscando = false;
      }
    })
  }

}

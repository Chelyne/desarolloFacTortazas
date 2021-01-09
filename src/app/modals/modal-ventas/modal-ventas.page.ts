import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { formatDate, DatePipe } from '@angular/common';
import { VentaInterface } from '../../models/venta/venta';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-ventas',
  templateUrl: './modal-ventas.page.html',
  styleUrls: ['./modal-ventas.page.scss'],
  providers: [
    DatePipe
  ]
})
export class ModalVentasPage implements OnInit {

  listaVentas: VentaInterface[];
  constructor(private modalCtrl: ModalController,
              private dataApi: DbDataService,
              private storage: StorageService,
              private datePipe: DatePipe) { }

  ngOnInit() {
    this.consultaVentas();
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }


  consultaVentas() {
    const fecha  = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    console.log(fecha);
    this.dataApi.ObtenerListaDeVentas(this.storage.datosAdmi.sede, fecha).subscribe(datos => {
      console.log(datos);
      if (datos.length > 0) {
        this.listaVentas = datos;
        this.convertirFecha(this.listaVentas);
      }
    });
  }

  convertirFecha(lista) {
    lista.forEach(element => {
      // element.fecha = moment.unix(element.fecha).format('DD/MM/yyyy');
      element.fechaEmision = new Date(moment.unix(element.fechaEmision.seconds).format('D MMM YYYY H:mm'));
      element.fechaEmision = formatDate(element.fechaEmision, 'dd-MM-yyyy HH:mm:ss', 'en');
    });
  }

}

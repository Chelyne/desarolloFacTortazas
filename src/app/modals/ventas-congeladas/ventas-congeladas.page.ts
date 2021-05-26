import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { DataBaseService } from '../../services/data-base.service';
import { VentaInterface } from '../../../../functions/src/index';

@Component({
  selector: 'app-ventas-congeladas',
  templateUrl: './ventas-congeladas.page.html',
  styleUrls: ['./ventas-congeladas.page.scss'],
})
export class VentasCongeladasPage implements OnInit {

  obsVentasCongeladas: any;
  listaVentas: VentaInterface[] = [];
  constructor(
    private modalCtrl: ModalController,
    public storage: StorageService,
    private dataApi: DataBaseService
  ){
    this.obtenerVentasCongeladas();
  }

  ngOnInit() {
    // console.log(this.storage.listaVenta);
  }

  obtenerVentasCongeladas() {
    this.obsVentasCongeladas = this.dataApi.obtenerVentasCongeladas(this.storage.datosAdmi.sede, this.storage.datosAdmi.id);
    this.obsVentasCongeladas.subscribe(datos => {
      if (datos.length) {
        console.log(datos);
        this.listaVentas = datos;
      }
    });
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  seleccionarVenta(venta) {
    this.modalCtrl.dismiss({
      dataVenta: venta
    }).then(() => {
      this.dataApi.eliminarVentaCongelada(this.storage.datosAdmi.sede, venta.id);
    });
  }

}

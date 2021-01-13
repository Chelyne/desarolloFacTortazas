import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';
import { ProductoInterface } from '../../models/ProductoInterface';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-modal-buscador',
  templateUrl: './modal-buscador.page.html',
  styleUrls: ['./modal-buscador.page.scss'],
})
export class ModalBuscadorPage implements OnInit {
  @ViewChild('search', {static: false}) search: IonSearchbar;

  listaDeProductos: ProductoInterface[] = [];
  buscando = false;
  sinDatos;
  constructor(private modalCtrl: ModalController,
              private dataApi: DbDataService,
              private storage: StorageService) {
   }

  ngOnInit() {
  }

    /* -------------------------------------------------------------------------- */
  /*                                 //Buscador                                 */
  /* -------------------------------------------------------------------------- */
  Search(ev) {
    this.buscando = true;
    this.sinDatos = null;
    const key = ev.detail.value;
    const lowercaseKey = key.toLowerCase();

    if (lowercaseKey.length) {
      this.dataApi.ObtenerListaProductosByName(this.storage.datosAdmi.sede, lowercaseKey).subscribe(data => {
        if (data.length > 0) {
          this.listaDeProductos = data;
          this.sinDatos = false;
        } else {
          this.sinDatos = true;
        }
      });
    }
  }


  limpiarBuscador() {
    this.buscando = false;
  }
  /* -------------------------------------------------------------------------- */

  seleccionarProducto(producto) {
    this.modalCtrl.dismiss({
      data:  producto
    });
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

}

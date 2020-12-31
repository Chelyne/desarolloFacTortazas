import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { ProductoInterface } from '../../models/ProductoInterface';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { ModalBuscadorPage } from '../modal-buscador/modal-buscador.page';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-modal-producto-compra',
  templateUrl: './modal-producto-compra.page.html',
  styleUrls: ['./modal-producto-compra.page.scss'],
})
export class ModalProductoCompraPage implements OnInit {
  @ViewChild('search', {static: false}) search: IonSearchbar;
  cantidad = 1;
  precio = 0;
  productSelect: ProductoInterface = null;

  constructor(private modalCtrl: ModalController,
              private dataApi: DbDataService,
              private storage: StorageService) { }

  ngOnInit() {
  }

  // busca: string
  async presentModalBuscador() {
    const modal = await this.modalCtrl.create({
      component: ModalBuscadorPage,
      cssClass: 'my-custom-class',
      componentProps: {
        // buscar: busca
      }
    });
    await modal.present();

    const data = await modal.onWillDismiss();
    if (isNullOrUndefined(data.data)) {
    } else {
      this.productSelect = data.data.data;
      console.log(this.productSelect);
    }
  }

  agregarProducto() {
    this.modalCtrl.dismiss({
      data: this.productSelect
    });
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }
}

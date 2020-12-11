import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, AlertController } from '@ionic/angular';
import { ModalAgregarDescuentoPage } from '../../modals/modal-agregar-descuento/modal-agregar-descuento.page';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.page.html',
  styleUrls: ['./descuentos.page.scss'],
})
export class DescuentosPage implements OnInit {
  listaDescuentos = [];

  sinDatos;
  constructor(private menuCtrl: MenuController,
              private modalController: ModalController,
              private dataApi: DbDataService,
              private storage: StorageService,
              private alertController: AlertController) { }

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.getDescuentos();
  }

  getDescuentos() {
    this.listaDescuentos = [];
    this.dataApi.ObtenerListaDescuentos(this.storage.datosAdmi.sede).subscribe( descuentos => {
      console.log(descuentos);
      if (descuentos.length > 0) {
        this.listaDescuentos = descuentos;
        this.sinDatos = false;
      } else {
        this.listaDescuentos = [];
        this.sinDatos = true;
      }
    });
  }

  async presentModalAgregarDescuento() {
    const modal = await this.modalController.create({
      component: ModalAgregarDescuentoPage,
      cssClass: 'my-custom-class',
    });
    await modal.present();

    // const data = await modal.onWillDismiss();
    // if (!isNullOrUndefined(data.data)) {
    //   console.log(data.data);
    //   this.dataApi.guardarTip(data.data).then(() => {
    //     this.presentToast('Tip creado correctamente');
    //   });
    // }
  }

  eliminarDescuento(id: string, lista: any[]) {
    console.log(id, lista);
    lista.forEach(element => {
      this.dataApi.actualizarDescuentoProducto(element, this.storage.datosAdmi.sede, 0);
    });
    this.dataApi.EliminarDescuento(id);
  }

  async alertEliminarDescuento(descuento) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirme',
      message: 'Esta seguro de <strong>Eliminar</strong> este descuento del ' + descuento.descuento + '%?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.eliminarDescuento(descuento.id, descuento.listaIds);
          }
        }
      ]
    });

    await alert.present();
  }

}

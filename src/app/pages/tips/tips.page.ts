import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController, ToastController } from '@ionic/angular';
import { ModalAgregarVerTipsPage } from '../../modals/modal-agregar-ver-tips/modal-agregar-ver-tips.page';
import { DbDataService } from '../../services/db-data.service';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.page.html',
  styleUrls: ['./tips.page.scss'],
})
export class TipsPage implements OnInit {
  listaTips = [];
  sinDatos;
  constructor(private modalController: ModalController,
              private menuCtrl: MenuController,
              private dataApi: DbDataService,
              private toastController: ToastController) {
    this.menuCtrl.enable(true);
   }

  ngOnInit() {
    this.obtenerListaTips();
  }


  obtenerListaTips() {
    this.dataApi.ObtenerListaTips().subscribe( datos => {
      if (datos.length > 0) {
        this.listaTips = datos;
        console.log(datos);
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
      }
    });
  }


  async presentModalAgregarVerTips(datos: any) {
    const modal = await this.modalController.create({
      component: ModalAgregarVerTipsPage,
      cssClass: 'my-custom-class',
      componentProps: {
        data: datos
      }
    });
    await modal.present();

    const data = await modal.onWillDismiss();
    if (!isNullOrUndefined(data.data)) {
      console.log(data.data);
      this.dataApi.guardarTip(data.data).then(() => {
        this.presentToast('Tip creado correctamente');
      });
    }
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }
}

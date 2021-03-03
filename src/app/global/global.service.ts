import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(
    private toastCtrl: ToastController
  ) { }

  async presentToast(
    mensaje: string,
    propiedades: {duracion?: number, position?: 'bottom'| 'top'| 'middle', color?: string} = {}
  ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: propiedades.duracion ? propiedades.duracion : 1000,
      position: propiedades.position ? propiedades.position : 'bottom',
      color: propiedades.color ? propiedades.color : 'dark'
    });
    toast.present();
  }




}

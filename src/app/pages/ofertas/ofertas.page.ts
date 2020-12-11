import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, ToastController, PopoverController, AlertController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { DbDataService } from '../../services/db-data.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { ModalSubirOfertaPage } from '../../modals/modal-subir-oferta/modal-subir-oferta.page';
import { isNullOrUndefined } from 'util';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';


@Component({
  selector: 'app-ofertas',
  templateUrl: './ofertas.page.html',
  styleUrls: ['./ofertas.page.scss'],
  providers: [
    DatePipe
  ]
})
export class OfertasPage implements OnInit {
  slides = [];
  sinDatos;
  constructor(private menuCtrl: MenuController,
              private storage: StorageService,
              private dataApi: DbDataService,
              private datePipe: DatePipe,
              private modalController: ModalController,
              private toastController: ToastController,
              private popoverController: PopoverController,
              private alertController: AlertController) { }

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.getSliders();
  }

  getSliders() {
    this.dataApi.ObtenerSliders(this.storage.datosAdmi.sede).subscribe( sliders => {
      console.log(sliders);
      if (sliders.length > 0) {
        this.slides = sliders.reverse();
        console.log(this.slides);
        this.convertirFechas(this.slides);
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
      }
    });
  }

  convertirFechas(slides) {
    slides.forEach(element => {
      element.fecha = element.fechaFinal;
      let vence = element.fechaFinal;
      // vence = new Date(moment.unix(vence).format('D MMM YYYY H:mm'));
      vence = this.datePipe.transform(vence, 'short');
      let fecha;
      fecha = this.datePipe.transform(new Date(), 'short');
      console.log(vence, '>', fecha);
      if (vence > fecha) {
        element.estado = 'Activo';
      } else {
        element.estado = 'Vencido';
      }
      // element.fechaFinal =  new Date(moment.unix(element.fechaFinal.seconds).format('D MMM YYYY H:mm'));
      element.fechaFinal = this.datePipe.transform(element.fechaFinal, 'fullDate');
    });
  }


  async presentModalOferta(dataOferta: string) {
    const modal = await this.modalController.create({
      component: ModalSubirOfertaPage,
      cssClass: 'my-custom-class',
      componentProps: {
        sede: this.storage.datosAdmi.sede,
        editar: dataOferta ? true : false,
        datos: dataOferta ? dataOferta : null
      }
    });
    await modal.present();

    const data = await modal.onWillDismiss();
    if (!isNullOrUndefined(data.data)) {
      console.log(data.data);
      if (data.data.actualizar) {
        this.dataApi.actualizarOferta(data.data.id, data.data).then(() => {
          this.presentToast('Se actualizó la oferta');
        });
      } else {
        this.dataApi.guardarOferta(data.data, data.data.sede).then(() => {
          this.presentToast('Se creó la oferta');
        });
      }
    }
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

  async presentPopover(ev: any, slide: any) {
    const popover = await this.popoverController.create({
      component: PoppoverEditarComponent,
      event: ev,
      translucent: true,
      mode: 'ios'
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      switch (data.action) {
        // case 'Editar': console.log('editar'); break;
        // case 'Eliminar': console.log('eliminar'); break;
        case 'Editar': this.presentModalOferta(slide); break;
        case 'Eliminar': this.presentAlertConfirmEliminar(slide.id); break;
      }
    }
  }

  async presentAlertConfirmEliminar(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Eliminar <strong>' + 'Oferta Publicada' + '</strong>?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            // window.alert('eliminamos');
            this.dataApi.EliminarOferta(id, this.storage.datosAdmi.sede);
          }
        }
      ]
    });

    await alert.present();
  }

}

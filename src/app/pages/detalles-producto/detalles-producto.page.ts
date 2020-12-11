import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoInterface } from '../../models/productoInterface';
import { ToastController, PopoverController, ModalController, AlertController, MenuController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { EditarProductoPage } from '../../modals/editar-producto/editar-producto.page';
import { DbDataService } from '../../services/db-data.service';

@Component({
  selector: 'app-detalles-producto',
  templateUrl: './detalles-producto.page.html',
  styleUrls: ['./detalles-producto.page.scss'],
})
export class DetallesProductoPage implements OnInit {
  id: string;
  sede: string;
  categoria: string;

  dataProducto: ProductoInterface;

  sinDatos;
  constructor(private route: ActivatedRoute,
              private dataApi: DbDataService,
              private toastController: ToastController,
              public storage: StorageService,
              private popoverController: PopoverController,
              private modalController: ModalController,
              private alertController: AlertController,
              private router: Router,
              private menuCtrl: MenuController) {
    this.menuCtrl.enable(true);
   }

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
    this.categoria = this.route.snapshot.params.categoria;
    this.sede = this.route.snapshot.params.sede;
    this.getDataProducto();
  }

  getDataProducto() {
    this.dataProducto = {};
    this.dataApi.ObtenerUnProducto(this.sede, this.id).subscribe( data => {
      if (data) {
        this.dataProducto = data;
        this.sinDatos = false;
        console.log(this.dataProducto);
      } else {
        this.sinDatos = true;
      }
    });
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  async presentPopover(ev: any) {
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
        case 'Editar': this.presentModalEditar(); break;
        case 'Eliminar': this.presentAlertConfirmEliminar(); break;
      }
    }
  }

  async presentModalEditar() {
    const modal = await this.modalController.create({
      component: EditarProductoPage,
      componentProps: {
        dataProducto: this.dataProducto
      }
    });
    await modal.present();

    const { data } =  await modal.onWillDismiss();
    if (data) {
      console.log('datos', data);
      this.dataApi.ActualizarDataProducto(data.data);
    }
  }

  async presentAlertConfirmEliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Eliminar <strong>' + this.dataProducto.nombre.toLocaleUpperCase() + '</strong>?',
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
            this.dataApi.EliminarProducto(this.id, this.sede);
            console.log('data:',  this.categoria, this.sede);
            this.router.navigate(['/categorias-page'], {queryParams: {
              categoria: this.categoria,
              sede: this.sede
            }, skipLocationChange: true});
          }
        }
      ]
    });

    await alert.present();
  }
}

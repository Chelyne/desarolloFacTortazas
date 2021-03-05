import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController, LoadingController, AlertController } from '@ionic/angular';
import { CategoriasService } from '../../services/categorias.service';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-modal-agregar-descuento',
  templateUrl: './modal-agregar-descuento.page.html',
  styleUrls: ['./modal-agregar-descuento.page.scss'],
})
export class ModalAgregarDescuentoPage implements OnInit {
  listaCategorias = [];
  listaProductos = [];
  categoria: string;
  descuento: number;

  sinDatos;
  loading;
  constructor(private modalCtrl: ModalController,
              private categorias: CategoriasService,
              private dataApi: DbDataService,
              private storage: StorageService,
              private toastController: ToastController,
              private loadingController: LoadingController,
              private alertController: AlertController) { }

  ngOnInit() {
    // this.listaCategorias = this.categorias.getcategoriasNegocio('petshop');
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  validarDescuento() {
    this.listaProductos = [];
    if (isNullOrUndefined(this.categoria) || isNullOrUndefined(this.descuento)) {
      this.presentToast('Complete todos los datos');
    } else {
      this.presentLoading('Cargando productos', 5000);
      console.log(this.categoria);
      this.dataApi.ObtenerListaProductosDescuento(this.storage.datosAdmi.sede, 'petshop', this.categoria).subscribe(datos => {
        console.log(datos);
        if (datos.length > 0) {
          this.listaProductos = datos;
          this.sinDatos = false;
          this.loading.dismiss();
        } else {
          this.sinDatos = true;
          this.loading.dismiss();
        }
      });
    }
  }

  agregarDescuento() {
    if (this.descuento > 50 && this.descuento <= 100) {
      this.presentAlertConfirm();
    } else if (this.descuento > 100) {
      this.presentToast('Descuento solo hsta el 100%');
    } else {
      this.ActualizarDescuentos();
    }
  }

  ActualizarDescuentos() {
    this.presentLoading('Cargando productos', 10000);
    const listaId = [];
    this.listaProductos.forEach(element => {
      this.dataApi.actualizarDescuentoProducto(element.id, this.storage.datosAdmi.sede, this.descuento);
      listaId.push(element.id);
    });
    this.dataApi.guardarDescuento(listaId, this.descuento, this.categoria, this.storage.datosAdmi.sede);
    this.cerrarModal();
    this.loading.dismiss();
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

  async presentLoading(mensaje: string, tiempo: number) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: tiempo
    });
    await this.loading.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirme',
      message: 'Esta seguro de agregar  <strong>' + this.descuento + '%</strong> de descuento?',
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
            this.ActualizarDescuentos();
          }
        }
      ]
    });

    await alert.present();
  }
}

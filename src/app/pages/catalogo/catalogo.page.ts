import { Component, OnInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { ProductoInterface } from '../../models/ProductoInterface';
import { ModalController, MenuController, AlertController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { ModalAgregarProductoPage } from '../../modals/modal-agregar-producto/modal-agregar-producto.page';
import { EditarProductoPage } from '../../modals/editar-producto/editar-producto.page';
import { DataBaseService } from '../../services/data-base.service';
import { BuscadorService } from 'src/app/services/buscador.service';
import { GlobalService } from 'src/app/global/global.service';


@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
})
export class CatalogoPage implements OnInit {
  sedes = this.storage.datosAdmi.sede;
  listaDeProductosObservada: ProductoInterface[] = [];
  listaDeProductos: ProductoInterface[] = [];
  buscando = false;

  constructor(
    private dataApi2: DataBaseService,
    private buscadorService: BuscadorService,
    private srvGlobal: GlobalService,
    private modalCtlr: ModalController,
    private storage: StorageService,
    private modalController: ModalController,
    private menuCtrl: MenuController,
    public alertController: AlertController,
  ) {
    this.ObtenerProductos();
    this.menuCtrl.enable(true);
  }

   ngOnInit() {
  }

  // ======================================================================================
  // btener lista de productos
  ObtenerProductos(){
    this.dataApi2.ObtenerListaProductos(this.sedes).subscribe(data => {
      this.listaDeProductosObservada = data;
      this.listaDeProductos = data;

    });
  }

  /* -------------------------------------------------------------------------- */
  /*                                 //Buscador                                 */
  /* -------------------------------------------------------------------------- */
  Search(ev){
    this.buscando = true;
    const target = ev.detail.value;

    if (target.length) {
      this.buscadorService.Buscar(target).then( data => this.listaDeProductos = data);
    } else  {
      this.listaDeProductos = this.listaDeProductosObservada;
    }
  }

  limpiarBuscador() {
    this.buscando = false;
  }

  /* -------------------------------------------------------------------------- */
  /*                           agregar nuevo producto                           */
  /* -------------------------------------------------------------------------- */

  async abrirModalNuevoProducto(){

    const modal =  await this.modalCtlr.create({
      component: ModalAgregarProductoPage,
      cssClass: 'modal-fullscreen'
    });

    await modal.present();
  }

  async borrarProducto(producto: ProductoInterface) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmar',
      message: '¿Está seguro que desea eliminar el producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            this.EliminarProducto(producto.id);
          }
        }
      ]
    });
    await alert.present();
  }
  EliminarProducto(idProducto: string) {
    this.dataApi2.EliminarProducto(idProducto, this.sedes).then(() => {
      this.srvGlobal.presentToast('El producto fue eliminado exitosamente', {position: 'top', color: 'success'} );
    }).catch(() => {
      this.srvGlobal.presentToast('El producto no se pudo eliminar', {position: 'top', color: 'danger'} );

    });
  }

  async presentModalEditar(prod) {
    const modal = await this.modalController.create({
      component: EditarProductoPage,
      cssClass: 'modal-fullscreen'  ,

      componentProps: {
        dataProducto: prod,
      }
    });
    await modal.present();

    const { data } =  await modal.onWillDismiss();
    if (data) {
      this.dataApi2.ActualizarProducto(data.producto).then(() => {
        this.srvGlobal.presentToast('Producto se actualizó correctamente', {color: 'success'});
      }).catch(() => {
        this.srvGlobal.presentToast('Producto no se actualizó', {color: 'danger'});

      });
    }
    }

}

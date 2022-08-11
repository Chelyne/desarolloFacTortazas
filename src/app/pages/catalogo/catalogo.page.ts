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
import { GENERAL_CONFIG } from 'src/config/generalConfig';


@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
})
export class CatalogoPage implements OnInit {
  sedes = this.storage.datosAdmi.sede;
  listaDeProductosObservada: ProductoInterface[] = [];
  listaDeProductos: ProductoInterface[] = [];
  obsProducto: any;
  buscando = false;
  ordenarStock =  false;
  sinDatos: boolean;
  listaSedes = GENERAL_CONFIG.listaSedes;
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
    this.dataApi2.obtenerListaProductos(this.sedes).subscribe(data => {
      if (data.length) {
        this.listaDeProductosObservada = data;
        this.listaDeProductos = data;
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
      }
    });
  }

  verPorStock(event: any) {
    const estado = event.detail.checked;
    console.log(estado);
    if (estado === true) {
      this.obsProducto = this.dataApi2.obtenerListaProductosStock(this.sedes);
      this.obsProducto.subscribe(productos => {
        this.listaDeProductos = productos;
      });
    } else {
      this.ObtenerProductos();
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                 //Buscador                                 */
  /* -------------------------------------------------------------------------- */
  Search(ev){
    this.buscando = true;
    const target = ev.detail.value;

    if (target.length) {
      this.buscadorService.Buscar(target).then( data => {
        if (data.length) {
          this.listaDeProductos = data;
        } else {
          this.srvGlobal.presentToast('No se encontro resultados de la busqueda', {position: 'top', color: 'danger'});
        }
      });
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

  async alertEliminarProducto(producto: ProductoInterface) {

    this.srvGlobal.crearAlertController(
      `¿Está seguro que desea eliminar el producto: <strong> ${producto.nombre} </strong> ?`,
      'Eliminar',
      () => this.eliminarProducto(producto)
    );

  }

  // async borrarProducto(producto: ProductoInterface) {
  //   const alert = await this.alertController.create({
  //     cssClass: 'my-custom-class',
  //     header: 'Confirmar',
  //     message: '¿Está seguro que desea eliminar el producto?',
  //     mode: 'ios',
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //         cssClass: 'secondary',
  //         handler: (blah) => {
  //           console.log('Confirm Cancel: blah');
  //         }
  //       }, {
  //         text: 'Eliminar',
  //         handler: () => {
  //           this.eliminarProducto(producto.id);
  //         }
  //       }
  //     ]
  //   });
  //   await alert.present();
  // }

  async eliminarProducto(producto: ProductoInterface) {
    const newLoading =  await this.srvGlobal.presentLoading('Eliminando producto...', {duracion: 10000});
    let contador = 0;
    for (const sede of this.listaSedes) {
      contador ++;
      console.log(producto , producto.id, sede, contador);
      if (producto.img ){
        await this.srvGlobal.ElimarImagen(producto.img);
      }
      await this.dataApi2.eliminarProducto(producto.id, sede).then(() => {
        this.srvGlobal.presentToast('El producto fue eliminado exitosamente de sede: ' + sede, {position: 'top', color: 'success'} );
      }).catch(() => {
        this.srvGlobal.presentToast('El producto no se pudo eliminar de sede' + sede, {position: 'top', color: 'danger'} );
      });
    }
    newLoading.dismiss();
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
  }

}

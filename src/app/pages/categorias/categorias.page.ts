import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController} from '@ionic/angular';
import { CategoriaInterface } from '../../models/CategoriaInterface';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from '../../global/global.service';
import { ModalAgregarCategoriasPage } from '../../modals/modal-agregar-categorias/modal-agregar-categorias.page';
import { GENERAL_CONFIG } from '../../../config/generalConfig';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriasPage implements OnInit {
  sede = this.storage.datosAdmi.sede;
  logo = GENERAL_CONFIG.datosEmpresa.logo;

  listaDeCategorias: CategoriaInterface[] = [];
  obsCategorias: any;

  sinDatos: boolean;
  textoBuscar = '';
  listaSedes = GENERAL_CONFIG.listaSedes;

  constructor(
    private menuCtrl: MenuController,
    private dataApi: DataBaseService,
    private storage: StorageService,
    private router: Router,
    private modalCtlr: ModalController,
    private globalService: GlobalService,
    ) {
    this.menuCtrl.enable(true);
   }

  ngOnInit() {
    this.ObtenerCategorias();
  }

  ObtenerCategorias(){
    this.obsCategorias = this.dataApi.obtenerListaCategorias(this.sede);
    this.obsCategorias.subscribe((data: any) => {
      if (data.length) {
        this.listaDeCategorias = data;
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
        this.globalService.presentToast('Posible error de conexion', {color: 'danger', duracion: 2000});
      }
    });
  }

  irListaProductos(categoria: string) {
    console.log('ojo', categoria, this.sede);
    this.router.navigate(['/productos-lista', categoria, this.sede]);
  }


  buscarCategoria(event: any) {
    const texto = event.target.value;
    this.textoBuscar = texto;
  }

  async abrirModalNuevaCategoria(){

    const modal =  await this.modalCtlr.create({
      component: ModalAgregarCategoriasPage,
    });

    await modal.present();
  }

  async alertEliminarCategoria(categoria: CategoriaInterface) {

    this.globalService.crearAlertController(
      `¿Está seguro que desea eliminar la categoría: ${categoria.categoria} ?`,
      'Eliminar',
      () =>  this.eliminarCategoria(categoria)
    );
  }

  // async alertEliminarCategoria(categoria: CategoriaInterface) {
  //   const alert = await this.alertController.create({
  //     cssClass: 'my-custom-class',
  //     header: 'Confirmar',
  //     message: '¿Está seguro que desea eliminar la categoria?',
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
  //           this.eliminarCat(categoria.id);
  //         }
  //       }
  //     ]
  //   });
  //   await alert.present();
  // }


  async eliminarCategoria(categoria: CategoriaInterface) {
    const newLoading =  await this.globalService.presentLoading('Eliminando Categoria...', {duracion: 10000});
    for (const sede of this.listaSedes) {
      if (categoria.img) {
        await this.globalService.ElimarImagen(categoria.img);
      }

      await this.dataApi.eliminarCategoria(categoria.id, sede).then(res => {
        console.log(res);
        this.globalService.presentToast('Categoria eliminada de sede: ' + sede, {color: 'success', duracion: 2000});
      }).catch(err => {
        // tslint:disable-next-line:max-line-length
        this.globalService.presentToast('No se pudo eliminar la categoria de sede: ' + sede + ', error: ' + err, {color: 'danger', duracion: 2000});
      });
    }

    newLoading.dismiss();
  }



}

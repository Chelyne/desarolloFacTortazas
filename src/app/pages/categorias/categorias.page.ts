import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, AlertController } from '@ionic/angular';
import { DbDataService } from 'src/app/services/db-data.service';
import { CategoriaInterface } from '../../models/CategoriaInterface';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from '../../global/global.service';
import { ModalAgregarCategoriasPage } from '../../modals/modal-agregar-categorias/modal-agregar-categorias.page';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.page.html',
  styleUrls: ['./categorias.page.scss'],
})
export class CategoriasPage implements OnInit {
  sede = this.storage.datosAdmi.sede;
  listaDeCategorias: CategoriaInterface[] = [];
  sinDatos: boolean;
  textoBuscar = '';
  constructor(
    private menuCtrl: MenuController,
    private dataApi: DataBaseService,
    private storage: StorageService,
    private router: Router,
    private modalCtlr: ModalController,
    private servGlobal: GlobalService,
    private alertController: AlertController
    ) {
    this.menuCtrl.enable(true);
   }

  ngOnInit() {
    this.ObtenerCategorias();
  }

  // Obtener lista de productos
  ObtenerCategorias(){
    this.dataApi.ObtenerListaCategorias(this.sede).subscribe(data => {
      console.log(data);
      if (data.length) {
        this.listaDeCategorias = data;
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
        this.servGlobal.presentToast('Posible error de conexion', {color: 'danger', duracion: 2000});
      }
    });
  }

  irListaProductos(categoria: string) {
    console.log('ojo', categoria, this.sede);
    this.router.navigate(['/productos-lista', categoria, this.sede]);
  }


  buscarCategoria(event) {
    const texto = event.target.value;
    this.textoBuscar = texto;
  }

  async abrirModalNuevoCategoria(){

    const modal =  await this.modalCtlr.create({
      component: ModalAgregarCategoriasPage,
      // cssClass: 'modal-fullscreen',
      componentProps: {
        sede: this.sede,
      }
    });

    await modal.present();
  }

  async alertEliminarCategoria(categoria: CategoriaInterface) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmar',
      message: '¿Está seguro que desea eliminar la categoria?',
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
            this.eliminarCat(categoria.id);
          }
        }
      ]
    });
    await alert.present();
  }


  eliminarCat(id: string) {
    console.log(id);
    this.dataApi.eliminarCategoria(id, this.sede).then(res => {
      console.log(res);
      this.servGlobal.presentToast('Categoria eliminada', {color: 'success', duracion: 2000});
    }).catch(err => {
      this.servGlobal.presentToast('No se pudo eliminar la categoria, error: ' + err, {color: 'danger', duracion: 2000});
    });
  }

}

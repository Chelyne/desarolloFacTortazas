import { Component, OnInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { ProductoInterface } from '../../models/ProductoInterface';
import { CategoriasService } from '../../services/categorias.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, MenuController, AlertController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { ModalAgregarProductoPage } from '../../modals/modal-agregar-producto/modal-agregar-producto.page';
import { AngularFirestore } from '@angular/fire/firestore';
import { EditarProductoPage } from '../../modals/editar-producto/editar-producto.page';
import { ModalAgregarCategoriasPage } from '../../modals/modal-agregar-categorias/modal-agregar-categorias.page';
import { CategoriaInterface } from '../../models/CategoriaInterface';


@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
})
export class CatalogoPage implements OnInit {
  sedes = this.storage.datosAdmi.sede;
  listaDeProductos: ProductoInterface[] = [];
  buscando = false;
  id: any;

  listaDeCategorias: CategoriaInterface[] = [];

  categorias = [];
  categoria;

  ultimaCategoria;
  sinDatos;
  constructor(
    private dataApi: DbDataService,
    private categoriasService: CategoriasService,
    private route: ActivatedRoute,
    private modalCtlr: ModalController,
    private storage: StorageService,
    private router: Router,
    private modalController: ModalController,
    private menuCtrl: MenuController,
    public alertController: AlertController,
    private afs: AngularFirestore) {
    this.ObtenerProductos();
    this.ObtenerCategorias();
    this.menuCtrl.enable(true);
    this.route.queryParams.subscribe(params => {
      this.categoria = 'petshop';
    });
   }

   ngOnInit() {
    this.categorias = this.categoriasService.getcategoriasNegocio(this.categoria);
    this.ultimaCategoria = 4;

    console.log('sede', this.sedes);
    console.log('categoria', this.categoria);
  }

  // ======================================================================================
  // btener lista de productos
  ObtenerProductos(){
    this.dataApi.ObtenerListaProductosSinCat(this.sedes, 20).subscribe(data => {
      this.listaDeProductos = data;
    });
  }

   // btener lista de productos
   ObtenerCategorias(){
    this.dataApi.ObtenerListaCategorias(this.sedes, 20).subscribe(data => {
      this.listaDeCategorias = data;
    });
  }


  /* -------------------------------------------------------------------------- */
  /*                                 //Buscador                                 */
  /* -------------------------------------------------------------------------- */
  Search(ev) {
    this.buscando = true;

    const key = ev.detail.value;
    const lowercaseKey = key.toLowerCase();

    if (lowercaseKey.length) {
      this.dataApi.ObtenerListaProductosByName(this.sedes, lowercaseKey).subscribe(data => {
        this.listaDeProductos = data;
        console.log('love', data);

      });
    } else  {
      this.ObtenerProductos();
    }
  }

  limpiarBuscador() {
    this.buscando = false;
  }

  /* -------------------------------------------------------------------------- */
  /*                           agregar nuevo producto                           */
  /* -------------------------------------------------------------------------- */


  // ==========================================================================================
  agregarProductoPrueba() {
    this.router.navigate(['/agregar-producto', this.sedes, this.categoria]);
  }


  // ==========================================================================================
  agregarProducto() {
    // this.router.navigate(['/agregar-producto', this.sedes, this.categoria]);
    this.abrirModalNuevoProducto();
  }

  async abrirModalNuevoProducto(){

    const modal =  await this.modalCtlr.create({
      component: ModalAgregarProductoPage,
      cssClass: 'modal-fullscreen',
      componentProps: {
        sede: this.sedes,
        categoria: this.categoria,
      }
    });

    await modal.present();
  }

  agregarCategoria(){
    this.abrirModalNuevoCategoria();
  }

  async abrirModalNuevoCategoria(){

    const modal =  await this.modalCtlr.create({
      component: ModalAgregarCategoriasPage,
      cssClass: 'modal-fullscreen',
      componentProps: {
        sede: this.sedes,
      }
    });

    await modal.present();
  }

  async borrarProducto(item: ProductoInterface) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmar borrado',
      message: '¿Estás seguro de que deseas eliminar el producto?',
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
            this.dataApi.EliminarProducto(item.id, this.sedes);
            console.log('data:',  this.categoria, this.sedes);
            // this.router.navigate(['/CatalogoPage'], {queryParams: {
            //   categoria: this.categoria,
            //   sede: this.sedes
            // }, skipLocationChange: true});
          }
        }
      ]
    });
    await alert.present();
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
        console.log('datos', data);
        this.dataApi.ActualizarDataProducto(data.data);
      }
      }


      irLIstaProductos(categoria: string) {
        console.log('ojo', categoria, this.sedes);
        console.log('ESTMOS', this.categoria, this.sedes);
        this.router.navigate(['/productos-lista', categoria, this.sedes]);
      }

}

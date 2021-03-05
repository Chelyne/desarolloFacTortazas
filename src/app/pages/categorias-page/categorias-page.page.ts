import { Component, OnInit } from '@angular/core';
import { CategoriasService } from '../../services/categorias.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, MenuController } from '@ionic/angular';
import { AgregarProductoPage } from '../../modals/agregar-producto/agregar-producto.page';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-categorias-page',
  templateUrl: './categorias-page.page.html',
  styleUrls: ['./categorias-page.page.scss'],
})
export class CategoriasPagePage implements OnInit {
  categorias = [];
  categoria;
  sede;

  sinProductos =  false;
  ultimaCategoria;
  constructor(private categoriasService: CategoriasService,
              private route: ActivatedRoute,
              private modalController: ModalController,
              private router: Router,
              private menuCtrl: MenuController) {
    this.menuCtrl.enable(true);
    this.route.queryParams.subscribe(params => {
      this.categoria = params.categoria;
      this.sede = params.sede;
      console.log(this.sede);
    });
   }

  ngOnInit() {
    console.log(this.categorias);
    // this.categorias = this.categoriasService.getcategoriasNegocio(this.categoria);
    this.ultimaCategoria = 4;
  }

  // loadData(event) {
  //   // const propietario = this.storage.datosNegocio.correo;
  //   setTimeout(() => {
  // tslint:disable-next-line:max-line-length
  //     const siguiente = this.categoriasService.getcategoriasNegocio(this.categoria).slice(this.ultimaCategoria, this.ultimaCategoria + 4);
  //     if (siguiente.length > 0) {
  //       this.ultimaCategoria = this.ultimaCategoria + 4;
  //       siguiente.forEach(element => {
  //         this.categorias.push(element);
  //         event.target.complete();
  //       });
  //     } else {
  //       event.target.disabled = true;
  //     }
  //   }, 500);
  // }

  receiveMessage($event) {
    if (isNullOrUndefined(this.sinProductos)) {
      this.sinProductos = $event;
    }
    if (this.sinProductos === false) {

    } else if (this.sinProductos === true) {
      this.sinProductos = $event;
    }
  }

  agregarProducto() {
    this.router.navigate(['/agregar-producto', this.sede, this.categoria]);
  }

  async agregarProductoModal() {
    const modal = await this.modalController.create({
      component: AgregarProductoPage,
      cssClass:'modal-fullscreen',
      componentProps: {
        sede: this.sede,
        categoria: this.categoria
      }
    });
    return await modal.present();
  }
  // BUSCADOR
  controlSearchbar() {
    // this.showSearchbar = estado;
    console.log(this.sede);
    this.router.navigate(['/buscador'], {queryParams: {
      sede: this.sede,
      categoria: this.categoria
    }, skipLocationChange: true});
  }

  irLIstaProductos(categoria: string) {
    // console.log(categoria);
    console.log('ESTMOS', this.categoria, this.sede);
    this.router.navigate(['/productos-lista', categoria, this.sede]);
  }
}

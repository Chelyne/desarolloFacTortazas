import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { CategoriasService } from '../../services/categorias.service';
import { ModalAgregarProductoPage } from '../../modals/modal-agregar-producto/modal-agregar-producto.page';


@Component({
  selector: 'app-agregar-producto',
  templateUrl: './agregar-producto.page.html',
  styleUrls: ['./agregar-producto.page.scss'],
})
export class AgregarProductoPage implements OnInit {
  categorias = [];
  sede;
  categoria;

  constructor(
    private categoriaService: CategoriasService,
    private storage: StorageService,
    private modalController: ModalController,
    private route: ActivatedRoute) {
    // this.cargarCategorias();
    this.sede = this.route.snapshot.params.sede;
    this.categoria = this.route.snapshot.params.categoria;
   }

  ngOnInit() {
    this.categorias = this.categoriaService.getcategoriasNegocio(this.categoria);
    console.log(this.categorias);
  }

  async agregarProductoModal(subcategoria: string) {
    const modal = await this.modalController.create({
      component: ModalAgregarProductoPage,
      cssClass: 'modal-fullscreen',
      componentProps: {
        sede: this.sede,
        categoria: this.categoria,
        subCategoria: subcategoria
      }
    });
    return await modal.present();
  }
}

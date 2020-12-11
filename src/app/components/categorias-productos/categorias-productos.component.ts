import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DbDataService } from '../../services/db-data.service';

@Component({
  selector: 'app-categorias-productos',
  templateUrl: './categorias-productos.component.html',
  styleUrls: ['./categorias-productos.component.scss'],
})
export class CategoriasProductosComponent implements OnInit {
  @Input() cat: string;
  @Input() categoria: string;
  @Input() sede: string;

  listaProductos = [];
  sinProductos;
  cargandoImagen = true;

  @Output() messageEvent = new EventEmitter();
  constructor(
    private dataApi: DbDataService,
    private modalController: ModalController,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getListaProductos();
  }

  sendMessage() {
    this.messageEvent.emit(this.sinProductos);
  }

  async getListaProductos() {
    this.listaProductos = [];
    await this.dataApi.ObtenerListaProductos(this.sede, this.cat, this.categoria).subscribe(datos => {
      if (datos.length > 0) {
        this.listaProductos = datos;
        this.sinProductos = false;
        this.sendMessage();
        return;
      }
      this.sinProductos = true;
      this.sendMessage();
    });
  }

  async presentModalDetalles(negocio1: string, id1: string) {
    // const modal = await this.modalController.create({
    //   component: VerDetallesPage,
    //   componentProps: {
    //     negocio: negocio1,
    //     id: id1
    //   }
    // });
    // return await modal.present();
    this.router.navigate(['/detalles-producto']);
  }

  irLIstaProductos() {
    // console.log(categoria);
    console.log('ESTMOS', this.categoria, this.sede);
    this.router.navigate(['/productos-lista', this.categoria, this.sede]);
  }

  verDetallesProducto(id: string) {
    this.router.navigate(['/detalles-producto', id, this.cat, this.sede]);
  }

  imgListo(event) {
    console.log(event);
    this.cargandoImagen = false;
  }
}

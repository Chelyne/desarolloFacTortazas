import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { CategoriasService } from '../../services/categorias.service';
import { PaginationProductosService } from '../../services/pagination-productos.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.page.html',
  styleUrls: ['./punto-venta.page.scss'],
})
export class PuntoVentaPage implements OnInit {
  numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.'];
  categorias = [];
  listaProductos = [];
  categoria: string;

  listaVenta = [];
  private suscripcionProducto: Subscription;
  constructor(private menuCtrl: MenuController,
              private categoriasService: CategoriasService,
              private pagination: PaginationProductosService) {
    this.menuCtrl.enable(true);
   }

  ngOnInit() {
    this.categorias = this.categoriasService.getcategoriasNegocio('petshop');
  }

  addListaVenta(data) {
    this.listaVenta.push(data);
  }

  listaProductosCategoria(categoria: string) {
    if (this.categoria !== categoria) {
      console.log('de cero');
      this.listaProductos = [];
    }
    this.categoria = categoria;
    // const propietario = this.storage.datosNegocio.correo;
    const sede1 = 'andahuaylas';
    this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, null).subscribe( data => {
      if (data !== null) {
        this.listaProductos.push(...data);
        // this.sinDatos = false;
      } else {
        // this.sinDatos = true;
      }
    });
  }

  loadData(event) {
    // const propietario = this.storage.datosNegocio.correo;
    setTimeout(() => {
      const sede1 = 'andahuaylas';
      this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, 'normal').subscribe( data => {
        if (data !== null) {
          this.listaProductos.push(...data);
          event.target.complete();
          // this.sinDatos = false;
        } else {
          // this.sinDatos = true;
          event.target.disabled = true;
        }
      });
    }, 500);
  }

}

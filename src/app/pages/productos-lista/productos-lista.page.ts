import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
import { Subscription } from 'rxjs';
import { PaginationProductosService } from '../../services/pagination-productos.service';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-productos-lista',
  templateUrl: './productos-lista.page.html',
  styleUrls: ['./productos-lista.page.scss'],
})
export class ProductosListaPage implements OnInit, OnDestroy {

  listaProductos = [];

  categoria: string;
  sede: string;
  sinDatos;

  private suscripcionProducto: Subscription;
  constructor(private pagination: PaginationProductosService,
              private route: ActivatedRoute,
              private storage: StorageService,
              private router: Router,
              private menuCtrl: MenuController) {
    this.menuCtrl.enable(true);
    this.categoria = this.route.snapshot.params.categoria;
    this.sede = this.route.snapshot.params.sede;
   }

  ngOnInit() {
    // const propietario = this.storage.datosNegocio.correo;
    const sede1 = this.sede.toLocaleLowerCase();
    this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, null).subscribe( data => {
      if (data !== null) {
        this.listaProductos.push(...data);
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
      }
    });
  }

  loadData(event) {
    // const propietario = this.storage.datosNegocio.correo;
    setTimeout(() => {
      const sede1 = this.sede.toLocaleLowerCase();
      this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, 'normal').subscribe( data => {
        if (data !== null) {
          this.listaProductos.push(...data);
          event.target.complete();
          this.sinDatos = false;
        } else {
          this.sinDatos = true;
          event.target.disabled = true;
        }
      });
    }, 500);
  }

  verDetallesProducto(id: string) {
    this.router.navigate(['/detalles-producto', id, this.categoria, this.sede]);
  }

  ngOnDestroy(): void {
    this.suscripcionProducto.unsubscribe();
  }

}

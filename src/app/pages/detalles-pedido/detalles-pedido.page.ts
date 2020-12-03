import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../services/storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DbDataService } from '../../services/db-data.service';

@Component({
  selector: 'app-detalles-pedido',
  templateUrl: './detalles-pedido.page.html',
  styleUrls: ['./detalles-pedido.page.scss'],
})
export class DetallesPedidoPage implements OnInit {
  id: string;
  datosPedido;
  tiendas;

  resumen = [];

  totalPagado = 0;
  constructor(private dataApi: DbDataService,
              private storage: StorageService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.id = this.route.snapshot.params.id;
    this.getTiendasPedido();
  }

  getTiendasPedido() {
    this.dataApi.ObtenerTiendasPedidos(this.id).subscribe( dataPedido => {
      console.log(dataPedido);
      if (dataPedido.length > 0) {
        this.tiendas = dataPedido;
        dataPedido.forEach(element => {
          switch (element.estado) {
            case 'pendiente': element.progress = 0.2; break;
            case 'confirmado': element.progress = 0.4; break;
            case 'enviado': element.progress = 0.6; break;
            case 'listo para entregar': element.progress = 0.8; break;
            case 'entregado': element.progress = 1; break;
          }
          const data = {
            tienda: element.tienda,
            envio: element.totalEnvio,
            producto: element.totalProducto,
          };
          this.totalPagado = this.totalPagado + data.envio + data.producto;
          this.resumen.push(data);
        });
      }
    });
  }

  // getPedido() {
  //   this.dataApi.ObtenerUnPedido(this.id).subscribe( dataPedido => {
  //     console.log(dataPedido);
  //     if (dataPedido) {
  //       this.datosPedido = dataPedido;
  //       this.datosPedido.tiendas.forEach(element => {
  //         switch (element.estado) {
  //           case 'pendiente': element.progress = 0.2; break;
  //           case 'confirmado': element.progress = 0.4; break;
  //           case 'enviado': element.progress = 0.6; break;
  //           case 'listo para entregar': element.progress = 0.8; break;
  //           case 'entregado': element.progress = 1; break;
  //         }
  //       });
  //       this.resumenGeneral();
  //     }
  //   });
  // }

  resumenGeneral() {
    this.datosPedido.tiendas.forEach(element => {
      const data = {
        tienda: element.tienda,
        envio: element.totalEnvio,
        producto: element.totalProducto,
      };
      this.resumen.push(data);
    });
  }

  // async presentModalDetalles(negocio1: string, id1: string, talla: string) {
  //   if (talla) {
  //     const id = id1.slice(0, -(talla.length));
  //     id1 = id;
  //   }
  //   const modal = await this.modalController.create({
  //     component: VerDetallesPage,
  //     componentProps: {
  //       negocio: negocio1,
  //       id: id1
  //     }
  //   });
  //   return await modal.present();
  // }

  // verDetallesProducto(negocio: string, id: string) {
  //   this.router.navigate(['/detalles-producto', negocio, this.tipo, id]);
  // }

}

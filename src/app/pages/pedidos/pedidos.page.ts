import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuController, IonSlides } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { DatePipe, registerLocaleData } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { PedidosPaginationService } from '../../services/pedidos-pagination.service';
import localeEs from '@angular/common/locales/es-PE';
import { DbDataService } from '../../services/db-data.service';
registerLocaleData(localeEs, 'es-PE');

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  providers: [
    DatePipe
  ]
})
export class PedidosPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sliderRef', {static: false})slider: IonSlides;

  sliderConfig2: any = {
    autoHeight: true,
  };

  listaPedidos = [];
  sinPedidos: boolean;
  igualar;
  deNuevo: boolean;

  valorSegment = 'pendiente';
  NroSlide = 1;

  listaEstados = ['cancelado', 'pendiente', 'confirmado', 'completado'];
  private suscripcionProducto: Subscription;
  constructor(private dataApi: DbDataService,
              private storage: StorageService,
              private menuCtrl: MenuController,
              private datePipe: DatePipe,
              private router: Router,
              private paginationPedidos: PedidosPaginationService) {
               }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }

  ionViewDidEnter() {
    this.slider.slideTo(this.NroSlide);
  }

  segmentChanged(event) {
    this.valorSegment = event.detail.value;
    switch (this.valorSegment) {
      case 'cancelado': this.NroSlide = 0; break;
      case 'pendiente': this.NroSlide = 1; break;
      case 'confirmado': this.NroSlide = 2; break;
      case 'completado': this.NroSlide = 3; break;
      default:
        break;
    }
    this.slider.slideTo(this.NroSlide);
  }

  getNumSlide(slider) {
    slider.getActiveIndex().then(numero => {
      this.NroSlide = numero;
      switch (this.NroSlide) {
        case 0:
          this.valorSegment = 'cancelado'; break;
        case 1:
          this.valorSegment = 'pendiente'; break;
        case 2:
          this.valorSegment = 'confirmado'; break;
        case 3:
          this.valorSegment = 'completado'; break;
        default:
          break;
      }
    });
    document.getElementById(this.valorSegment).scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }

  ngAfterViewInit() {
    this.suscripcionProducto = this.paginationPedidos.getProductos(null).subscribe( data => {
      console.log('datos: ', data);
      if (data !== null) {
        this.sinPedidos = false;
        this.listaPedidos.push(...data);
        console.log(this.listaPedidos);
        this.convertirFechas(data);
      } else {
        this.sinPedidos = true;
      }
      this.deNuevo = false;
    });
  }

  loadData(event) {
    setTimeout(() => {
      this.suscripcionProducto = this.paginationPedidos.getProductos('normal').subscribe( data => {
        console.log('EVENTO:', event);
        if (data !== null) {
          this.sinPedidos = false;
          this.listaPedidos.push(...data);
          this.convertirFechas(data);
          event.target.complete();
        } else {
          event.target.disabled = true;
        }
      });
    }, 500);
  }

  ngOnDestroy() {
    this.suscripcionProducto.unsubscribe();
    console.log('se destruye pedidos');
    this.listaPedidos = [];
  }

  convertirFechas(pedidos) {
    console.log('PEDI: ', pedidos);
    pedidos.forEach(element => {
      element.fechaCompra =  new Date(moment.unix(element.fechaCompra.seconds).format('D MMM YYYY H:mm'));
      this.igualar = new Date(element.fechaCompra);
      element.fechaEntrega = this.igualar.setHours(this.igualar.getHours() + 24);
      // tslint:disable-next-line:max-line-length
      element.fechaEntrega = this.datePipe.transform(element.fechaEntrega, 'fullDate');
      // tslint:disable-next-line:max-line-length
      element.fechaCompra = this.datePipe.transform(element.fechaCompra, 'fullDate') + ' ' + this.datePipe.transform(element.fechaCompra, 'h:mm a');
      switch (element.estado) {
        case 'pendiente': element.progress = 0.2; break;
        case 'confirmado': element.progress = 0.4; break;
        case 'enviado': element.progress = 0.6; break;
        case 'listo para entregar': element.progress = 0.8; break;
        case 'entregado': element.progress = 1; break;
      }
    });
    console.log('pedidos', pedidos);
  }

  irDetallesPedido(id: string) {
    this.router.navigate(['/detalles-pedido', id]);
  }

}

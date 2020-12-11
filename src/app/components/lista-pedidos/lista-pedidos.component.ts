import { Component, OnInit, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { AlertController } from '@ionic/angular';
// import { CallNumber } from '@ionic-native/call-number/ngx';

@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.scss'],
  providers: [
    DatePipe
  ]
})
export class ListaPedidosComponent implements OnInit {
  @Input() estadoPedido: string;

  listaPedidos = [];
  igualar;
  sinPedidos: boolean;
  color: string;

  lat = '-13.42223';
  long = '-73.23532';

  url = 'https://www.google.com/maps/dir/-13.6564201,-73.3750602/' + this.lat + ',' + this.long;
  constructor(private dataApi: DbDataService,
              private datePipe: DatePipe,
              private alertController: AlertController,
              private router: Router,
              // private callNumber: CallNumber,
              private storage: StorageService) {
               }

  ngOnInit() {
    console.log(this.estadoPedido);
    this.getPedidos();
    switch (this.estadoPedido) {
      case 'cancelado': this.color = 'medium'; break;
      case 'pendiente': this.color = 'danger'; break;
      case 'confirmado': this.color = 'warning'; break;
      case 'completado': this.color = 'success'; break;
    }
  }

  getPedidos() {
    this.dataApi.ObtenerListapedidos(this.estadoPedido, this.storage.datosAdmi.sede).subscribe( pedidos => {
      if (pedidos.length > 0) {
        this.sinPedidos = false;
        if (this.estadoPedido === 'pendiente') {
          this.listaPedidos = pedidos.reverse();
        } else {
        this.listaPedidos = pedidos;
        }
        console.log(this.listaPedidos);
        this.convertirFechas(this.listaPedidos);
      } else {
        console.log('No hay pedidos');
        this.sinPedidos = true;
      }
    });
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
      if (element.sede === 'Andahuaylas') {
        // tslint:disable-next-line:max-line-length
        element.url = 'https://www.google.com/maps/dir/-13.6564748,-73.3847921/' + element.ubicacionCliente.lat + ',' + element.ubicacionCliente.long;
      } else if (element.sede === 'Abancay') {
        // tslint:disable-next-line:max-line-length
        element.url = 'https://www.google.com/maps/dir/-13.6339892,-72.8838528/' + element.ubicacionCliente.lat + ',' + element.ubicacionCliente.long;
      }
    });
    console.log('pedidos', pedidos);
  }

  irDetallesPedido(id: string) {
    this.router.navigate(['/detalles-pedido', id]);
  }

  actualizarEstado(id: string, estado: string) {
    this.dataApi.actualizarEstadoPedido(id, estado);
  }
  async presentAlertConfirm(cel) {
    const alert = await this.alertController.create({
      // cssClass: 'my-custom-class',
      header: 'Llamar!',
      message: 'Realizar llamada al número <strong>' + cel + '</strong>',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('llamada cancelada');
          }
        }, {
          text: 'Llamar',
          handler: () => {
            // console.log('Confirm Okay');
            this.llamar(cel);
          }
        }
      ]
    });

    await alert.present();
  }
  llamar(cel) {
    console.log('celular:', cel);
    // tslint:disable-next-line:max-line-length
    // this.callNumber.callNumber(cel, true).then(res => {console.log('se pudo realisar la llamada'); }).catch(err => {console.log('no se pudo realisar la llamada'); });
  }

  navegar() {
  }

}

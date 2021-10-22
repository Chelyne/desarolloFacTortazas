import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoletasFacturasService } from '../../services/boletas-facturas.service';
import { DataBaseService } from '../../services/data-base.service';
import { VentaInterface } from '../../models/venta/venta';
import { LoadingController, MenuController, AlertController } from '@ionic/angular';
import { GlobalService } from '../../global/global.service';

@Component({
  selector: 'app-print',
  templateUrl: './print.page.html',
  styleUrls: ['./print.page.scss'],
})
export class PrintPage implements OnInit {
  sede: string;
  fecha: string;
  idVenta: string;

  loading;
  constructor(private route: ActivatedRoute,
              private comprobante: BoletasFacturasService,
              private dataApi: DataBaseService,
              private loadingController: LoadingController,
              private servGlobal: GlobalService,
              private menuCtrrl: MenuController,
              private alertController: AlertController) {
                this.menuCtrrl.enable(false);
               }

  ngOnInit() {
    this.sede = this.route.snapshot.params.sede;
    this.fecha = this.route.snapshot.params.fecha;
    this.idVenta = this.route.snapshot.params.id;
    console.log(this.sede, this.fecha, this.idVenta);
    this.consultaVenta();
  }

  async consultaVenta() {
    await this.presentLoading();
    if (this.sede && this.fecha && this.idVenta) {
      this.dataApi.obtenerUnaVentaPorId(this.sede, this.fecha, this.idVenta).subscribe(async (venta: VentaInterface) => {
        console.log(venta);
        if (venta) {
          await this.comprobante.generarComprobante(venta, this.sede);
          this.loading.dismiss();
          this.presentAlert('Descargado', 'Comprobante descargado');
        } else {
          this.servGlobal.presentToast('No se encontró el comprobante', {color: 'danger'});
          this.loading.dismiss();
          this.presentAlert('Error', 'No se encontró el comprobante');
        }
      });
    } else {
      this.servGlobal.presentToast('No hay datos suficientes para generar el comprobante', {color: 'danger'});
      this.loading.dismiss();
    }
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Generando...',
      duration: 10000
    });
    await this.loading.present();
  }

  async presentAlert(titulo: string, subtitulo: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: titulo,
      subHeader: subtitulo,
      backdropDismiss: false,
      mode: 'ios',
      // message: 'This is an alert message.',
      buttons: [{
        text: 'Salir',
        handler: () => {
          console.log('Confirm Cancel: blah');
          window.open('about:blank', '_self');
          setTimeout (() => {window.top.close(); }, 1000);
        }
      }]
    });

    await alert.present();
  }

}

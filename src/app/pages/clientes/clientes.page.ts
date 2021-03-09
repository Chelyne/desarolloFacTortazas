import { Component, OnInit } from '@angular/core';
import { MenuController, AlertController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';
import { isNullOrUndefined } from 'util';
import { StorageService } from '../../services/storage.service';
// import { CallNumber } from '@ionic-native/call-number/ngx';
import { DataBaseService } from '../../services/data-base.service';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {

  clientes = [];
  sinDatos;
  constructor(private  menuCtrl: MenuController,
              private dataApi: DataBaseService,
              // private callNumber: CallNumber,
              private alertController: AlertController,
              private storage: StorageService) {
    this.menuCtrl.enable(true);
   }

  ngOnInit() {
    this.listaClientes();
  }

  listaClientes() {
    this.dataApi.obtenerListaDeClientes().subscribe(data => {
      console.log(data);
      if (data.length > 0) {
        this.clientes = data;
        this.sinDatos = false;
        console.log(this.sinDatos);
      } else {
        this.sinDatos = true;
        console.log(this.sinDatos);
      }
    });
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

}

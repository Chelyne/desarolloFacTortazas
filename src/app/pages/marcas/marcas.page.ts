import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { GlobalService } from 'src/app/global/global.service';
import { DataBaseService } from 'src/app/services/data-base.service';
import { MarcaInterface } from "src/app/models/MarcaInterface";



@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.page.html',
  styleUrls: ['./marcas.page.scss'],
})
export class MarcasPage implements OnInit {

  listaDeMarcas: MarcaInterface[];
  sinDatos: boolean;

  constructor(
    private menuCtrl: MenuController,
    public alertController: AlertController,
    private srvGlobal: GlobalService,
    private dataApi: DataBaseService

  ) {
    this.ObtenerMarcas();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }

  ObtenerMarcas(){
    this.dataApi.obtenerMarcas().subscribe(data => {
      console.log(data);
      if (data.length) {
        this.listaDeMarcas = data;
        this.sinDatos = false;
      } else {
        this.listaDeMarcas = [];
        this.sinDatos = true;
      }
    });
  }

  async  EliminarMarca(marcaSelect: MarcaInterface) {
    const alert = await this.alertController.create({
      header: 'Eliminar Marca',
      message: `Desea eliminar la marca: ${marcaSelect.nombreMarca}`,
      mode: 'ios',
      buttons: [
        {
          text: 'No, Conservar Marca',
          role: 'Cancel',
        },
        {
          text: 'Si, Deseo eliminar.',
          handler: () => {
            this.dataApi.eliminarMarca(marcaSelect.id)
            .then(() => {
              this.srvGlobal.presentToast('La Marca ha sido eliminado', {color: 'success', position: 'top'});
            })
            .catch(() => {
              this.srvGlobal.presentToast('No se ha eliminado la Marca', {color: 'warning', position: 'top'});
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async agregarMarca() {
    const alert =  this.alertController.create({
      mode: 'ios',
      header: 'Ingrese Marca',
      inputs: [
        {
          name: 'marca',
          type: 'text',
          placeholder: 'Ejem: Gloria',
        },
     ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {}
        },
        {
          text: 'Guardar',
          handler: data => {
            this.dataApi.guardarMarca(data.marca).then(res => {
              if (res) {
                this.srvGlobal.presentToast('Guardado correctamene', {color: 'success', position: 'top'});
              } else {
                this.srvGlobal.presentToast('No se pudo guardar', {color: 'danger', position: 'top'});
              }
            })
            console.log(data.marca);
          }
        }
      ],
    });

     (await alert).present();

  }

  async actualizarMarca(marcaSelect: MarcaInterface) {
    const alert =  this.alertController.create({
      mode: 'ios',
      header: 'Ingrese Marca',
      inputs: [
        {
          name: 'marca',
          type: 'text',
          value: `${marcaSelect.nombreMarca}`,
        },
     ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: data => {}
        },
        {
          text: 'Guardar',
          handler: data => {
            this.dataApi.actualizarMarca(marcaSelect.id, data.marca.toLowerCase()).then(res => {
              console.log(data);
              if (res) {
                this.srvGlobal.presentToast('Actualizado correctamene', {color: 'success', position: 'top'});
              } else {
                this.srvGlobal.presentToast('No se pudo actualizar', {color: 'danger', position: 'top'});
              }
            })
            console.log(data.marca);
          }
        }
      ],
    });

     (await alert).present();

  }

}

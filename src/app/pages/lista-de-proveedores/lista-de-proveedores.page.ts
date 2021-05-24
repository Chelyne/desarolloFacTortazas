import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, MenuController } from '@ionic/angular';
import { GlobalService } from 'src/app/global/global.service';
import { AgregarEditarProveedorPage } from 'src/app/modals/agregar-editar-proveedor/agregar-editar-proveedor.page';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { DataBaseService } from 'src/app/services/data-base.service';


@Component({
  selector: 'app-lista-de-proveedores',
  templateUrl: './lista-de-proveedores.page.html',
  styleUrls: ['./lista-de-proveedores.page.scss'],
})
export class ListaDeProveedoresPage implements OnInit {

  listaDeProveedores: ProveedorInterface[];
  obsProveedores: any;

  modalEvento: string;
  modalDataProveedor: ProveedorInterface;

  constructor(
    private dataApi: DataBaseService,
    private modalCtlr: ModalController,
    public alertController: AlertController,
    private menuCtrl: MenuController,
    private globalService: GlobalService
  ) {
    this.ObtenerProveedores();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }

  ObtenerProveedores(){
    this.obsProveedores =  this.dataApi.obtenerProveedores();
    this.obsProveedores.subscribe(data => {
      this.listaDeProveedores = data;
    });
  }

  AgregarNuevoProveedor(){
    this.modalEvento = 'agregar';
    this.abrirModal();
  }

  ActualizarDataProveedor(proveedor: ProveedorInterface){
    this.modalEvento = 'actualizar';
    this.modalDataProveedor = proveedor;
    this.abrirModal();
  }


  async abrirModal(){
    const modal =  await this.modalCtlr.create({
      component: AgregarEditarProveedorPage,
      componentProps: {
        dataModal: {
          evento: this.modalEvento,
          proveedor: this.modalDataProveedor
        }
      }
    });

    await modal.present();
  }



  async  EliminarProveedor(proveedorSelect: ProveedorInterface) {
    const alert = await this.alertController.create({
      header: 'Eliminar Proveedor',
      message: `Desea eliminar al proveedor ${proveedorSelect.nombre}`,
      buttons: [
        {
          text: 'No, conservar proveedor',
          role: 'cancel',
        },
        {
          text: 'si, deseo eliminar.',
          handler: () => {
            this.dataApi.eliminarProveedor(proveedorSelect.id)
            .then(() => {
              this.globalService.presentToast('El proveedor ha sido eliminado', {color: 'success', position: 'top'});
            })
            .catch(() => {
              this.globalService.presentToast('No se ha eliminado el proveedor', {color: 'warning', position: 'top'});
            });
          }
        }
      ]
    });

    await alert.present();
  }


}

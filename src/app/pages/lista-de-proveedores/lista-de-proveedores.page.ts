import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController, MenuController } from '@ionic/angular';
import { AgregarEditarProveedorPage } from 'src/app/modals/agregar-editar-proveedor/agregar-editar-proveedor.page';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { DbDataService } from 'src/app/services/db-data.service';
// import { ProveedorRegistroService } from 'src/app/services/proveedor-registro.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-lista-de-proveedores',
  templateUrl: './lista-de-proveedores.page.html',
  styleUrls: ['./lista-de-proveedores.page.scss'],
})
export class ListaDeProveedoresPage implements OnInit {



  listaDeProveedores: ProveedorInterface[];
  proveedorItem: ProveedorInterface;

  modalEvento: string;
  modalTitle: string;
  modalTag: string;
  modalDataProveedor: ProveedorInterface;

  @Input() esModal = false;

  // objeto = {nombre: 'huanalals', nulo: null};

  constructor(
    private dataApi: DbDataService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController,
    public alertController: AlertController,
    private menuCtrl: MenuController,
    private storage: StorageService
  ) {
    // this.proveedoresForm = this.createFormGroupProveedor();
    this.ObtenerProveedores();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }


  ObtenerProveedores(){
    // console.log("getProveedores");

    this.dataApi.ObtenerListaDeProveedores().subscribe(data => {
      // console.log(data);
      this.listaDeProveedores = data;
      // console.log(this.proveedoressList.length);
    });

  }

  AgregarNuevoProveedor(){
    this.modalEvento = 'guardarProveedor';
    this.modalTitle = 'Registrar nuevo proveedor';
    this.modalTag = 'Guardar';
    this.abrirModal();
  }

  ActualizarDataProveedor(proveedor: ProveedorInterface){

    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log(proveedor);
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

    this.modalEvento = 'actualizarProveedor';
    this.modalTitle = 'Actualizar datos del proveedor';
    this.modalTag = 'Actualizar';
    this.modalDataProveedor = proveedor;

    setTimeout(() => {
      this.abrirModal();
    }, 10);

  }


  async abrirModal(){

    const modal =  await this.modalCtlr.create({
      component: AgregarEditarProveedorPage,
      componentProps: {
        eventoInvoker: this.modalEvento,
        titleInvoker: this.modalTitle,
        tagInvoker: this.modalTag,
        dataInvoker: this.modalDataProveedor
      }
    });

    await modal.present();
  }

  SeleccionarProveedor(proveedorSelect: ProveedorInterface){

    this.modalCtlr.dismiss({
      proveedor: proveedorSelect
    });
  }

  // EliminarProveedor(proveedorSelect: ProveedorInterface){
  //   // TODO - Agregar un mensaje de confirmación
  //   this.dataApi.EliminarProveedor(proveedorSelect.id);
  //   this.presentToast('Eliminó exitosamente');
  // }

  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
  }

  async  EliminarProveedor(proveedorSelect: ProveedorInterface) {
    const alert = await this.alertController.create({
      header: 'Eliminar Proveedor',
      message: `Desea eliminar al proveedor ${proveedorSelect.nombre}`,
      // buttons: ['Disagree', 'Agree']
      buttons: [
        {
          text: 'No, conservar proveedor',
          role: 'cancel',
          handler: () => {
            console.log('No clicked');
          }
        },
        {
          text: 'si, deseo eliminar.',
          handler: () => {
            console.log('Yes clicked');
            this.dataApi.EliminarProveedor(proveedorSelect.id);
            this.presentToast('Eliminó exitosamente');
          }
        }
      ]
    });

    await alert.present();
  }


}

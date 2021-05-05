import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController, AlertController } from '@ionic/angular';
import { AgregarEditarUsuarioPage } from 'src/app/modals/agregar-editar-usuario/agregar-editar-usuario.page';
import { AdmiInterface } from '../../models/AdmiInterface';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from '../../global/global.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {


  listaDeUsuarios: AdmiInterface[];
  usuarioItem: AdmiInterface;

  dataModal = {
    evento: '',
    usuario: {}
  };

  modalEvento: string;
  modalTitle: string;
  modalTag: string;
  modalDataUsuario: AdmiInterface;

  sinDatos;
  constructor(private dataApi: DataBaseService,
              private modalCtlr: ModalController,
              private menuCtrl: MenuController,
              private servGlobal: GlobalService,
              private alertController: AlertController
              ) {
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.ObtenerUsuarios();
  }

  ObtenerUsuarios(){
    this.dataApi.obtenerUsuarios().subscribe(data => {
      if (data.length > 0) {
        this.sinDatos = false;
        this.listaDeUsuarios = data;
      } else {
        this.sinDatos = true;
      }
    });

  }

  AgregarNuevoUsuario(){
    this.dataModal.evento = 'agregar';
    this.abrirModal();
  }

  ActualizarDataUsuario(usuario: AdmiInterface){
    this.dataModal.evento = 'actualizar';
    this.dataModal.usuario = usuario;
    setTimeout(() => {
      this.abrirModal();
    }, 10);

  }

  async abrirModal(){
    const modal =  await this.modalCtlr.create({
      component: AgregarEditarUsuarioPage,
      componentProps: {
        dataModal: this.dataModal
      }
    });
    await modal.present();
  }

  eliminarUsuario(id) {
    this.dataApi.eliminarUsuario(id).then(() => {
      this.servGlobal.presentToast('Usuario eliminado');
    });
  }

  async alertEliminarUsuario(usuario: AdmiInterface) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirme',
      message: 'Eliminar a <strong> ' + usuario.nombre.toUpperCase() + '</strong>?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            console.log('Confirm Okay');
            this.eliminarUsuario(usuario.id);
          }
        }
      ]
    });

    await alert.present();
  }
}

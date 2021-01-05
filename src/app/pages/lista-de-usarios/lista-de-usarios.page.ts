import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController, ToastController } from '@ionic/angular';
import { AgregarEditarUsuarioPage } from 'src/app/modals/agregar-editar-usuario/agregar-editar-usuario.page';
// import { AgregarEditarUsuarioPage } from 'src/app/modals/agregar-editar-usuario/agregar-editar-usuario.page';
import { DbDataService } from 'src/app/services/db-data.service';
// import { UserRegistroService } from 'src/app/services/user-registro.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { AdmiInterface } from '../../models/AdmiInterface';

@Component({
  selector: 'app-lista-de-usarios',
  templateUrl: './lista-de-usarios.page.html',
  styleUrls: ['./lista-de-usarios.page.scss'],
})
export class ListaDeUsariosPage implements OnInit {


  listaDeUsuarios: AdmiInterface[];
  usuarioItem: AdmiInterface;

  modalEvento: string;
  modalTitle: string;
  modalTag: string;
  modalDataUsuario: AdmiInterface;

  sinDatos;
  constructor(private dataApi: DbDataService,
              private modalCtlr: ModalController,
              private menuCtrl: MenuController,
              private toastController: ToastController,
              private authSrv: AuthServiceService) {
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
    this.ObtenerUsuarios();
  }

  ObtenerUsuarios(){
    this.dataApi.ObtenerListaDeUsuarios().subscribe(data => {
      if (data.length > 0) {
        this.sinDatos = false;
        this.listaDeUsuarios = data;
      } else {
        this.sinDatos = true;
      }
    });

  }

  AgregarNuevoUsuario(){
    this.modalEvento = 'guardarUsuario';
    this.modalTitle = 'Agregar nuevo usuario';
    this.modalTag = 'Guardar';
    this.abrirModal();
  }


  ActualizarDataUsuario(usuario: AdmiInterface){
    this.modalEvento = 'actualizarUsuario';
    this.modalTitle = 'Actualizar datos del usuario';
    this.modalTag = 'Actualizar';
    this.modalDataUsuario = usuario;

    setTimeout(() => {
      this.abrirModal();
    }, 10);

  }

  async abrirModal(){
    const modal =  await this.modalCtlr.create({
      component: AgregarEditarUsuarioPage,
      componentProps: {
        eventoInvoker: this.modalEvento,
        titleInvoker: this.modalTitle,
        tagInvoker: this.modalTag,
        dataInvoker: this.modalDataUsuario
      }
    });

    await modal.present();
  }



  eliminarUsuario(id) {
    this.dataApi.EliminarUsuario(id).then(() => {
      this.presentToast('Usuario eliminado');
    });
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1000
    });
    toast.present();
  }

}

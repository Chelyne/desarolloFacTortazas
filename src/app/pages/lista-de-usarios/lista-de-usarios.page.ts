import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { AgregarEditarUsuarioPage } from 'src/app/modals/agregar-editar-usuario/agregar-editar-usuario.page';
// import { AgregarEditarUsuarioPage } from 'src/app/modals/agregar-editar-usuario/agregar-editar-usuario.page';
import { UsuarioInterface } from 'src/app/models/usuario';
import { DbDataService } from 'src/app/services/db-data.service';
// import { UserRegistroService } from 'src/app/services/user-registro.service';

@Component({
  selector: 'app-lista-de-usarios',
  templateUrl: './lista-de-usarios.page.html',
  styleUrls: ['./lista-de-usarios.page.scss'],
})
export class ListaDeUsariosPage implements OnInit {


  listaDeUsuarios: UsuarioInterface[];
  usuarioItem: UsuarioInterface;

  modalEvento: string;
  modalTitle: string;
  modalTag: string;
  modalDataUsuario: UsuarioInterface;

  sinDatos;
  constructor(private dataApi: DbDataService, private modalCtlr: ModalController,
              private menuCtrl: MenuController) {
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


  ActualizarDataUsuario(usuario: UsuarioInterface){
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





}

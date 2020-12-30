import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { AgregarEditarClientePage } from 'src/app/modals/agregar-editar-cliente/agregar-editar-cliente.page';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { DbDataService } from 'src/app/services/db-data.service';
// import { RegistrarClienteService } from 'src/app/services/registrar-cliente.service';

@Component({
  selector: 'app-lista-de-clientes',
  templateUrl: './lista-de-clientes.page.html',
  styleUrls: ['./lista-de-clientes.page.scss'],
})
export class ListaDeClientesPage implements OnInit {

  listaDeclientes: ClienteInterface[];
  clienteItem: ClienteInterface;


  modalEvento: string;
  modalTitle: string;
  modalTag: string;
  modalDataCliente: ClienteInterface;

  constructor(private dataApi: DbDataService,
              private modalCtlr: ModalController,
              private menuCtrl: MenuController) {
    // this.usuarioForm = this.createFormGroupUsuario();
    this.ObtenerClientes();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }


  ObtenerClientes(){
    // console.log("getUsuarios");

    this.dataApi.ObtenerListaDeClientes().subscribe(data => {
      // console.log(data);
      this.listaDeclientes = data;
      // console.log(this.usuariosList.length);
    });

  }

  AgregarNuevoCliente(){
    this.modalEvento = 'guardarCliente';
    this.modalTitle = 'Agregar Nuevo Cliente';
    this.modalTag = 'Guardar';
    this.abrirModal();
  }

  ActualizarDataCliente(cliente: ClienteInterface){

    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    // console.log(cliente);
    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

    this.modalEvento = 'actualizarCliente';
    this.modalTitle = 'Actualizar datos del Cliente';
    this.modalTag = 'Actualizar';
    this.modalDataCliente = cliente;

    setTimeout(() => {
      this.abrirModal();
    }, 10);
  }


  async abrirModal(){

    const modal =  await this.modalCtlr.create({
      component: AgregarEditarClientePage,
      componentProps: {
        eventoInvoker: this.modalEvento,
        titleInvoker: this.modalTitle,
        tagInvoker: this.modalTag,
        dataInvoker: this.modalDataCliente

      }
    });

    await modal.present();
  }


}

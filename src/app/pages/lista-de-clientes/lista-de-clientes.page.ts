import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ClienteInterface } from 'src/app/interfaces/cliente-interface';
import { AgregarEditarClientePage } from 'src/app/modals/agregar-editar-cliente/agregar-editar-cliente.page';
import { RegistrarClienteService } from 'src/app/services/registrar-cliente.service';

@Component({
  selector: 'app-lista-de-clientes',
  templateUrl: './lista-de-clientes.page.html',
  styleUrls: ['./lista-de-clientes.page.scss'],
})
export class ListaDeClientesPage implements OnInit {

  listaDeclientes: ClienteInterface[];
  clienteItem: ClienteInterface;


  modalEvento: string;
  modalTitle: String;
  modalTag: string;
  modalDataCliente: ClienteInterface;

  constructor(private dataApi: RegistrarClienteService, private modalCtlr: ModalController) {
    //this.usuarioForm = this.createFormGroupUsuario();
    this.ObtenerClientes();
  }

  ngOnInit() {
  }


  ObtenerClientes(){
    //console.log("getUsuarios");

    this.dataApi.ObtenerListaDeClientes().subscribe(data => {
      // console.log(data);
      this.listaDeclientes = data;
      //console.log(this.usuariosList.length);
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
    }, 500);
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

    await modal.present()
  }


}

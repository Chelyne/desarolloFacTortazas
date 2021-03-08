import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { AgregarEditarClientePage } from 'src/app/modals/agregar-editar-cliente/agregar-editar-cliente.page';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { DataBaseService } from '../../services/data-base.service';
import { isNullOrUndefined } from 'util';
import { GlobalService } from '../../global/global.service';

@Component({
  selector: 'app-lista-de-clientes',
  templateUrl: './lista-de-clientes.page.html',
  styleUrls: ['./lista-de-clientes.page.scss'],
})
export class ListaDeClientesPage implements OnInit {

  listaDeclientes: ClienteInterface[];
  clienteItem: ClienteInterface;
  sinDatos: boolean;

  dataModal = {
    evento: '',
    cliente: {}
  };

  textoBuscar = '';

  constructor(private dataApi: DataBaseService,
              private modalCtlr: ModalController,
              private menuCtrl: MenuController,
              private servGlobal: GlobalService) {
    // this.usuarioForm = this.createFormGroupUsuario();
    this.ObtenerClientes();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }

  buscarCliente(event) {
    const texto = event.target.value;
    this.textoBuscar = texto;
  }

  ObtenerClientes(){
    this.dataApi.obtenerListaDeClientes().subscribe(data => {
      if (data.length) {
        this.sinDatos = false;
        this.listaDeclientes = data;
      } else {
        this.sinDatos = true;
      }
    });

  }

  AgregarNuevoCliente(){
    this.dataModal.evento = 'agregar';
    this.abrirModal();
  }

  ActualizarDataCliente(cliente: ClienteInterface){
    this.dataModal.evento = 'actualizar';
    this.dataModal.cliente = cliente;
    setTimeout(() => {
      this.abrirModal();
    }, 10);
  }


  async abrirModal(){
    const modal =  await this.modalCtlr.create({
      component: AgregarEditarClientePage,
      componentProps: {
        dataModal: this.dataModal
      }
    });
    await modal.present();

    const {data} = await modal.onWillDismiss();
    console.log(data);
    if (data && data.data) {
      if (data.evento === 'agregar') {
        console.log('agregar', data.data);
        this.agregar(data.data);
      }
      if (data.evento === 'actualizar') {
        console.log('actualizar', data.data);
        this.actualizar(data.id, data.data);
      }
    }
  }


  agregar(cliente: ClienteInterface){
    this.dataApi.guardarCliente(cliente).then(() => {
      this.servGlobal.presentToast('Cliente guardado correctamente', {color: 'success'});
    }).catch(err => {
      this.servGlobal.presentToast('No se pudo guardar el cliente', {color: 'danger'});
    });
  }

  actualizar(id: string, cliente: ClienteInterface){
    this.dataApi.actualizarCliente(id, cliente).then(() => {
      this.servGlobal.presentToast('Cliente actualizado correctamente', {color: 'success'});
    }).catch(err => {
      this.servGlobal.presentToast('No se pudo actualizar los datos', {color: 'danger'});
    });
  }


}

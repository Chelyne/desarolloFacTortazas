import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AgregarEditarProveedorPage } from 'src/app/modals/agregar-editar-proveedor/agregar-editar-proveedor.page';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { ProveedorRegistroService } from 'src/app/services/proveedor-registro.service';

@Component({
  selector: 'app-lista-de-proveedores',
  templateUrl: './lista-de-proveedores.page.html',
  styleUrls: ['./lista-de-proveedores.page.scss'],
})
export class ListaDeProveedoresPage implements OnInit {



  listaDeProveedores: ProveedorInterface[];
  proveedorItem: ProveedorInterface;

  modalEvento: string;
  modalTitle: String;
  modalTag: string;
  modalDataProveedor: ProveedorInterface;


  constructor(private dataApi: ProveedorRegistroService, private modalCtlr: ModalController) {
    //this.proveedoresForm = this.createFormGroupProveedor();
    this.ObtenerProveedores();
  }

  ngOnInit() {
  }


  ObtenerProveedores(){
    // console.log("getProveedores");

    this.dataApi.ObtenerListaDeProveedores().subscribe(data => {
      // console.log(data);
      this.listaDeProveedores = data;
      //console.log(this.proveedoressList.length);
    });

  }

  AgregarNuevoProveedor(){
    this.modalEvento = 'guardarProveedor';
    this.modalTitle = 'Registrar nuevo proveedor';
    this.modalTag = 'Guardar';
    this.abrirModal();
  }

  ActualizarDataProveedor(proveedor: ProveedorInterface){

    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    // console.log(proveedor);
    // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

    this.modalEvento = 'actualizarProveedor';
    this.modalTitle = 'Actualizar datos del proveedor';
    this.modalTag = 'Actualizar';
    this.modalDataProveedor = proveedor;

    setTimeout(() => {
      this.abrirModal();
    }, 500);

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

    await modal.present()
  }




}

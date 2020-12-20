import { Component, OnInit } from '@angular/core';
import { CompraInterface } from 'src/app/models/Compra';
import { DbDataService } from 'src/app/services/db-data.service';

@Component({
  selector: 'app-lista-de-compras',
  templateUrl: './lista-de-compras.page.html',
  styleUrls: ['./lista-de-compras.page.scss'],
})
export class ListaDeComprasPage implements OnInit {



  listaDeCompras: CompraInterface[];
  compraItem: CompraInterface;

  //

  // modalEvento: string;
  // modalTitle: String;
  // modalTag: string;
  // modalDataProveedor: ProveedorInterface;

  // @Input() esModal: boolean = false;


  constructor(private dataApi: DbDataService) {
    //this.proveedoresForm = this.createFormGroupProveedor();
    this.ObtenerCompras();
  }

  ngOnInit() {
  }


  ObtenerCompras(){
    // console.log("getProveedores");

    this.dataApi.ObtenerListaCompras().subscribe(data => {
      // console.log(data);
      this.listaDeCompras = data;
      //console.log(this.proveedoressList.length);
    });

  }

  // AgregarNuevoProveedor(){
  //   this.modalEvento = 'guardarProveedor';
  //   this.modalTitle = 'Registrar nuevo proveedor';
  //   this.modalTag = 'Guardar';
  //   this.abrirModal();
  // }

  // ActualizarDataProveedor(proveedor: ProveedorInterface){

  //   // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  //   // console.log(proveedor);
  //   // console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

  //   this.modalEvento = 'actualizarProveedor';
  //   this.modalTitle = 'Actualizar datos del proveedor';
  //   this.modalTag = 'Actualizar';
  //   this.modalDataProveedor = proveedor;

  //   setTimeout(() => {
  //     this.abrirModal();
  //   }, 500);

  // }


  // async abrirModal(){

  //   const modal =  await this.modalCtlr.create({
  //     component: AgregarEditarProveedorPage,
  //     componentProps: {
  //       eventoInvoker: this.modalEvento,
  //       titleInvoker: this.modalTitle,
  //       tagInvoker: this.modalTag,
  //       dataInvoker: this.modalDataProveedor
  //     }
  //   });

  //   await modal.present()
  // }

  // SeleccionarProveedor(proveedorSelect: ProveedorInterface){

  //   this.modalCtlr.dismiss({
  //     proveedor: proveedorSelect
  //   });
  // }


}

import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { DetallesDeCompraPage } from 'src/app/modals/detalles-de-compra/detalles-de-compra.page';
import { CompraInterface } from 'src/app/models/Compra';
import { DbDataService } from 'src/app/services/db-data.service';
import { EditarCompraService } from 'src/app/services/editar-compra.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-lista-de-compras',
  templateUrl: './lista-de-compras.page.html',
  styleUrls: ['./lista-de-compras.page.scss'],
})
export class ListaDeComprasPage implements OnInit {



  listaDeCompras: CompraInterface[];
  compraItem: CompraInterface;

  //
  // sede: string;
  sede = this.storage.datosAdmi.sede;


  // modalEvento: string;
  // modalTitle: String;
  // modalTag: string;
  // modalDataProveedor: ProveedorInterface;

  // @Input() esModal: boolean = false;


  constructor(
    private dataApi: DbDataService,
    private modalCtlr: ModalController,
    private editCompra: EditarCompraService,
    private menuCtrl: MenuController,
    private storage: StorageService
  ) {
    // this.proveedoresForm = this.createFormGroupProveedor();
    this.ObtenerCompras();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }


  ObtenerCompras(){
    // console.log("getProveedores");
    // CLEAN
    this.dataApi.ObtenerListaCompras(this.storage.datosAdmi.sede).subscribe(data => {
      console.log(data);
      this.listaDeCompras = data;
      console.log(this.listaDeCompras);
      console.log('..............................................');
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

  mostrarDetalleDeCompra(compraSelect: CompraInterface){
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    setTimeout(() => {
      // this.abrirModal();
      this.abrirModalMostrarDetalles(compraSelect);
    }, 500);
  }

  async abrirModalMostrarDetalles(compraSelect: CompraInterface){

    const modal =  await this.modalCtlr.create({
      component: DetallesDeCompraPage,
      componentProps: {
        compra: compraSelect
      }
    });

    await modal.present();

  }

  async bloquearCompra(compraSelect: CompraInterface){

    // console.log(compraSelect.anulado);
    // if (typeof(compraSelect.anulado) === 'undefined'){
    if (!compraSelect.anulado){
      this.dataApi.toggleAnularCompra(compraSelect.id, false, this.sede);
      // actualizar Stock de productos
      for (const itemCompra of compraSelect.listaItemsDeCompra) {
        console.log(itemCompra);
        this.dataApi.decrementarStockProducto(itemCompra.producto.id, this.sede, itemCompra.cantidad);
      }
    } else {
      this.dataApi.toggleAnularCompra(compraSelect.id, true, this.sede);
      // actualizar Stock de productos
      for (const itemCompra of compraSelect.listaItemsDeCompra) {
        console.log(itemCompra);
        this.dataApi.incrementarStockProducto(itemCompra.producto.id, this.sede, itemCompra.cantidad);
      }
    }
  }

  EditarCompra(compraSelect: CompraInterface){
    console.log('EditarCompraaaaaaaaaaaa', compraSelect);
    this.editCompra.setCompra(compraSelect);
  }


}

import { Component, OnInit } from '@angular/core';
import { ModalController, MenuController } from '@ionic/angular';
import { DetallesDeCompraPage } from 'src/app/modals/detalles-de-compra/detalles-de-compra.page';
import { CompraInterface } from 'src/app/models/Compra';
import { DataBaseService } from 'src/app/services/data-base.service';
import { EditarCompraService } from 'src/app/services/editar-compra.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-lista-de-compras',
  templateUrl: './lista-de-compras.page.html',
  styleUrls: ['./lista-de-compras.page.scss'],
})
export class ListaDeComprasPage implements OnInit {

  listaDeCompras: CompraInterface[];
  itemDeCompra: CompraInterface;

  sede = this.storage.datosAdmi.sede;

  constructor(
    private dataApi: DataBaseService,
    private modalCtlr: ModalController,
    private editCompra: EditarCompraService,
    private menuCtrl: MenuController,
    private storage: StorageService
  ) {
    this.ObtenerCompras();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }


  ObtenerCompras(){
    this.dataApi.obtenerComprasPorSede(this.sede).subscribe(compras => {
      this.listaDeCompras = compras;
    });
  }

  mostrarDetalleDeCompra(compraSelect: CompraInterface){
    this.abrirModalMostrarDetalles(compraSelect);
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
    if (!compraSelect.anulado){
      this.dataApi.toggleAnularCompra(compraSelect.id, false, this.sede).then(() => {
        for (const itemCompra of compraSelect.listaItemsDeCompra) {
          this.dataApi.decrementarStockProducto(itemCompra.producto.id, this.sede, itemCompra.cantidad);
        }
      });
    } else {
      this.dataApi.toggleAnularCompra(compraSelect.id, true, this.sede).then(() => {
        for (const itemCompra of compraSelect.listaItemsDeCompra) {
          this.dataApi.incrementarStockProducto(itemCompra.producto.id, this.sede, itemCompra.cantidad);
        }
      });
    }
  }

  EditarCompra(compraSelect: CompraInterface){
    console.log('EditarCompraaaaaaaaaaaa', compraSelect);
    this.editCompra.setCompra(compraSelect);
  }


}

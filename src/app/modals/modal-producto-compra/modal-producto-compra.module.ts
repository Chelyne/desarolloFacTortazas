import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalProductoCompraPageRoutingModule } from './modal-producto-compra-routing.module';

import { ModalProductoCompraPage } from './modal-producto-compra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalProductoCompraPageRoutingModule
  ],
  declarations: [ModalProductoCompraPage]
})
export class ModalProductoCompraPageModule {}

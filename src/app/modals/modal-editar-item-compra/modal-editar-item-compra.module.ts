import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalEditarItemCompraPageRoutingModule } from './modal-editar-item-compra-routing.module';

import { ModalEditarItemCompraPage } from './modal-editar-item-compra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalEditarItemCompraPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ModalEditarItemCompraPage]
})
export class ModalEditarItemCompraPageModule {}

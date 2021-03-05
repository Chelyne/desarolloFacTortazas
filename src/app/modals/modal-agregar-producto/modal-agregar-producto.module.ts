import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAgregarProductoPageRoutingModule } from './modal-agregar-producto-routing.module';

import { ModalAgregarProductoPage } from './modal-agregar-producto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ModalAgregarProductoPageRoutingModule
  ],
  declarations: [ModalAgregarProductoPage]
})
export class ModalAgregarProductoPageModule {}

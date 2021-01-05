import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAgregarCategoriasPageRoutingModule } from './modal-agregar-categorias-routing.module';

import { ModalAgregarCategoriasPage } from './modal-agregar-categorias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ModalAgregarCategoriasPageRoutingModule
  ],
  declarations: [ModalAgregarCategoriasPage]
})
export class ModalAgregarCategoriasPageModule {}

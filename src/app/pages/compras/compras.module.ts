import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComprasPageRoutingModule } from './compras-routing.module';

import { ComprasPage } from './compras.page';
import { ModalEditarItemCompraPage } from 'src/app/modals/modal-editar-item-compra/modal-editar-item-compra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComprasPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ComprasPage],
})
export class ComprasPageModule {}

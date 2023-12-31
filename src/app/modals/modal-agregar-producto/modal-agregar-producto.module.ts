import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAgregarProductoPageRoutingModule } from './modal-agregar-producto-routing.module';

import { ModalAgregarProductoPage } from './modal-agregar-producto.page';
import { PoppoverCategoriasComponent } from 'src/app/components/poppover-categorias/poppover-categorias.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { PopoverMarcasComponent } from 'src/app/components/popover-marcas/popover-marcas.component';

@NgModule({
  imports: [
    PipesModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ModalAgregarProductoPageRoutingModule
  ],
  declarations: [ModalAgregarProductoPage, PoppoverCategoriasComponent, PopoverMarcasComponent]
})
export class ModalAgregarProductoPageModule {}

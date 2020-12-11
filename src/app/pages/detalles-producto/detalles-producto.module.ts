import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesProductoPageRoutingModule } from './detalles-producto-routing.module';

import { DetallesProductoPage } from './detalles-producto.page';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { EditarProductoPage } from '../../modals/editar-producto/editar-producto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    DetallesProductoPageRoutingModule
  ],
  declarations: [DetallesProductoPage, PoppoverEditarComponent, EditarProductoPage],
  entryComponents: [PoppoverEditarComponent, EditarProductoPage]
})
export class DetallesProductoPageModule {}

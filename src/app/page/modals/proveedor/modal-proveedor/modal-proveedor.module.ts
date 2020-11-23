import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalProveedorPageRoutingModule } from './modal-proveedor-routing.module';

import { ModalProveedorPage } from './modal-proveedor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalProveedorPageRoutingModule,

    ReactiveFormsModule
  ],
  declarations: [ModalProveedorPage]
})
export class ModalProveedorPageModule {}

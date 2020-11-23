import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarProveedorPageRoutingModule } from './registrar-proveedor-routing.module';

import { RegistrarProveedorPage } from './registrar-proveedor.page';
import { ModalProveedorPage } from '../modals/proveedor/modal-proveedor/modal-proveedor.page';
import { ModalProveedorPageModule } from '../modals/proveedor/modal-proveedor/modal-proveedor.module';

@NgModule({
  entryComponents:[
    ModalProveedorPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarProveedorPageRoutingModule,

    ReactiveFormsModule,

    ModalProveedorPageModule
  ],
  declarations: [RegistrarProveedorPage]
})
export class RegistrarProveedorPageModule {}

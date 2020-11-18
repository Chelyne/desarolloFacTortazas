import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarProveedorPageRoutingModule } from './registrar-proveedor-routing.module';

import { RegistrarProveedorPage } from './registrar-proveedor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarProveedorPageRoutingModule,

    ReactiveFormsModule
  ],
  declarations: [RegistrarProveedorPage]
})
export class RegistrarProveedorPageModule {}

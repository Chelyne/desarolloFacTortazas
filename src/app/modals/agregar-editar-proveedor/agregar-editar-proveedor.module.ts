import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarEditarProveedorPageRoutingModule } from './agregar-editar-proveedor-routing.module';

import { AgregarEditarProveedorPage } from './agregar-editar-proveedor.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarEditarProveedorPageRoutingModule,

    ReactiveFormsModule
  ],
  declarations: [AgregarEditarProveedorPage]
})
export class AgregarEditarProveedorPageModule {}

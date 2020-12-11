import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDeProveedoresPageRoutingModule } from './lista-de-proveedores-routing.module';

import { ListaDeProveedoresPage } from './lista-de-proveedores.page';
import { AgregarEditarProveedorPage } from 'src/app/modals/agregar-editar-proveedor/agregar-editar-proveedor.page';
import { AgregarEditarProveedorPageModule } from 'src/app/modals/agregar-editar-proveedor/agregar-editar-proveedor.module';

@NgModule({
  entryComponents:[
    AgregarEditarProveedorPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDeProveedoresPageRoutingModule,
    ReactiveFormsModule,
    AgregarEditarProveedorPageModule
  ],
  declarations: [ListaDeProveedoresPage]
})
export class ListaDeProveedoresPageModule {}

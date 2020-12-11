import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CategoriasPagePageRoutingModule } from './categorias-page-routing.module';

import { CategoriasPagePage } from './categorias-page.page';
import { CategoriasProductosComponent } from '../../components/categorias-productos/categorias-productos.component';
import { AgregarProductoPage } from '../../modals/agregar-producto/agregar-producto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CategoriasPagePageRoutingModule
  ],
  declarations: [CategoriasPagePage, CategoriasProductosComponent, AgregarProductoPage],
  entryComponents : [AgregarProductoPage]
})
export class CategoriasPagePageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductosCompuestosPageRoutingModule } from './productos-compuestos-routing.module';

import { ProductosCompuestosPage } from './productos-compuestos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductosCompuestosPageRoutingModule
  ],
  declarations: [ProductosCompuestosPage]
})
export class ProductosCompuestosPageModule {}

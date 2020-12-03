import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarProductoPageRoutingModule } from './agregar-producto-routing.module';

import { AgregarProductoPage } from './agregar-producto.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AgregarProductoPageRoutingModule
  ],
  declarations: []
})
export class AgregarProductoPageModule {}

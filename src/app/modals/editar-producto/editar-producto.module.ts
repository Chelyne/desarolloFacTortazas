import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarProductoPageRoutingModule } from './editar-producto-routing.module';

import { EditarProductoPage } from './editar-producto.page';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    PipesModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    EditarProductoPageRoutingModule
  ],
  declarations: []
})
export class EditarProductoPageModule {}

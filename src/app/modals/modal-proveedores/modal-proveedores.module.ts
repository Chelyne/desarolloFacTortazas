import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalProveedoresPageRoutingModule } from './modal-proveedores-routing.module';

import { ModalProveedoresPage } from './modal-proveedores.page';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  imports: [
    PipesModule,
    CommonModule,
    FormsModule,
    IonicModule,
    ModalProveedoresPageRoutingModule
  ],
  declarations: [ModalProveedoresPage]
})
export class ModalProveedoresPageModule {}

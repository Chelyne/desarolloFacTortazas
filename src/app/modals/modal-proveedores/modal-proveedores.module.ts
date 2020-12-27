import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalProveedoresPageRoutingModule } from './modal-proveedores-routing.module';

import { ModalProveedoresPage } from './modal-proveedores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalProveedoresPageRoutingModule
  ],
  declarations: [ModalProveedoresPage]
})
export class ModalProveedoresPageModule {}

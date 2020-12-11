import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAgregarDescuentoPageRoutingModule } from './modal-agregar-descuento-routing.module';

import { ModalAgregarDescuentoPage } from './modal-agregar-descuento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalAgregarDescuentoPageRoutingModule
  ],
  declarations: [ModalAgregarDescuentoPage]
})
export class ModalAgregarDescuentoPageModule {}

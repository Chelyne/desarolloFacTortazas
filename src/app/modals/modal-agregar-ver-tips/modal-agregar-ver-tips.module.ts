import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAgregarVerTipsPageRoutingModule } from './modal-agregar-ver-tips-routing.module';

import { ModalAgregarVerTipsPage } from './modal-agregar-ver-tips.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ModalAgregarVerTipsPageRoutingModule
  ],
  declarations: []
})
export class ModalAgregarVerTipsPageModule {}

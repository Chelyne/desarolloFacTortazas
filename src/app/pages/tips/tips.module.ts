import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TipsPageRoutingModule } from './tips-routing.module';

import { TipsPage } from './tips.page';
import { ModalAgregarVerTipsPage } from '../../modals/modal-agregar-ver-tips/modal-agregar-ver-tips.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TipsPageRoutingModule
  ],
  declarations: [TipsPage, ModalAgregarVerTipsPage],
  entryComponents: [ModalAgregarVerTipsPage]
})
export class TipsPageModule {}

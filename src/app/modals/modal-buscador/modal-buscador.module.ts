import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalBuscadorPageRoutingModule } from './modal-buscador-routing.module';

import { ModalBuscadorPage } from './modal-buscador.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalBuscadorPageRoutingModule
  ],
  declarations: [ModalBuscadorPage]
})
export class ModalBuscadorPageModule {}

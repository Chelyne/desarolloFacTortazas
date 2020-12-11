import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalSubirOfertaPageRoutingModule } from './modal-subir-oferta-routing.module';

import { ModalSubirOfertaPage } from './modal-subir-oferta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalSubirOfertaPageRoutingModule
  ],
  declarations: []
})
export class ModalSubirOfertaPageModule {}

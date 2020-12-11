import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalDetallesServiciosPageRoutingModule } from './modal-detalles-servicios-routing.module';

import { ModalDetallesServiciosPage } from './modal-detalles-servicios.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalDetallesServiciosPageRoutingModule
  ],
  declarations: []
})
export class ModalDetallesServiciosPageModule {}

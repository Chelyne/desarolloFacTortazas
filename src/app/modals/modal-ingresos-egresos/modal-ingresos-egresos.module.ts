import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalIngresosEgresosPageRoutingModule } from './modal-ingresos-egresos-routing.module';

import { ModalIngresosEgresosPage } from './modal-ingresos-egresos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ModalIngresosEgresosPageRoutingModule
  ],
  declarations: [ModalIngresosEgresosPage]
})
export class ModalIngresosEgresosPageModule {}

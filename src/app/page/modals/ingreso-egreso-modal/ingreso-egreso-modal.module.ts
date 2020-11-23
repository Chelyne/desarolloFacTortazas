import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngresoEgresoModalPageRoutingModule } from './ingreso-egreso-modal-routing.module';

import { IngresoEgresoModalPage } from './ingreso-egreso-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresoEgresoModalPageRoutingModule,

    ReactiveFormsModule
  ],
  declarations: [IngresoEgresoModalPage]
})
export class IngresoEgresoModalPageModule {}

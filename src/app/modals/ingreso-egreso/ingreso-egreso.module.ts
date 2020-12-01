import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngresoEgresoPageRoutingModule } from './ingreso-egreso-routing.module';

import { IngresoEgresoPage } from './ingreso-egreso.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresoEgresoPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [IngresoEgresoPage]
})
export class IngresoEgresoPageModule {}

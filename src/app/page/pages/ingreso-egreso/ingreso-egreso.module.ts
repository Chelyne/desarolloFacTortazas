import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngresoEgresoPageRoutingModule } from './ingreso-egreso-routing.module';

import { IngresoEgresoPage } from './ingreso-egreso.page';
import { IngresoEgresoModalPageModule } from '../../modals/ingreso-egreso-modal/ingreso-egreso-modal.module';
import { IngresoEgresoModalPage } from '../../modals/ingreso-egreso-modal/ingreso-egreso-modal.page';

@NgModule({
  entryComponents:[
    IngresoEgresoModalPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresoEgresoPageRoutingModule,

    ReactiveFormsModule,

    IngresoEgresoModalPageModule
  ],
  declarations: [IngresoEgresoPage]
})
export class IngresoEgresoPageModule {}

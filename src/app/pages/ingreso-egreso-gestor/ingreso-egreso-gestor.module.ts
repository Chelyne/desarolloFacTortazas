import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IngresoEgresoGestorPageRoutingModule } from './ingreso-egreso-gestor-routing.module';

import { IngresoEgresoGestorPage } from './ingreso-egreso-gestor.page';
import { IngresoEgresoPage } from 'src/app/modals/ingreso-egreso/ingreso-egreso.page';
import { IngresoEgresoPageModule } from 'src/app/modals/ingreso-egreso/ingreso-egreso.module';

@NgModule({
  entryComponents:[
    IngresoEgresoPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresoEgresoGestorPageRoutingModule,
    IngresoEgresoPageModule
  ],
  declarations: [IngresoEgresoGestorPage]
})
export class IngresoEgresoGestorPageModule {}

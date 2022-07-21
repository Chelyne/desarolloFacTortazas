import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteIntentosVentaPageRoutingModule } from './reporte-intentos-venta-routing.module';

import { ReporteIntentosVentaPage } from './reporte-intentos-venta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReporteIntentosVentaPageRoutingModule
  ],
  declarations: [ReporteIntentosVentaPage]
})
export class ReporteIntentosVentaPageModule {}

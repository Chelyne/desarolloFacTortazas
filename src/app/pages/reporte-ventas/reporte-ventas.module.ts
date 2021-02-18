import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReporteVentasPageRoutingModule } from './reporte-ventas-routing.module';

import { ReporteVentasPage } from './reporte-ventas.page';
import { PopoverMesesComponent } from '../../components/popover-meses/popover-meses.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ReporteVentasPageRoutingModule
  ],
  declarations: [ReporteVentasPage, PopoverMesesComponent]
})
export class ReporteVentasPageModule {}

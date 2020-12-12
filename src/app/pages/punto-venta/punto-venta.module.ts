import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PuntoVentaPageRoutingModule } from './punto-venta-routing.module';

import { PuntoVentaPage } from './punto-venta.page';
import { ProductoVentaComponent } from 'src/app/components/producto-venta/producto-venta.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PuntoVentaPageRoutingModule,

    ReactiveFormsModule
  ],
  declarations: [PuntoVentaPage, ProductoVentaComponent]
})
export class PuntoVentaPageModule {}

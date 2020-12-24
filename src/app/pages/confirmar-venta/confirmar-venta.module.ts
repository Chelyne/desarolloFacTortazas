import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmarVentaPageRoutingModule } from './confirmar-venta-routing.module';

import { ConfirmarVentaPage } from './confirmar-venta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmarVentaPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [ConfirmarVentaPage]
})
export class ConfirmarVentaPageModule {}

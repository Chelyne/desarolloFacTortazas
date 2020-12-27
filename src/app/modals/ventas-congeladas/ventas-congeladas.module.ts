import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VentasCongeladasPageRoutingModule } from './ventas-congeladas-routing.module';

import { VentasCongeladasPage } from './ventas-congeladas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VentasCongeladasPageRoutingModule
  ],
  declarations: [VentasCongeladasPage]
})
export class VentasCongeladasPageModule {}

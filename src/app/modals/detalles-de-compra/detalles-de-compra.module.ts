import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetallesDeCompraPageRoutingModule } from './detalles-de-compra-routing.module';

import { DetallesDeCompraPage } from './detalles-de-compra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetallesDeCompraPageRoutingModule
  ],
  declarations: [DetallesDeCompraPage]
})
export class DetallesDeCompraPageModule {}

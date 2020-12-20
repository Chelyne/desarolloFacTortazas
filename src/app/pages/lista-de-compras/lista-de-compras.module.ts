import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDeComprasPageRoutingModule } from './lista-de-compras-routing.module';

import { ListaDeComprasPage } from './lista-de-compras.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDeComprasPageRoutingModule
  ],
  declarations: [ListaDeComprasPage]
})
export class ListaDeComprasPageModule {}

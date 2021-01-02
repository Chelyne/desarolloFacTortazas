import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDeVentasPageRoutingModule } from './lista-de-ventas-routing.module';

import { ListaDeVentasPage } from './lista-de-ventas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ListaDeVentasPageRoutingModule
  ],
  declarations: [ListaDeVentasPage]
})
export class ListaDeVentasPageModule {}

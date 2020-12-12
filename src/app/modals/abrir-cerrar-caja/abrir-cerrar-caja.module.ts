import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AbrirCerrarCajaPageRoutingModule } from './abrir-cerrar-caja-routing.module';

import { AbrirCerrarCajaPage } from './abrir-cerrar-caja.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    AbrirCerrarCajaPageRoutingModule
  ],
  declarations: [AbrirCerrarCajaPage]
})
export class AbrirCerrarCajaPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarUsuarioPageRoutingModule } from './registrar-usuario-routing.module';

import { RegistrarUsuarioPage } from './registrar-usuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarUsuarioPageRoutingModule,

    ReactiveFormsModule
  ],
  declarations: [RegistrarUsuarioPage]
})
export class RegistrarUsuarioPageModule {}

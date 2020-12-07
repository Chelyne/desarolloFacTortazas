import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarEditarUsuarioPageRoutingModule } from './agregar-editar-usuario-routing.module';

import { AgregarEditarUsuarioPage } from './agregar-editar-usuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarEditarUsuarioPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AgregarEditarUsuarioPage]
})
export class AgregarEditarUsuarioPageModule {}

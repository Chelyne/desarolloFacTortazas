import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarUsuarioPageRoutingModule } from './registrar-usuario-routing.module';

import { RegistrarUsuarioPage } from './registrar-usuario.page';
import { ModalUsuarioPage } from '../modal-usuario/modal-usuario.page';
import { ModalUsuarioPageModule } from '../modal-usuario/modal-usuario.module';

@NgModule({
  entryComponents:[
    ModalUsuarioPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarUsuarioPageRoutingModule,

    ReactiveFormsModule,

    ModalUsuarioPageModule
  ],
  declarations: [RegistrarUsuarioPage]
})
export class RegistrarUsuarioPageModule {}

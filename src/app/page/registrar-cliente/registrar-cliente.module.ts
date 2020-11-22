import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistrarClientePageRoutingModule } from './registrar-cliente-routing.module';

import { RegistrarClientePage } from './registrar-cliente.page';
import { ModalClientePage } from '../modal-cliente/modal-cliente.page';
import { ModalClientePageModule } from '../modal-cliente/modal-cliente.module';

@NgModule({
  entryComponents:[
    ModalClientePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistrarClientePageRoutingModule,

    ReactiveFormsModule,

    ModalClientePageModule
  ],
  declarations: [RegistrarClientePage]
})
export class RegistrarClientePageModule {}

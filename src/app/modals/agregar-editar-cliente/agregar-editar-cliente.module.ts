import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarEditarClientePageRoutingModule } from './agregar-editar-cliente-routing.module';

import { AgregarEditarClientePage } from './agregar-editar-cliente.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarEditarClientePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AgregarEditarClientePage]
})
export class AgregarEditarClientePageModule {}

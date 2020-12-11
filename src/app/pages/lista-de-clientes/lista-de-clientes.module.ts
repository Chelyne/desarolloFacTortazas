import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDeClientesPageRoutingModule } from './lista-de-clientes-routing.module';

import { ListaDeClientesPage } from './lista-de-clientes.page';
import { AgregarEditarClientePage } from 'src/app/modals/agregar-editar-cliente/agregar-editar-cliente.page';
import { AgregarEditarClientePageModule } from 'src/app/modals/agregar-editar-cliente/agregar-editar-cliente.module';

@NgModule({
  entryComponents:[
    AgregarEditarClientePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDeClientesPageRoutingModule,
    ReactiveFormsModule,
    AgregarEditarClientePageModule
  ],
  declarations: [ListaDeClientesPage]
})
export class ListaDeClientesPageModule {}

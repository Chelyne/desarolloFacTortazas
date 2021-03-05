import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDeUsariosPageRoutingModule } from './lista-de-usarios-routing.module';

import { ListaDeUsariosPage } from './lista-de-usarios.page';
import { AgregarEditarUsuarioPage } from 'src/app/modals/agregar-editar-usuario/agregar-editar-usuario.page';
import { AgregarEditarUsuarioPageModule } from 'src/app/modals/agregar-editar-usuario/agregar-editar-usuario.module';

@NgModule({
  entryComponents: [
    AgregarEditarUsuarioPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDeUsariosPageRoutingModule,
    AgregarEditarUsuarioPageModule
  ],
  declarations: [ListaDeUsariosPage]
})
export class ListaDeUsariosPageModule {}

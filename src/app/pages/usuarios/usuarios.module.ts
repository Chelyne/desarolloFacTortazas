import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuariosPageRoutingModule } from './usuarios-routing.module';

import { UsuariosPage } from './usuarios.page';
import { AgregarEditarUsuarioPage } from '../../modals/agregar-editar-usuario/agregar-editar-usuario.page';
import { AgregarEditarUsuarioPageModule } from '../../modals/agregar-editar-usuario/agregar-editar-usuario.module';

@NgModule({
  entryComponents: [
    AgregarEditarUsuarioPage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuariosPageRoutingModule,
    AgregarEditarUsuarioPageModule
  ],
  declarations: [UsuariosPage]
})
export class UsuariosPageModule {}

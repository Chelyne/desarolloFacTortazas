import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AbrirCerrarCajaPage } from './abrir-cerrar-caja.page';

const routes: Routes = [
  {
    path: '',
    component: AbrirCerrarCajaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AbrirCerrarCajaPageRoutingModule {}

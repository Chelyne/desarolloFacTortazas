import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarEditarProveedorPage } from './agregar-editar-proveedor.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarEditarProveedorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarEditarProveedorPageRoutingModule {}

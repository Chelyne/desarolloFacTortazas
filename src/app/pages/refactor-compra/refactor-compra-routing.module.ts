import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RefactorCompraPage } from './refactor-compra.page';

const routes: Routes = [
  {
    path: '',
    component: RefactorCompraPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RefactorCompraPageRoutingModule {}

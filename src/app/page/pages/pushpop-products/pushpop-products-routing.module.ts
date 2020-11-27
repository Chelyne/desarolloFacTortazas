import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PushpopProductsPage } from './pushpop-products.page';

const routes: Routes = [
  {
    path: '',
    component: PushpopProductsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PushpopProductsPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CajaChicaPage } from './caja-chica.page';

const routes: Routes = [
  {
    path: '',
    component: CajaChicaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CajaChicaPageRoutingModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PushpopProductsPageRoutingModule } from './pushpop-products-routing.module';

import { PushpopProductsPage } from './pushpop-products.page';
import { ComponentesModule } from '../../componentes/componentes.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PushpopProductsPageRoutingModule,

    ReactiveFormsModule,
    ComponentesModule
  ],
  declarations: [PushpopProductsPage]
})
export class PushpopProductsPageModule {}

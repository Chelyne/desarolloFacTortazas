import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RefactorCompraPageRoutingModule } from './refactor-compra-routing.module';

import { RefactorCompraPage } from './refactor-compra.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RefactorCompraPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [RefactorCompraPage]
})
export class RefactorCompraPageModule {}

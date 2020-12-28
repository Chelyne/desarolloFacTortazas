import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AgregarEditarProdCompuestosPageRoutingModule } from './agregar-editar-prod-compuestos-routing.module';

import { AgregarEditarProdCompuestosPage } from './agregar-editar-prod-compuestos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgregarEditarProdCompuestosPageRoutingModule
  ],
  declarations: [AgregarEditarProdCompuestosPage]
})
export class AgregarEditarProdCompuestosPageModule {}

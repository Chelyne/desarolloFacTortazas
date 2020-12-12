import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CajaChicaPageRoutingModule } from './caja-chica-routing.module';

import { CajaChicaPage } from './caja-chica.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CajaChicaPageRoutingModule
  ],
  declarations: [CajaChicaPage]
})
export class CajaChicaPageModule {}

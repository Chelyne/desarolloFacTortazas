import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OfertasPageRoutingModule } from './ofertas-routing.module';

import { OfertasPage } from './ofertas.page';
import { ModalSubirOfertaPage } from '../../modals/modal-subir-oferta/modal-subir-oferta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OfertasPageRoutingModule
  ],
  declarations: [OfertasPage, ModalSubirOfertaPage],
  entryComponents: [ModalSubirOfertaPage]
})
export class OfertasPageModule {}

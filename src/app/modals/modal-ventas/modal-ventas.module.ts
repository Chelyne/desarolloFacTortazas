import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalVentasPageRoutingModule } from './modal-ventas-routing.module';

import { ModalVentasPage } from './modal-ventas.page';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { PopoverWhatsappComponent } from '../../components/popover-whatsapp/popover-whatsapp.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalVentasPageRoutingModule,
    NgxQRCodeModule
  ],
  declarations: [ModalVentasPage, PopoverWhatsappComponent]
})
export class ModalVentasPageModule {}

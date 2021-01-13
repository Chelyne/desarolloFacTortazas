import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PuntoVentaPageRoutingModule } from './punto-venta-routing.module';

import { PuntoVentaPage } from './punto-venta.page';
import { ProductoVentaComponent } from 'src/app/components/producto-venta/producto-venta.component';
import { PoppoverClientesComponent } from '../../components/poppover-clientes/poppover-clientes.component';
import { PipesModule } from '../../pipes/pipes.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';

@NgModule({
  imports: [
    PipesModule,
    CommonModule,
    FormsModule,
    IonicModule,
    PuntoVentaPageRoutingModule,
    NgxQRCodeModule,
    ReactiveFormsModule
  ],
  declarations: [PuntoVentaPage, ProductoVentaComponent, PoppoverClientesComponent]
})
export class PuntoVentaPageModule {}

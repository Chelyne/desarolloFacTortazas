import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PedidosPageRoutingModule } from './pedidos-routing.module';

import { PedidosPage } from './pedidos.page';
import { ListaPedidosComponent } from '../../components/lista-pedidos/lista-pedidos.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedidosPageRoutingModule
  ],
  declarations: [PedidosPage, ListaPedidosComponent]
})
export class PedidosPageModule {}

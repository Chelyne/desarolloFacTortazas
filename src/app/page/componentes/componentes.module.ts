import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemVentaComponent } from './item-venta/item-venta.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { VentasEnEsperaComponent } from './ventas-en-espera/ventas-en-espera.component';



@NgModule({
  declarations: [
    ItemVentaComponent,
    VentasEnEsperaComponent
  ],
  exports:[
    ItemVentaComponent,
    VentasEnEsperaComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class ComponentesModule { }

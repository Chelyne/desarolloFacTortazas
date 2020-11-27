import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemVentaComponent } from './item-venta/item-venta.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ItemVentaComponent
  ],
  exports:[
    ItemVentaComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class ComponentesModule { }

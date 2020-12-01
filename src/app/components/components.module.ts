import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductoVentaComponent } from './producto-venta/producto-venta.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [
    ProductoVentaComponent
  ],
  exports:[
    ProductoVentaComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class ComponentsModule { }

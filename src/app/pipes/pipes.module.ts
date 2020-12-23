import { NgModule } from '@angular/core';
import { BuscarClientePipe } from './buscar-cliente.pipe';


@NgModule({
  declarations: [BuscarClientePipe],
  exports: [
    BuscarClientePipe
  ]
})
export class PipesModule { }

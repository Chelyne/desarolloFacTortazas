import { NgModule } from '@angular/core';
import { BuscarClientePipe } from './buscar-cliente.pipe';
import { BuscarCategoriaPipe } from './buscar-categoria.pipe';


@NgModule({
  declarations: [BuscarClientePipe, BuscarCategoriaPipe],
  exports: [
    BuscarClientePipe,
    BuscarCategoriaPipe
  ]
})
export class PipesModule { }

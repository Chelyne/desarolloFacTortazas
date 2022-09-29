import { NgModule } from '@angular/core';
import { BuscarClientePipe } from './buscar-cliente.pipe';
import { BuscarCategoriaPipe } from './buscar-categoria.pipe';
import { BuscarProveedorPipe } from './buscar-proveedor.pipe';


@NgModule({
  declarations: [BuscarClientePipe, BuscarCategoriaPipe, BuscarProveedorPipe],
  exports: [
    BuscarClientePipe,
    BuscarCategoriaPipe,
    BuscarProveedorPipe
  ]
})
export class PipesModule { }

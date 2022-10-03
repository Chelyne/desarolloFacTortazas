import { NgModule } from '@angular/core';
import { BuscarClientePipe } from './buscar-cliente.pipe';
import { BuscarCategoriaPipe } from './buscar-categoria.pipe';
import { BuscarProveedorPipe } from './buscar-proveedor.pipe';
import { BuscarMarcaPipe } from './buscar-marca.pipe';


@NgModule({
  declarations: [BuscarClientePipe, BuscarCategoriaPipe, BuscarProveedorPipe, BuscarMarcaPipe],
  exports: [
    BuscarClientePipe,
    BuscarCategoriaPipe,
    BuscarProveedorPipe,
    BuscarMarcaPipe
  ]
})
export class PipesModule { }

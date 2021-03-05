import { Pipe, PipeTransform } from '@angular/core';
import { CategoriaInterface } from '../models/CategoriaInterface';
import { GlobalService } from '../global/global.service';

@Pipe({
  name: 'buscarCategoria'
})
export class BuscarCategoriaPipe implements PipeTransform {
  constructor(private servGlobal: GlobalService) {}

  transform(categorias: CategoriaInterface[], texto: string): CategoriaInterface[] {
    console.log(categorias, texto);
    // return null;
    if (texto.length === 0) {
      return categorias;
    }
    texto = texto.toLocaleLowerCase();
    const datos = categorias.filter( categoria => {
      return categoria.categoria.toLocaleLowerCase().includes(texto);
    });
    if (!datos.length) {
      this.servGlobal.presentToast('No se encontró la categoría', {color: 'danger'});
    }
    return datos;
  }

}

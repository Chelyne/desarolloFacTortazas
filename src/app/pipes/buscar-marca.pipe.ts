import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { MarcaInterface } from '../models/MarcaInterface';

@Pipe({
  name: 'buscarMarca'
})
export class BuscarMarcaPipe implements PipeTransform {

  constructor(private servGlobal: GlobalService) {}

  transform(marcas: MarcaInterface[], texto: string): MarcaInterface[] {
    console.log(marcas, texto);
    // return null;
    if (texto.length === 0) {
      return marcas;
    }
    texto = texto.toLocaleLowerCase();
    const datos = marcas.filter( marca => {
      return marca.nombreMarca.toLocaleLowerCase().includes(texto);
    });
    if (!datos.length) {
      this.servGlobal.presentToast('No se encontró la marca', {color: 'danger'});
    }
    return datos;
  }

}

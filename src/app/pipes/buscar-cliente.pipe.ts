import { Pipe, PipeTransform } from '@angular/core';
import { ClienteInterface } from '../models/cliente-interface';
import { CategoriaInterface } from '../models/CategoriaInterface';
import { GlobalService } from '../global/global.service';

@Pipe({
  name: 'buscarCliente'
})
export class BuscarClientePipe implements PipeTransform {
  constructor(private servGlobal: GlobalService) {}

  transform(clientes: ClienteInterface[], texto: string): ClienteInterface[] {
    if (texto.length === 0) {
      return clientes;
    }
    texto = texto.toLocaleLowerCase();
    const datos = clientes.filter( cliente => {
      if (cliente.numDoc) {
        return cliente.nombre.toLocaleLowerCase().includes(texto)
        || cliente.numDoc.toLocaleLowerCase().includes(texto);
      } else {
        return cliente.nombre.toLocaleLowerCase().includes(texto);
      }
    });

    if (!datos.length) {
      this.servGlobal.presentToast('No se encontró el cliente', {color: 'danger'});
    }
    return datos;
  }

}

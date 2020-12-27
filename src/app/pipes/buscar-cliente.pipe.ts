import { Pipe, PipeTransform } from '@angular/core';
import { ClienteInterface } from '../models/cliente-interface';

@Pipe({
  name: 'buscarCliente'
})
export class BuscarClientePipe implements PipeTransform {

  transform(clientes: ClienteInterface[], texto: string): ClienteInterface[] {
    console.log(clientes, texto);
    // return null;
    if (texto.length === 0) {
      return clientes;
    }
    texto = texto.toLocaleLowerCase();
    return clientes.filter( cliente => {
      if (cliente.dni) {
        return cliente.nombre.toLocaleLowerCase().includes(texto) ||
        cliente.apellidos.toLocaleLowerCase().includes(texto)
        || cliente.dni.toLocaleLowerCase().includes(texto);
      } else {
        return cliente.nombre.toLocaleLowerCase().includes(texto) ||
        cliente.apellidos.toLocaleLowerCase().includes(texto);
      }
    });
  }

}

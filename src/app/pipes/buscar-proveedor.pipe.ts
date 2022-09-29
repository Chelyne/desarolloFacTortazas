import { Pipe, PipeTransform } from '@angular/core';
import { GlobalService } from '../global/global.service';
import { ProveedorInterface } from '../models/proveedor';

@Pipe({
  name: 'buscarProveedor'
})
export class BuscarProveedorPipe implements PipeTransform {
  constructor(private servGlobal: GlobalService) {}

  transform(proveedores: ProveedorInterface[], texto: string): ProveedorInterface[] {
    if (texto.length === 0) {
      return proveedores;
    }
    texto = texto.toLocaleLowerCase();
    const datos = proveedores.filter( proveedor => {
      if (proveedor.numeroDocumento) {
        return proveedor.nombre.toLocaleLowerCase().includes(texto)
        || proveedor.numeroDocumento.toLocaleLowerCase().includes(texto);
      } else {
        return proveedor.nombre.toLocaleLowerCase().includes(texto);
      }
    });

    if (!datos.length) {
      this.servGlobal.presentToast('No se encontró el proveedor', {color: 'danger'});
    }
    return datos;
  }

}

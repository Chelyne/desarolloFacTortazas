import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Proveedor } from '../interfaces/proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorRegistroService {

  constructor(private afs: AngularFirestore) { }


  guardarNuevoProveedor(newProveedor: Proveedor) {
    // const celular = newUsuario.celular;
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('prueba222').add(newProveedor); // .get().set(newcajaChina) //si es  que quieres asignar una id
      resolve();
    });
    return promesa;
    // this.afs.collection<ProductoInterface>(categoria).add(newProducto);
  }
}

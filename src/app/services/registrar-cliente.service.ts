import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { ClienteInterface } from '../interfaces/cliente-interface';

@Injectable({
  providedIn: 'root'
})
export class RegistrarClienteService {

  constructor(private afs: AngularFirestore) { }


  guardarNuevoCliente(newCliente: ClienteInterface) {
    // const celular = newUsuario.celular;
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('clientes').add(newCliente); // .get().set(newcajaChina) //si es  que quieres asignar una id
      resolve();
    });
    return promesa;
    // this.afs.collection<ProductoInterface>(categoria).add(newProducto);
  }
}

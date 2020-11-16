import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { Usuario } from '../interfaces/usuario';


@Injectable({
  providedIn: 'root'
})
export class UserRegistroService {


  constructor(private afs: AngularFirestore) { }


  guardarNuevoUsuario(newUser: Usuario) {
    // const celular = newUsuario.celular;
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').add(newUser); // .get().set(newcajaChina) //si es  que quieres asignar una id
      resolve();
    });
    return promesa;
    // this.afs.collection<ProductoInterface>(categoria).add(newProducto);
  }
}

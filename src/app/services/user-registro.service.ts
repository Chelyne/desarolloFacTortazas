import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

import { UsuarioInterface } from '../models/usuario';


@Injectable({
  providedIn: 'root'
})
export class UserRegistroService {

  private usuariosCollection: AngularFirestoreCollection<UsuarioInterface>;
  private usuarios: Observable<UsuarioInterface[]>;

  private usuarioDoc: AngularFirestoreDocument<UsuarioInterface>;
  private usuario: Observable<UsuarioInterface>;

  constructor(private afs: AngularFirestore) { }


  guardarUsuario(newUser: UsuarioInterface) {
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').add(newUser);
      resolve();
    });

    return promesa;
  }


  actualizarUsuario(idUser: string, newUser: UsuarioInterface) {
    //console.log( idUser, newUser);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').doc(idUser).update(newUser);
      resolve();
    });

    return promesa;
  }


  //TODO: hay que corregir esta funcion
  ObtenerUsuario(dni: string) {

    this.usuariosCollection = this.afs.collection('usuarios', ref=>ref.where('dni', '==', dni ));

    return this.usuarios = this.usuariosCollection.snapshotChanges()
    .pipe(map(
      changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as UsuarioInterface;
          data.id = action.payload.doc.id;
          return data;
          });
        }
    ));

  }


  ObtenerListaDeUsuarios() {

    this.usuariosCollection = this.afs.collection('usuarios');

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as UsuarioInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }


}

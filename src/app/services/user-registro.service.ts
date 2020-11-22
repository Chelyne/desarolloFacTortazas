import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

import { Usuario } from '../interfaces/usuario';


@Injectable({
  providedIn: 'root'
})
export class UserRegistroService {

  private usuariosCollection: AngularFirestoreCollection<Usuario>;
  private usuarios: Observable<Usuario[]>;

  private usuarioDoc: AngularFirestoreDocument<Usuario>;
  private usuario: Observable<Usuario>;

  constructor(private afs: AngularFirestore) { }


  guardarUsuario(newUser: Usuario) {
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').add(newUser);
      resolve();
    });

    return promesa;
  }


  actualizarUsuario(idUser: string, newUser: Usuario) {
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
          const data = action.payload.doc.data() as Usuario;
          data.id = action.payload.doc.id;
          return data;
          });
        }
    ));

  }


  ObtenerListaUsuarios() {

    this.usuariosCollection = this.afs.collection('usuarios');

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as Usuario;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }


}

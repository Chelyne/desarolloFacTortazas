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


  guardarNuevoUsuario(newUser: Usuario) {
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').add(newUser);
      resolve();
    });
    
    return promesa;
  }

  actualizarUsuario(idUser: string, newUser: Usuario) {
    console.log( idUser, newUser);
    // const celular = newUsuario.celular;
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').doc(idUser).update(newUser); // .get().set(newcajaChina) //si es  que quieres asignar una id
      resolve();
    });
    return promesa;
    // this.afs.collection<ProductoInterface>(categoria).add(newProducto);
  }

  // updateBook(usuario: Usuario): void {
  //   let dniUsuario = usuario.dni;
  //   //this.bookDoc = this.afs.doc<BookInterface>(`books/${idBook}`);
  //   //this.bookDoc.update(book);
  //   // this.afs.doc<Usuario>(`usuarios/${usuario}`).update({
  //   //   nombre: usuario.
  //   // });

  //   this.afs.collection('usuario')
  //   .doc('claveDelItem')
  //   .update({
  //     activo: true
  //   });

  // }




  // ObtenerUnUsuario(dni: string) {
  //   //const sede1 = dataCollection.toLocaleLowerCase();


  //   //this.usuarioDoc = this.afs.collection('usuarios').doc();//.doc(sede1).collection('clientes').doc(id);
  //   // this.usuarioDoc = this.afs.collection('usuarios', ref=>ref.where('dni', '<=', dni ));//.collection('clientes').doc(id);
  //   // console.log(this.usuariosCollection);
  //   const text = 'usuarios/dni';

  //   console.log(dni, "aaaaaaaaaaa", text);
  //   //this.usuarioDoc = this.afs.doc(text);

  //   this.usuarioDoc = this.afs.collection('usarios', ref=>ref.where('dni', '<=', dni )).doc('dni');




  //   //return this.usuarioDoc;
  //   return this.usuario = this.usuarioDoc.snapshotChanges().pipe(map(action => {

  //     if (action.payload.exists === false) {
  //       return null;
  //     } else {
  //       const data = action.payload.data() as Usuario;
  //       //data.id = action.payload.id;
  //       return data;
  //     }
  //   }));
  // }



  ObtenerUnUsuario(dni: string) {
    //const sede1 = dataCollection.toLocaleLowerCase();

    //this.usuarioDoc = this.afs.collection('usuarios').doc();//.doc(sede1).collection('clientes').doc(id);
    this.usuariosCollection = this.afs.collection('usuarios', ref=>ref.where('dni', '==', dni ));//.collection('clientes').doc(id);

    return this.usuarios = this.usuariosCollection.snapshotChanges()
    .pipe(map(
      changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as Usuario;
          //data.dni = action.payload.doc.id;
          return data;
          });
        }
    )
    );

  }

  ObtenerListaUsuarios() {
    //const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.usuariosCollection = this.afs.collection('usuarios');//.doc().collection('productos' , ref => ref.where('categoria', '==', categoria).limit(10));

    //.where('subCategoria', '==', subCategoria).orderBy('fechaRegistro', 'desc').limit(6));

    //return this.usuariosCollection;

    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as Usuario;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      )
    );

  }


}

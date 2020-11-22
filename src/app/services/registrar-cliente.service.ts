import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

import { ClienteInterface } from '../interfaces/cliente-interface';

@Injectable({
  providedIn: 'root'
})
export class RegistrarClienteService {

  coleccion : string = 'clientes';

  private clientesCollection: AngularFirestoreCollection<ClienteInterface>;
  private clientes: Observable<ClienteInterface[]>;



  constructor(private afs: AngularFirestore) { }


  guardarCliente(newCliente: ClienteInterface) {

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection(this.coleccion).add(newCliente);
      resolve();
    });

    return promesa;
  }


  actualizarCliente(idCliente: string, newCliente: ClienteInterface) {
    //console.log( idCliente, newCliente);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection(this.coleccion).doc(idCliente).update(newCliente);
      resolve();
    });

    return promesa;
  }


  ObtenerListaClientes() {

    this.clientesCollection = this.afs.collection(this.coleccion);

    return this.clientes = this.clientesCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as ClienteInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }








}

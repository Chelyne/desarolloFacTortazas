import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable} from 'rxjs';
import { map } from 'rxjs/operators';

import { ProveedorInterface } from '../interfaces/proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorRegistroService {

  coleccion : string = 'proveedores';

  private proveedoresCollection: AngularFirestoreCollection<ProveedorInterface>;
  private proveedores: Observable<ProveedorInterface[]>;

  constructor(private afs: AngularFirestore) { }


  guardarProveedor(newProveedor: ProveedorInterface) {

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('proveedores').add(newProveedor);
      resolve();
    });

    return promesa;
  }


  actualizarProveedor(idProveedor: string, newProveedor: ProveedorInterface) {
    //console.log( idProveedor, newProveedor);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection(this.coleccion).doc(idProveedor).update(newProveedor);
      resolve();
    });

    return promesa;
  }


  ObtenerListaDeProveedores() {

    this.proveedoresCollection = this.afs.collection(this.coleccion);

    return this.proveedores = this.proveedoresCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as ProveedorInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }

}

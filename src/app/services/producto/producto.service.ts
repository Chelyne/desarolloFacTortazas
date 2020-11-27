import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


import { ProductoInterface } from 'src/app/interfaces/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  coleccion : string = 'productos';

  private productosCollection: AngularFirestoreCollection<ProductoInterface>;
  private productos: Observable<ProductoInterface[]>;

  constructor(private afs: AngularFirestore) { }

  guardarProducto(newProducto: ProductoInterface) {

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection(this.coleccion).add(newProducto);
      resolve();
    });

    return promesa;
  }

  actualizarProducto(idProducto: string, newProducto: ProductoInterface) {
    //console.log( idProducto, newProducto);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection(this.coleccion).doc(idProducto).update(newProducto);
      resolve();
    });

    return promesa;
  }


  ObtenerListaProductos() {

    this.productosCollection = this.afs.collection(this.coleccion);

    return this.productos = this.productosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as ProductoInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }



}

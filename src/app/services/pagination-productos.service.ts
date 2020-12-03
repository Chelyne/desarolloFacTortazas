import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { ProductoInterface } from '../models/productoInterface';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class PaginationProductosService {
  ultimoDoc = null;
  categoria: string;
  private productoCollection: AngularFirestoreCollection<ProductoInterface>;

  private productos: Observable<ProductoInterface[]>;
  constructor(private afs: AngularFirestore) {
  }

  getProductos(sede: string, categoria: string, reset: string) {
    if (isNullOrUndefined(this.categoria)) {
      this.categoria = categoria;
    } else if (this.categoria !== categoria || reset === null) {
      this.ultimoDoc = null;
      this.categoria = categoria;
    }
    if (this.ultimoDoc === null) {
      this.productoCollection = this.afs.collection<ProductoInterface>('sedes').doc(sede)
      .collection('productos', ref => ref.where('subCategoria', '==', categoria).orderBy('fechaRegistro', 'desc').limit(8));
    } else {
      this.productoCollection = this.afs.collection<ProductoInterface>('sedes').doc(sede)
      // tslint:disable-next-line:max-line-length
      .collection('productos', ref => ref.where('subCategoria', '==', categoria).orderBy('fechaRegistro', 'desc').startAfter(this.ultimoDoc).limit(8));
    }
    return this.productoCollection.snapshotChanges().pipe(map( changes => {
      if (changes.length > 0) {
        this.ultimoDoc = changes[changes.length - 1].payload.doc;
      } else {
        this.ultimoDoc = null;
        return null;
      }
      return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
      });
    }));
  }
}

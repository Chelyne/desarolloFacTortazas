import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { ProductoInterface } from '../models/productoInterface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidosPaginationService {

  ultimoDoc = null;
  categoria: string;
  private productoCollection: AngularFirestoreCollection<ProductoInterface>;

  private productos: Observable<ProductoInterface[]>;
  constructor(private afs: AngularFirestore) {
  }

  getProductos(reset: string) {
    if ( reset === null) {
      this.ultimoDoc = null;
    }
    if (this.ultimoDoc === null) {
      this.productoCollection = this.afs
      .collection('pedidos', ref => ref.where('estado', '==', 'completado').orderBy('fechaCompra', 'desc').limit(5));
    } else {
      this.productoCollection = this.afs
      // tslint:disable-next-line:max-line-length
      .collection('pedidos', ref => ref.where('estado', '==', 'completado').orderBy('fechaCompra', 'desc').startAfter(this.ultimoDoc).limit(5));
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

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { CategoriaInterface } from '../models/CategoriaInterface';
import { ClienteInterface } from '../models/cliente-interface';

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {

  constructor(private afs: AngularFirestore) { }

  // ----------------------------------------------------------- */
  //                          GUARDAR                            */
  // ----------------------------------------------------------- */
  guardarCategoria(newCategoria: CategoriaInterface, sede: string) {
    const sede1 =  sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede1).collection('categorias').ref.add(newCategoria).then(data => {
      if (data.id) {
        return data.id;
      } else {
        return '';
      }
    }).catch(err => {
      throw String('fail');
    });
  }

  // GUARDAR CLIENTE
  guardarCliente(newCliente: ClienteInterface) {
    return this.afs.collection('clientes').ref.add(newCliente).then(data => {
      if (data.id) {
        return data.id;
      } else {
        return '';
      }
    }).catch(err => {
      throw String('fail');
    });
  }

  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */



  // ----------------------------------------------------------- */
  //                          OBTENER                            */
  // ----------------------------------------------------------- */
  ObtenerListaCategorias(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede1).collection('categorias', ref => ref.orderBy('categoria', 'asc'))
    .snapshotChanges().pipe(map(changes => {
      const datos: CategoriaInterface[] = [];

      changes.map((action: any) => {
        datos.push({
          id: action.payload.doc.id,
          ...action.payload.doc.data()
        });
      });

      return datos;
    }));
  }

  // CLIENTES
    ObtenerListaDeClientes() {
      return this.afs.collection('clientes')
      .snapshotChanges().pipe(map(changes => {
      const datos: ClienteInterface[] = [];

      changes.map((action: any) => {
        datos.push({
          id: action.payload.doc.id,
          ...action.payload.doc.data()
        });
      });

      return datos;
      }));
    }
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */



  // ----------------------------------------------------------- */
  //                          ACTUALIZAR                         */
  // ----------------------------------------------------------- */
  // ACTUALIZAR CLIENTE
  actualizarCliente(idCliente: string, newCliente: ClienteInterface) {
      return this.afs.collection('clientes').doc(idCliente).ref.update(newCliente).then(() => 'exito')
      .catch(err => {
        throw String('fail');
      });
  }
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */




  // ----------------------------------------------------------- */
  //                          ELIMINAR                           */
  // ----------------------------------------------------------- */
  eliminarCategoria(idCategoria: string, sede: string) {
      const sede1 = sede.toLocaleLowerCase();
      return this.afs.doc<CategoriaInterface>(`sedes/${sede1}/categorias/${idCategoria}`).delete().then(() => 'exito')
      .catch(err => {
        throw String('fail');
      });
  }
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */


}

import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { CategoriaInterface } from '../models/CategoriaInterface';
import { ClienteInterface } from '../models/cliente-interface';
import { ProductoInterface } from '../models/ProductoInterface';

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

  async guardarProductoIncrementaCodigo(newProducto: ProductoInterface, sede: string, correlacionActual: number) {
    const correlacion = parseInt(newProducto.codigo, 10);
    this.guardarProducto(newProducto, sede).then(async (idProducto) => {
      if (idProducto) {
        if (correlacionActual === correlacion ){
          // Incrementa la correlacion
          const resp = await this.incrementarCorrelacion(correlacionActual + 1, sede.toLocaleLowerCase());
          if (resp === 'exito'){
            return 'exito';
          }else {
            throw String('no se pudo incrementar la correlacion');
          }
        }
        throw String('fail');

      }


    });
  }

  guardarProducto(newProducto: ProductoInterface, sede: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('productos').ref.add(newProducto).then(data => {
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
  obtenerListaCategorias(sede: string) {
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
  obtenerListaDeClientes() {
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

  obtenerObjetoCorrelacionProducto(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.doc(`sedes/${sede1}`).snapshotChanges().pipe(map((action: any) => {
      let datos: any = {};

      if (action.payload.exists ) {
        datos = {
          id: action.payload.id,
          ...action.payload.data()
        };
      }
      return datos;

    }));
  }

  obtenerListaProductos(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede1).collection('productos', ref => ref.orderBy('fechaRegistro', 'desc').limit(20))
    .snapshotChanges().pipe(map(changes => {
      const datos: ProductoInterface[] = [];

      changes.map(action => {
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
  incrementarCorrelacion(newCorrelacion: number, sede: string){
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).ref.update({correlacionProducto: newCorrelacion})
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }

  actualizarProducto(productoObtenido: ProductoInterface) {
    const producto = {
      img: productoObtenido.img ? productoObtenido.img : null,
      nombre: productoObtenido.nombre,
      cantidad: productoObtenido.cantidad,
      medida: productoObtenido.medida,
      marca: productoObtenido.marca,
      codigo: productoObtenido.codigo,
      codigoBarra: productoObtenido.codigoBarra,
      precio: productoObtenido.precio,
      cantStock: productoObtenido.cantStock,
      fechaDeVencimiento: productoObtenido.fechaDeVencimiento,
      descripcionProducto: productoObtenido.descripcionProducto
    };
    return this.afs.collection('sedes').doc(productoObtenido.sede.toLocaleLowerCase()).collection('productos')
    .doc(productoObtenido.id).ref.update(producto)
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }

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

  eliminarProducto(idProducto: string, sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.doc<ProductoInterface>(`sedes/${sede1}/productos/${idProducto}`).ref.delete()
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */


}

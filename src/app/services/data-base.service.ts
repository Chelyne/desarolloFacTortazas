import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { ProductoInterface } from 'src/app/models/ProductoInterface';
import { CategoriaInterface } from '../models/CategoriaInterface';

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {

  constructor(private afs: AngularFirestore) { }

  // ----------------------------------------------------------- */
  //                          GUARDAR                            */
  // ----------------------------------------------------------- */
  async guardarProductoIncrementaCodigo(newProducto: ProductoInterface, sede: string, correlacionActual: number) {
    const correlacion = parseInt(newProducto.codigo, 10);
    this.GuardarProducto(newProducto, sede).then(async (idProducto) => {
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
  GuardarProducto(newProducto: ProductoInterface, sede: string) {
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

    ObtenerListaProductos(sede: string) {
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
  ObtenerListaCategorias(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede1).collection('categorias', ref => ref.orderBy('categoria', 'asc'))
    .snapshotChanges().pipe(map(changes => {
      const datos: CategoriaInterface[] = [];

      changes.map(action => {
        datos.push({
          id: action.payload.doc.id,
          ...action.payload.doc.data()
        });
      });

      return datos;
    }));
  }
  ObtenerObjetoCorrelacionProducto(sede: string) {
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

  ActualizarProducto(productoObtenido: ProductoInterface) {
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

  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */




  // ----------------------------------------------------------- */
  //                          ELIMINAR                           */
  // ----------------------------------------------------------- */
  EliminarProducto(idProducto: string, sede: string) {
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

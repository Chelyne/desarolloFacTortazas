import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { CategoriaInterface } from '../models/CategoriaInterface';
import { ClienteInterface } from '../models/cliente-interface';
import { ProductoInterface } from '../models/ProductoInterface';
import { AdmiInterface } from '../models/AdmiInterface';
import { VentaInterface } from 'src/app/models/venta/venta';

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
    return this.guardarProducto(newProducto, sede).then(async (idProducto) => {
      if (idProducto) {
        if (correlacionActual === correlacion ){
          // Incrementa la correlacion
          const resp = await this.incrementarCorrelacion(correlacionActual + 1, sede.toLocaleLowerCase());
          if (resp === 'exito'){
            return 'exito';
          }else {
            throw String('warnig');
          }
        }

      }
    }).catch(err => {
      if (err === 'warning') {
        console.log('');
        throw String('no se pudo incrementar la correlacion');
      }
      throw String('fail');
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
  // CAJA CHICA
  guardarCajaChica(newcajaChica) {
    return this.afs.collection('CajaChica').ref.add(newcajaChica).then(data => {
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
    // PRODUCTOS
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
  obtenerListaProductosSinLIMITE(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede1).collection('productos', ref => ref.orderBy('fechaRegistro', 'desc').limit(5))
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
    // CAJA CHICA
    obtenerListaCajaChica(sede: string) {
      return this.afs.collection('CajaChica', ref => ref.where('sede', '==', sede ).orderBy('FechaApertura', 'desc').limit(10) )
      .snapshotChanges().pipe(map(changes => {
        const datos: any[] = [];

        changes.map((action: any) => {
          datos.push({
            id: action.payload.doc.id,
            ...action.payload.doc.data()
          });
        });

        return datos;
      }));
    }

    validarCajaChicaVendedor(estadoCaja: string, dni: string) {
      console.log('obteniedno caja de: ', dni, ' con el estado ABIERTO: ', estadoCaja);
      return this.afs.collection('CajaChica').ref.where( 'dniVendedor', '==', dni).where('estado', '==', estadoCaja)
      .get().then( snapshot => {
        if (snapshot.empty) {
          return false;
        } else {
          return true;
        }
      });
    }

    // USUARIOS
    obtenerUsuariosPorSede(sede: string) {
      return this.afs.collection('Roles', ref => ref.where('sede', '==', sede ))
      .snapshotChanges().pipe(map(changes => {
        const datos: AdmiInterface[] = [];

        changes.map((action: any) => {
          datos.push({
            id: action.payload.doc.id,
            ...action.payload.doc.data()
          });
        });

        return datos;
      }));
    }

    // INGRESO Y EGRESO
    obtenerIngresoEgresoDia(sede: string, dia: string) {
      return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ingresosEgresos').doc(dia).collection('ingresosEgresosDia').ref.get()
      .then((querySnapshot) => {
        const datos: any[] = [];
        querySnapshot.forEach((doc) => {
          // console.log(doc.id, ' => ', doc.data());
          datos.push( {...doc.data(), id: doc.id});
        });
        return datos;
      }).catch(err => {
        console.log('no se pudo obtener los ingresos', err);
        throw String ('fail');
      });
    }

    // REPORTES
    obtenerVentasPorDia(sede: string, fecha: string) {
      return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha).collection('ventasDia').ref.get()
      .then((querySnapshot) => {
        const datos: any [] = [];
        querySnapshot.forEach((doc) => {
          // console.log(doc.id, ' => ', doc.data());
          datos.push( {...doc.data(), id: doc.id});
        });
        return datos;
      }).catch(err => {
        console.log('no se pudo obtener las ventas', err);
        throw String ('fail');
      });
    }

    obtenerVentaPorDiaVendedor(sede: string, dia: string, dniVendedor: string) {
      return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(dia).collection('ventasDia')
      .ref.where('vendedor.dni', '==', dniVendedor).get().then((querySnapshot) => {
        const datos: VentaInterface [] = [];
        querySnapshot.forEach((doc) => {
          datos.push( {...doc.data(), idVenta: doc.id});
        });
        return datos;
      }).catch(err => {
        console.log('no se pudo obtener las ventas', err);
        throw String ('fail');
      });
    }

    async obtenerProductosDeVenta(idProductoVenta: string, sede: string){
      // console.log('Id de un producto de venta en productVEnta', idProductoVenta);
      return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
      .collection('productosVenta').doc(idProductoVenta).ref.get()
      .then((doc: any) => {
        if (doc.exists) {
          return doc.data().productos;
        } else {
          // console.log('No such document!');
          return [];
        }
      }).catch(err => {
        console.log('Error al obtener items de Venta: ', err);
        throw String('fail');
      });
    }
    // COMPROBANTES
    obtenerComprobante(sede: string, fachaventas: string, numero: string, serie: string) {
     return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fachaventas).collection('ventasDia').
     ref.where('numeroComprobante', '==', numero).where('serieComprobante', '==', serie)
     .get().then((querySnapshot) => {
      const datos: VentaInterface [] = [];
      querySnapshot.forEach((doc) => {
        datos.push( {...doc.data(), idVenta: doc.id});
      });
      return datos;
    }).catch(err => {
      console.log('no se pudo obtener las ventas', err);
      throw String ('fail');
    });
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

  // ACTUALIZAR CAJA CHICA
  actualizarCajaChica(id: string, datoCajaChica: any){
    const caja = {
      saldoInicial: datoCajaChica.saldoInicial,
      nombreVendedor: datoCajaChica.nombreVendedor,
      dniVendedor: datoCajaChica.dniVendedor,
    };
    return this.afs.collection('CajaChica').doc(id).ref.update(caja).then(() => 'exito')
      .catch(err => {
        throw String('fail');
      });

  }
  cerrarCajaChica(id: string, dato: any){
    const caja = {
      saldoFinal: dato.saldoFinal,
      FechaCierre: dato.FechaCierre,
      estado: 'Cerrado'
    };
    return this.afs.collection('CajaChica').doc(id).update(caja).then(() => 'exito')
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
  eliminarCajaChica(idCaja: string) {
    return this.afs.doc<ProductoInterface>(`CajaChica/${idCaja}`).ref.delete()
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });

  }
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */


}

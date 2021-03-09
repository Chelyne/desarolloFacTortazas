import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { CategoriaInterface } from '../models/CategoriaInterface';
import { ClienteInterface } from '../models/cliente-interface';
import { ProductoInterface } from '../models/ProductoInterface';
import { CompraInterface } from '../models/Compra';
import { VentaInterface } from '../models/venta/venta';
import { formatDate } from '@angular/common';
import { ProveedorInterface } from '../models/proveedor';
import { AdmiInterface } from '../models/AdmiInterface';
import { formatearDateTime } from '../global/funciones-globales';

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

  // PUNTO DE VENTA CONFIRMAR VENTA Y GUARDAR

  confirmarVenta(venta: VentaInterface, sede: string) {
    console.log(venta);
    const data = {
      productos: venta.listaItemsDeVenta
    };
    const id = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const promesa = new Promise( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('productosVenta').add(data).then( guardado => {
        console.log(guardado);
        const dataVenta = {
          idListaProductos: guardado.id,
          cliente: venta.cliente,
          vendedor: venta.vendedor,
          tipoComprobante: venta.tipoComprobante,
          serieComprobante: venta.serieComprobante,
          numeroComprobante: venta.numeroComprobante,
          fechaEmision: new Date(),
          bolsa: venta.bolsa,
          cantidadBolsa: venta.cantidadBolsa,
          tipoPago: venta.tipoPago,
          estadoVenta: venta.estadoVenta,
          montoNeto: venta.montoNeto,
          descuentoVenta: venta.descuentoVenta,
          totalPagarVenta: venta.totalPagarVenta,
          igv: venta.igv,
          montoBase: venta.montoBase,
          montoPagado: venta.montoPagado

        };
        // tslint:disable-next-line:max-line-length
        this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(id).collection('ventasDia').add(dataVenta).then(ventas => {
          resolve(ventas.id);
        });
      });
    });
    return promesa;
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

  // INGRESO Y EGRESO
  guardarIngresoEgreso(ingresoEgreso: any, sede: string) {
      // const fecha = formatDate(new Date(), 'dd-MM-yyyy', 'es');
      const fecha = formatearDateTime('DD-MM-YYYY');
      return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
      .collection('ingresosEgresos').doc(fecha).collection('ingresosEgresosDia').ref.add(ingresoEgreso)
      .then(data => {
        if (data.id) {
          return data.id;
        } else {
          return '';
        }
      }).catch(err => {
        throw String('fail');
      });
  }
  // ------------------------------LIBIO----------------------------- */

  // TODO: HACIENDO ESTO
  guardarCompra(newCompra: CompraInterface, sede: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('compras').ref.add(newCompra)
    .then(data => {
      if (data.id) {
        return data.id;
      } else {
        return '';
      }
    }).catch(err => {
      throw String('fail');
    });
  }

  // Guardar Nuevo Proveedor
  guardarProveedor(newProveedor: ProveedorInterface) {
    return this.afs.collection('proveedores').ref.add(newProveedor).then(data => {
      if (data.id) {
        return data.id;
      } else {
        return '';
      }
    }).catch(err => {
      throw String('fail');
    });
  }

  // Guardar Nuevo USURARIO / VENDEDOR
  guardarUsuario(newUser: AdmiInterface) {
    return this.afs.collection('Roles').doc(newUser.correo).ref.set(newUser).then(() => 'exito').catch(err => {
      throw String('fail');
    });
  }
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

  obtenerListaProductosTodos(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede1).collection('productos', ref => ref.orderBy('fechaRegistro', 'desc'))
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

  async obtenerProductoPorId(idProducto: string, sede: string){
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('productos').doc(idProducto).ref.get()
    .then((doc: any) => {
      if (doc.exists) {
        return {id: doc.id, ...doc.data()};
      } else {
        console.log('Producto no encontrado!');
        return {};
      }
    }).catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }

  // ObtenerProductos por categoria
  ObtenerProductosCategoria(sede: string, subCategoria: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('productos' , ref => ref.where('subCategoria', '==', subCategoria).orderBy('fechaRegistro', 'desc'))
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

  // OBTENER CORRELACION COMPROBANTE
  obtenerCorrelacionComprobante(serie: string, sede: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('serie', ref => ref.where('serie', '==', serie).limit(1))
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
  // caja chica
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



  // OBTENER PRODUCTOS DE VENTAS
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

  // INGRESO Y EGRESO
  obtenerIngresoEgresoDia(sede: string, fecha: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('ingresosEgresos').doc(fecha).collection('ingresosEgresosDia').ref.get()
    .then((querySnapshot) => {
      const datos: any[] = [];
      querySnapshot.forEach((doc) => {
        datos.push( {...doc.data(), id: doc.id});
      });
      return datos;
    }).catch(err => {
      console.log('no se pudo obtener los ingresos', err);
      throw String ('fail');
    });
  }
  // -----------------------CELINE------------------------------------ */

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

    // REPORTES
  obtenerVentasPorDia(sede: string, fecha: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').ref.get()
    .then((querySnapshot) => {
      const datos: any [] = [];
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, ' => ', doc.data());
        datos.push({...doc.data(), id: doc.id});
      });
      return datos;
    }).catch(err => {
      console.log('no se pudo obtener las ventas', err);
      throw String ('fail');
    });
  }

  // OBTENER LISTA DE VENTAS
  obtenerVentasPorDiaObs(sede: string, fachaventas: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fachaventas)
    .collection('ventasDia', ref => ref.orderBy('fechaEmision', 'desc'))
    .snapshotChanges().pipe(map(changes => {
      const datos: VentaInterface[] = [];

      changes.map((action: any) => {
        datos.push({
          idVenta: action.payload.doc.id,
          ...action.payload.doc.data() as VentaInterface
        });
      });

      return datos;
    }));
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
  // ------------------------LIBIO----------------------------------- */
  obtenerProveedores() {
    return this.afs.collection('proveedores')
    .snapshotChanges().pipe(map(changes => {
      const datos: ProveedorInterface[] = [];

      changes.map(action => {
        datos.push({
          id: action.payload.doc.id,
          ...action.payload.doc.data() as ProveedorInterface
        });
      });

      return datos;

    }));

  }

  obtenerComprasPorSede(sede: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('compras' , ref => ref.orderBy('fechaRegistro', 'desc').limit(20))
    .snapshotChanges().pipe(map(changes => {
      const datos: CompraInterface[] = [];

      changes.map(action => {
        datos.push({
          id: action.payload.doc.id,
          ...action.payload.doc.data() as CompraInterface
        });
      });

      return datos;
    }));
  }

  obtenerUnAdministrador(correo: string) {
    return this.afs.doc(`Roles/${correo}`)
    .snapshotChanges().pipe(map(action => {
      let datos: any = {};
      if (action.payload.exists === false) {
        return null;
      } else {
        datos = {
          ...action.payload.data() as AdmiInterface,
          id: action.payload.id
        };
        return datos;
      }
    }));
  }

  obtenerUsuarios() {
    return this.afs.collection('Roles')
    .snapshotChanges().pipe(map(changes => {
      const datos: AdmiInterface[] = [];
      changes.map(action => {
        datos.push({
          id: action.payload.doc.id,
          ...action.payload.doc.data() as AdmiInterface
        });
      });
      return datos;
    }));
  }
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

  async incrementarStockProducto(idProducto: string, sede: string, cantidad: number){

    const cantidadStock: any = await this.obtenerProductoPorId(idProducto, sede).then((producto: ProductoInterface) => {
        if (!producto.id){
          return 'PRODUCTO_NO_REGISTRADO';
        }

        if (!producto.cantStock){
          return 0;
        }
        return producto.cantStock;
      }).catch( err => {
        console.log('llego a este error', err);
        return 'fail';
      });

    if (cantidadStock === 'PRODUCTO_NO_REGISTRADO'){
      throw String('PRODUCTO_NO_REGISTRADO');
    }

    if (cantidadStock === 'fail'){
      throw String('fail');
    }

    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('productos').doc(idProducto).update({cantStock: cantidadStock + cantidad})
    .then(() => {
      console.log('Stock de producto actualizado correctamente de: ', cantidadStock, 'a: ', cantidadStock + cantidad);
      return 'exito';
    }).catch(err => {
      console.log('No sep pudo actualizar correctamente el producto');
      console.log('Error', err);
      throw String('fail');
    });
  }

  async decrementarStockProducto(idProducto: string, sede: string, cantidad: number){

    const cantidadStock: any = await this.obtenerProductoPorId(idProducto, sede).then((producto: ProductoInterface) => {
      if (!producto.id){
        return 'PRODUCTO_NO_REGISTRADO';
      }

      if (!producto.cantStock){
        return 0;
      }
      return producto.cantStock;
    }).catch( err => {
      console.log(err);
      return 'fail';
    });

    if (cantidadStock === 'PRODUCTO_NO_REGISTRADO'){
      throw String('PRODUCTO_NO_REGISTRADO');
    }

    if (cantidadStock === 'fail'){
      throw String('fail');
    }

    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('productos').doc(idProducto).update({cantStock: cantidadStock - cantidad})
    .then(() => {
      console.log('Stock de producto actualizado correctamente de: ', cantidadStock, 'a: ', cantidadStock - cantidad);
      return 'exito';
    }).catch(err => {
      console.log('No sep pudo actualizar correctamente el producto');
      console.log('Error', err);
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

  // ACTUALIZAR CORRELACION
  actualizarCorrelacion(id: string, sede: string, correlacion1: number){
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('serie').doc(id).update({correlacion: correlacion1}).then(() => 'exito')
    .catch(err => {
      throw String('fail');
    });
  }

  // ANULAR VENTA
  toggleAnularVenta(idVenta: string, nuevoEstado: string, sede: string, fechaEmision: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fechaEmision)
    .collection('ventasDia').doc(idVenta).update({estadoVenta: nuevoEstado}).then(() => 'exito')
    .catch(err => {
      throw String('fail');
    });
  }
  // --------------------------CELINE--------------------------------- */
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
  // -------------------------------LIBIO---------------------------- */
  async actualizarCompra(idCompra: string, datosCompra: CompraInterface, sede: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('compras').doc(idCompra).ref
    .update(datosCompra).then(() => 'exito')
    .catch(err => {
      throw String('fail');
    });
  }

  async toggleAnularCompra(idCompra: string, esAnulado: boolean, sede: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('compras').doc(idCompra).ref
    .update({anulado: !esAnulado})
    .then(() => 'exito').catch(err => {
      console.log(err);
      throw String('fail');
    });
  }

  actualizarProveedor(idProveedor: string, newProveedor: ProveedorInterface) {
    return this.afs.collection('proveedores').doc(idProveedor).ref.update(newProveedor)
    .then(() => 'exito').catch(err => {
      console.log(err);
      throw String('fail');
    });
  }

  actualizarUsuario(idUser: string, newUser: AdmiInterface) {
    return this.afs.collection('Roles').doc(idUser).ref.update(newUser)
    .then(() => 'exito').catch(err => {
      console.log(err);
      throw String('fail');
    });
  }

  // FUNCIONES QUE SE USAN PARA SUBIR PRODUCTOS
  // actualizarArrayNOmnre del producto
  actualizarArrayNombre(sede: string, id: string, arraynombre: any) {
    return this.afs.collection('sedes').doc(sede)
    .collection('productos').doc(id).update({arrayNombre: arraynombre}).then(() => 'exito')
    .catch(err => {
      throw String('fail');
    });
  }

  actualizarUrlFoto(sede: string, id: string, url: string) {
    return this.afs.collection('sedes').doc(sede).collection('productos').doc(id).update({img: url}).then(() => 'exito')
    .catch(err => {
      throw String('fail');
    });
  }
  // FIN FUNCIONES QUE NO SE USAN MUCHO
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

  eliminarUsuario(idUsuario: string) {
    return this.afs.doc<ProductoInterface>(`Roles/${idUsuario}`).ref.delete()
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }
  // -----------------------------LIBIO------------------------------ */
  eliminarProveedor(idProveedor: string) {
    return this.afs.doc<ProductoInterface>(`proveedores/${idProveedor}`).ref.delete()
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */


}

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
import { EmpresaInterface } from 'src/app/models/api-peru/empresa';
import { CDRInterface } from 'src/app/models/api-peru/cdr-interface';
import { ContadorDeSerieInterface } from 'src/app/models/serie';
import { ItemDeVentaInterface } from '../models/venta/item-de-venta';

@Injectable({
  providedIn: 'root'
})
export class DataBaseService {

  constructor(private afs: AngularFirestore) { }

  // ----------------------------------------------------------- */
  //                          ANCHOR GUARDAR                            */
  // ----------------------------------------------------------- */
  guardarCategoria(newCategoria: CategoriaInterface, sede: string) {
    // const sede1 =  sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede.toLowerCase()).collection('categorias').ref.add(newCategoria).then(data => {
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
    console.log('%c%s', 'color: #aa00ff', newProducto);
    console.log( newProducto);


    const correlacion = parseInt(newProducto.codigo, 10);
    const arrayNombre = newProducto.nombre.toLowerCase().split(' ');
    newProducto.arrayNombre = arrayNombre;
    console.log('GYARDAR: ', newProducto);
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
    const arrayNombre = newProducto.nombre.toLocaleLowerCase().split(' ');
    newProducto.arrayNombre = arrayNombre;
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
          montoPagado: venta.montoPagado,
          idCajaChica: venta.idCajaChica

        };
        // tslint:disable-next-line:max-line-length
        this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(id).collection('ventasDia').add(dataVenta).then(ventas => {
          resolve(ventas.id);
        });
      });
    });
    return promesa;
  }

  guardarVentaPorId(sede: string, fecha: string, venta: VentaInterface){
    if (!venta.idVenta){
      throw String('Venta vacia');
    }

    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas')
    .doc(fecha).collection('ventasDia')
    .doc(venta.idVenta).set({...venta})
    .then(() => 'exito').catch(err => {
      throw String ('fail');
    });
  }

  guardarProductosDeVentaPorId(sede: string, productoDeVena: {id: string, productos: ItemDeVentaInterface[]}) {

    if (!productoDeVena.id) {
      throw String('producto D eVenta No tiene id');
    }

    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('productosVenta')
      .doc(productoDeVena.id).set({ productos: productoDeVena.productos })
      .then(() => 'exito').catch(err => {
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

  // GUARDAR CLIENTE
  guardarCongelarVenta(sede: string, venta: VentaInterface) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventasCongeladas').ref.add(venta).then(data => {
      if (data.id) {
        return data.id;
      } else {
        return '';
      }
    }).catch(err => {
      throw String('fail');
    });
  }

  // INGRESO Y EGRESO VENDEDOR
  obtenerIngresoEgresoDiaVendedor(sede: string, fecha: string, dniVendedor: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('ingresosEgresos').doc(fecha).collection('ingresosEgresosDia').ref.where('dniVendedor', '==', dniVendedor).get()
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
  // INGRESO Y EGRESO CAJA CHICA
  obtenerIngresoEgresoDiaCaja(sede: string, fecha: string, idCaja: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('ingresosEgresos').doc(fecha).collection('ingresosEgresosDia').ref.where('idCajaChica', '==', idCaja).get()
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
  // ------------------------------LIBIO----------------------------- */

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

  async guardarDatosEmpresa(empresa: EmpresaInterface) {
    return this.afs.collection('empresa').doc('datosEmpresa').update(empresa)
    .then( () => 'exito' )
    .catch(  error => {
      console.log('Los datos no se guardaron correctamente', error);
      throw String('fail');
    });
  }

  guardarCDR(idVenta: string, fechaEmision: any, sede: string, cdrVenta: CDRInterface){

    const fecha = formatearDateTime('DD-MM-YYYY', fechaEmision);

    if (fecha === 'INVALID_DATA_TIME'){
      throw String('La fecha de emision no es valida');
    }

    return  this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').doc(idVenta).ref.update({cdr: cdrVenta})
    .then(() => 'exito').catch(err => {
      console.log('Error al guardar CDR', err);
      throw String('fail');
    });

  }

  async guardarCDRAnulado(
    idVenta: string,
    fechaEmision: any,
    sede: string,
    cdrAnulacion: CDRInterface,
    fechaAnulacion: string,
    DatosSerie: {serie: string, correlacion: number}
  ){

    const fecha = formatearDateTime('DD-MM-YYYY', fechaEmision);

    if (fecha === 'INVALID_DATA_TIME'){
      throw String('La fecha de emision no es valida');
    }

    const obj = {
      cdr: cdrAnulacion,
      fechaDeAnulacion: fechaAnulacion,
      serie: DatosSerie.serie,
      correlacion: DatosSerie.correlacion
    };

    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').doc(idVenta).ref.update({cdrAnulado: obj})
    .then(() => 'exito').catch(err => {
      throw String('fail');
    });
  }


  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */



  // ----------------------------------------------------------- */
  //                          ANCHOR OBTENER                            */
  // ----------------------------------------------------------- */

  // OBTENER VENTAS CONGELADAS
  obtenerVentasCongeladas(sede: string, idUser: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventasCongeladas',
    ref => ref.where('vendedor.id', '==', idUser))
    .snapshotChanges().pipe(map(changes => {
      const datos: VentaInterface[] = [];
      changes.map((action: any) => {
        datos.push({
          id: action.payload.doc.id,
          ...action.payload.doc.data()
        });
      });
      return datos;
    }));
  }

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
    return this.afs.collection('clientes') // ,  ref => ref.orderBy('fechaRegistro', 'desc'))
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
      // if (snapshot.empty) {
      //   return false;
      // } else {
      //   return true;
      // }
      const datos: any[] = [];
      snapshot.forEach((doc) => {
        datos.push( {...doc.data(), id: doc.id});
      });
      return datos;
    }).catch(err => {
      console.log('no se pudo obtener caja chica', err);
      throw String ('fail');
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

  obtenerVentasPorId(sede: string, fecha: string, idVenta: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').doc(idVenta).ref.get()
    .then((doc: any) => {
      if (doc.exists) {
        return {idVenta: doc.id, ...doc.data()};
      } else {
        // console.log('No such document!');
        return {};
      }
    }).catch(err => {
      console.log('Error al obtener items de Venta: ', err);
      throw String('fail');
    });
  }
  obtenerVentasBoletasFacturasPorDia(sede: string, fecha: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').ref.where('tipoComprobante', '<', 'n. venta').get()
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
  obtenerVentasDiaTarjeta(sede: string, fecha: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').ref.where('tipoPago', '==', 'tarjeta').get()
    .then((querySnapshot) => {
      const datos: any [] = [];
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, ' => ', doc.data());
        datos.push({...doc.data(), id: doc.id});
      });
      return datos;
    }).catch(err => {
      console.log('no se pudo obtener las ventas por tarjetas', err);
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

  // OBTENER LISTA DE VENTAS
  obtenerVentasPorDiaBoletaFacturaObs(sede: string, fachaventas: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fachaventas)
    .collection('ventasDia', ref => ref.where('tipoComprobante', '<', 'n. venta'))
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
  obtenerVentaPorDiaCajaChica(sede: string, dia: string, idCaja: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(dia).collection('ventasDia')
    .ref.where('idCajaChica', '==', idCaja).get().then((querySnapshot) => {
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

  // obtener una venta por id
  obtenerUnaVentaPorId(sede: string, fecha: string, id: string) {
    return this.afs.doc(`sedes/${sede.toLocaleLowerCase()}/ventas/${fecha}/ventasDia/${id}`)
    .snapshotChanges().pipe(map(action => {
      let datos: any = {};
      if (action.payload.exists === false) {
        return null;
      } else {
        datos = {
          ...action.payload.data() as VentaInterface,
          id: action.payload.id
        };
        return datos;
      }
    }));
  }

  obtenerListaProductosStock(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    return this.afs.collection('sedes').doc(sede1).collection('productos', ref => ref.orderBy('cantStock', 'asc').limit(100))
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

  obtenerEmpresa(){
    return this.afs.collection('empresa').doc('datosEmpresa').valueChanges();
  }

  obtenerCorrelacionPorTypoComprobante(typoDocumento: string, sede: string) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('serie').ref.where('tipoComprobante', '==', typoDocumento).limit(1).get()
    .then((querySnapshot) => {
      let serie: ContadorDeSerieInterface = {};
      querySnapshot.forEach((doc) => {
        serie = {...doc.data()};
        serie.id = doc.id;
      });
      return serie;
    }).catch(err => {
      console.log('no se pudo obtener serie', err);
      throw String('fail');
    });
  }
  // ----------------------------------------------------------- */



  // ----------------------------------------------------------- */
  //                          ANCHOR ACTUALIZAR                         */
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

        if (typeof producto.cantStock === 'string'){
          return  parseInt(producto.cantStock, 10);
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

      if (typeof producto.cantStock === 'string'){
        return  parseInt(producto.cantStock, 10);
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
    console.log('Actualizar producto');
    // const producto: ProductoInterface = {
    //   img: productoObtenido.img ? productoObtenido.img : null,
    //   nombre: productoObtenido.nombre,
    //   arrayNombre: productoObtenido.nombre.toLowerCase().split(' '),
    //   cantidad: productoObtenido.cantidad,
    //   medida: productoObtenido.medida,
    //   marca: productoObtenido.marca,
    //   codigo: productoObtenido.codigo,
    //   codigoBarra: productoObtenido.codigoBarra,
    //   precio: productoObtenido.precio,
    //   cantStock: productoObtenido.cantStock,
    //   fechaDeVencimiento: productoObtenido.fechaDeVencimiento,
    //   descripcionProducto: productoObtenido.descripcionProducto,
    // };

    // if (productoObtenido.variantes) {
    //   producto.variantes = productoObtenido.variantes;
    // }
    // console.log(producto);
    console.log('%c%s', 'color: #3e2066', productoObtenido);

    console.log('producto obtenido', productoObtenido);



    return this.afs.collection('sedes').doc(productoObtenido.sede.toLowerCase()).collection('productos')
    .doc(productoObtenido.id).ref.update(productoObtenido)
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

  incrementarCorrelacionTypoDocumento(idSerie: string, sede: string, correlacionActual: number) {

    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('serie')
    .doc(idSerie).ref.update({correlacion: correlacionActual})
    .then(() => 'exito')
    .catch(err => {
      throw String('fail');
    });

  }
  // FIN FUNCIONES QUE NO SE USAN MUCHO
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */

  // ACTUALIZAR PRECIO DE COMPRA
  actualizarPrecioCompraProducto(idProducto: string, sede: string, precioDeCompra: number) {
    return this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('productos')
    .doc(idProducto).ref.update({precioCompra: precioDeCompra})
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }


  // ----------------------------------------------------------- */
  //                         ANCHOR ELIMINAR                           */
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

  eliminarVentaCongelada(sede: string, idVentaCongelada: string) {
    return this.afs.doc<ProductoInterface>(`sedes/${sede.toLocaleLowerCase()}/ventasCongeladas/${idVentaCongelada}`).ref.delete()
    .then(() => 'exito').catch(err => {
      console.log('error', err);
      throw String('fail');
    });
  }
  // ----------------------------------------------------------- */
  // ----------------------------------------------------------- */


}

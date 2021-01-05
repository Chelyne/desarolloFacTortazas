import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductoInterface } from '../models/ProductoInterface';
import { CategoriaInterface } from '../models/CategoriaInterface';
import { AdmiInterface } from '../models/AdmiInterface';
import { ClienteInterface } from '../models/cliente-interface';
import { ProveedorInterface } from '../models/proveedor';
import { CompraInterface } from '../models/Compra';
import { EmpresaInterface } from '../models/api-peru/empresa';
import { VentaInterface } from '../models/venta/venta';
import { formatDate } from '@angular/common';
import { CDRInterface } from '../models/api-peru/cdr-interface';
import { ItemDeVentaInterface } from '../models/venta/item-de-venta';
import * as moment from 'moment';
// import { Console } from 'console';

@Injectable({
  providedIn: 'root'
})
export class DbDataService {

  private productoCollection: AngularFirestoreCollection<ProductoInterface>;
  private productos: Observable<ProductoInterface[]>;

  private productoDoc: AngularFirestoreDocument<ProductoInterface>;
  private producto: Observable<ProductoInterface>;

  private clienteCollection: AngularFirestoreCollection<ClienteInterface>;
  private clientes: Observable<ClienteInterface[]>;

  private clientesCollection: AngularFirestoreCollection<ClienteInterface>;
  // private clientes: Observable<ClienteInterface[]>;

  private administradorDoc: AngularFirestoreDocument<AdmiInterface>;
  private administrador: Observable<AdmiInterface>;

  private usuariosCollection: AngularFirestoreCollection<AdmiInterface>;
  private usuarios: Observable<AdmiInterface[]>;

  private usuarioDoc: AngularFirestoreDocument<AdmiInterface>;
  private usuario: Observable<AdmiInterface>;

  private proveedoresCollection: AngularFirestoreCollection<ProveedorInterface>;
  private proveedores: Observable<ProveedorInterface[]>;


  private comprasCollection: AngularFirestoreCollection<ProductoInterface>;
  private compras: Observable<ProductoInterface[]>;

  private compraDoc: AngularFirestoreDocument<ProductoInterface>;
  private compra: Observable<ProductoInterface>;

  private datosEmpresa: EmpresaInterface[] = [];
  private ventaCollection: AngularFirestoreCollection<VentaInterface>;
  private ventas: Observable<VentaInterface[]>;

  private itemsDeVentaCollection: AngularFirestoreCollection<ItemDeVentaInterface>;
  private itemsDeVenta: Observable<ItemDeVentaInterface[]>;

  private itemDeventaDoc: AngularFirestoreDocument<ItemDeVentaInterface>;
  private itemDeventa: Observable<ItemDeVentaInterface>;

  private categoriaCollection: AngularFirestoreCollection<CategoriaInterface>;
  private categorias: Observable<CategoriaInterface[]>;

  private categoriaDoc: AngularFirestoreDocument<CategoriaInterface>;
  private categoria: Observable<CategoriaInterface>;

  constructor(private afs: AngularFirestore) { }

  guardarProducto(newProducto: ProductoInterface, sede: string): void {
    const sede1 =  sede.toLocaleLowerCase();
    this.afs.collection('sedes').doc(sede1).collection('productos').add(newProducto);
  }

  guardarCategoria(newCategoria: CategoriaInterface, sede: string): void {
    const sede1 =  sede.toLocaleLowerCase();
    this.afs.collection('sedes').doc(sede1).collection('categorias').add(newCategoria);
  }

  guardarNotificcion(notificacion): void {
    // const sede1 =  sede.toLocaleLowerCase();
    this.afs.collection('notificaciones').add(notificacion);
  }

  actualizarToken(tok: string, correo: string) {
    this.afs.collection('Roles').doc(correo).update({token: tok});
  }

  ObtenerUnProducto(sede: string, id: string) {
    const sede1 = sede.toLocaleLowerCase();
    this.productoDoc = this.afs.collection('sedes').doc(sede1).collection('productos').doc(id);
    return this.producto = this.productoDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as ProductoInterface;
        data.id = action.payload.id;
        return data;
      }
    }));
  }

  ActualizarDataProducto(data: ProductoInterface): void {
    const sede1 = data.sede.toLocaleLowerCase();
    this.productoDoc = this.afs.collection('sedes').doc(sede1).collection('productos').doc(data.id);
    if (data.categoria === 'farmacia') {
      this.productoDoc.update(data);
    } else {
      if (data.img) {
        this.productoDoc.update({
          img: data.img,
          nombre: data.nombre,
          cantidad: data.cantidad,
          medida: data.medida,
          marca: data.marca,
          precio: data.precio,
          cantStock: data.cantStock,
          fechaDeVencimiento: data.fechaDeVencimiento,
          descripcionProducto: data.descripcionProducto
          // tallas: data.tallas
        });
      } else {
        this.productoDoc.update({
          nombre: data.nombre,
          cantidad: data.cantidad,
          medida: data.medida,
          marca: data.marca,
          precio: data.precio,
          cantStock: data.cantStock,
          fechaDeVencimiento: data.fechaDeVencimiento,
          descripcionProducto: data.descripcionProducto
          // tallas: data.tallas
        });
      }
    }
  }

  EliminarProducto(idProducto: string, sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    this.productoDoc = this.afs.doc<ProductoInterface>(`sedes/${sede1}/productos/${idProducto}`);
    this.productoDoc.delete();
  }

  ObtenerListaProductos(sede: string, categoria: string, subCategoria: string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos' , ref => ref.where('categoria', '==', categoria).where('subCategoria', '==', subCategoria).orderBy('fechaRegistro', 'desc').limit(6));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  ObtenerListaProductosByName(sede: string, nombre: string, limit: number) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos' , ref => ref.orderBy('nombre').startAt(nombre).endAt(nombre + '\uf8ff').limit(limit));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  ObtenerListaProductosSinCat(sede: string, limit: number) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos', ref => ref.orderBy('fechaRegistro', 'desc').limit(limit));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  ObtenerListaDeVentas(sede: string, fachaventas: string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.ventaCollection = this.afs.collection('sedes').doc(sede1).collection('ventas').doc(fachaventas).collection('ventasDia');
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.ventas = this.ventaCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as VentaInterface;
          data.idVenta = action.payload.doc.id;
          return data;
        });
      }));
  }

  ObtenerListaClientes(sede: string) {
    // const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.clienteCollection = this.afs.collection('clientes' , ref => ref.where('ubicacion.provincia', '==', sede).orderBy('fechaRegistro', 'desc').limit(10));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.clientes = this.clienteCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  // datos de administrador

  ObtenerUnAdministrador(correo: string) {
    this.administradorDoc = this.afs.doc(`Roles/${correo}`);
    return this.administrador = this.administradorDoc.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data() as AdmiInterface;
        data.id = action.payload.id;
        return data;
      }
    }));
  }

  // sliders
  ObtenerSliders(sede: string) {
    return this.afs.collection<any>('sedes').doc(sede.toLocaleLowerCase()).collection('ofertas', ref => ref
    .orderBy('fechaFinal', 'asc').limit(10)).snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as any;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  // Ofertas para clientes
  guardarOferta(oferta: any, sede: string) {
    // const sede1 =  sede.toLocaleLowerCase();
    const promesa =  new Promise<void>((resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ofertas').add(oferta);
      resolve();
    });
    return promesa;
  }

  actualizarOferta(id: string, data: any) {
    let datos;
    if (data.img) {
      datos = {
        fechaFinal: data.fechaFinal,
        img: data.img,
        sede: data.sede
      };
    } else {
      datos = {
        fechaFinal: data.fechaFinal,
        sede: data.sede
      };
    }
    const promesa = new Promise<void>((resolve, reject) => {
      this.afs.collection('sedes').doc(data.sede.toLocaleLowerCase()).collection('ofertas').doc(id).update(datos);
      resolve();
    });
    return promesa;
  }

  EliminarOferta(idOferta: string, sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    this.productoDoc = this.afs.doc<ProductoInterface>(`sedes/${sede1}/ofertas/${idOferta}`);
    this.productoDoc.delete();
  }


  // historial pedidos

  ObtenerListapedidos(estadoPedido: string, sede: string) {
    this.productoCollection = this.afs.collection('pedidos'
    , ref => ref.where('estado', '==', estadoPedido).where('sede', '==', sede)
    .orderBy('fechaCompra', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  // tiendas pedidos

  ObtenerTiendasPedidos(idCompra: string) {
    this.productoCollection = this.afs.collection('pedidosTiendas'
    , ref => ref.where('idCompra', '==', idCompra));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as any;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  actualizarEstadoPedido(id: string, estado1: string) {
    this.afs.collection('pedidos').doc(id).update({estado: estado1});
  }


  // CRUD TIPS

  guardarTip(tip: any) {
    // const sede1 =  sede.toLocaleLowerCase();
    const promesa =  new Promise<void>((resolve, reject) => {
      this.afs.collection('tips').add(tip);
      resolve();
    });
    return promesa;
  }

  ObtenerListaTips() {
    this.productoCollection = this.afs.collection('tips'
    , ref => ref.orderBy('fecha', 'desc').limit(10));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  EliminarTip(id: string) {
    this.productoDoc = this.afs.doc<ProductoInterface>(`tips/${id}`);
    this.productoDoc.delete();
  }

  // DESCUENTOS
  ObtenerListaProductosDescuento(sede: string, categoria: string, subCategoria: string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos' , ref => ref.where('categoria', '==', categoria).where('subCategoria', '==', subCategoria));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  actualizarDescuentoProducto(id: string, sede: string, descuento1: number) {
    this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('productos').doc(id)
    .update({descuento: descuento1});
  }

  guardarDescuento(productos: any[], descuento1: number, categoria1: string, sede1: string): void {
    const data = {
      listaIds: productos,
      descuento: descuento1,
      categoria: categoria1,
      sede: sede1
    };
    this.afs.collection('descuentos').add(data);
  }

  ObtenerListaDescuentos(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('descuentos' , ref => ref.where('sede', '==', sede));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  EliminarDescuento(idDescuento: string) {
    this.productoDoc = this.afs.doc<ProductoInterface>(`descuentos/${idDescuento}`);
    this.productoDoc.delete();
  }

  // Actualizar url de foto del producto

  ObtenerListaProductosTodos(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos');
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  actualizarUrlFoto(sede: string, id: string, url: string) {
    const promesa = new Promise<void>((resolve, reject) => {
      this.afs.collection('sedes').doc(sede).collection('productos').doc(id).update({img: url}).then(() => {
        resolve();
      });
    });
    return promesa;
  }


  // Lista de servicios

  ObtenerListaServicios(tipo: string, subCategoria: string) {
    if (subCategoria) {
      this.productoCollection = this.afs.collection('servicios'
      , ref => ref.where('categoria', '==', tipo).where('subCategoria', '==', subCategoria));
      return this.productos = this.productoCollection.snapshotChanges()
        .pipe(map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as ProductoInterface;
            data.id = action.payload.doc.id;
            return data;
          });
        }));
    } else {
      this.productoCollection = this.afs.collection('servicios'
      , ref => ref.where('categoria', '==', tipo));
      return this.productos = this.productoCollection.snapshotChanges()
        .pipe(map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as ProductoInterface;
            data.id = action.payload.doc.id;
            return data;
          });
        }));
    }
  }


  // Guardar Nuevo USURARIO / VENDEDOR
  guardarUsuario(newUser: AdmiInterface) {
    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('Roles').doc(newUser.correo).set(newUser);
      resolve();
    });

    return promesa;
  }


  actualizarUsuario(idUser: string, newUser: AdmiInterface) {
    // console.log( idUser, newUser);

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('Roles').doc(idUser).update(newUser);
      resolve();
    });

    return promesa;
  }


  ObtenerUsuario(dni: string) {

    this.usuariosCollection = this.afs.collection('usuarios', ref => ref.where('dni', '==', dni ));

    return this.usuarios = this.usuariosCollection.snapshotChanges()
    .pipe(map(
      changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as AdmiInterface;
          data.id = action.payload.doc.id;
          return data;
          });
        }
    ));

  }


  ObtenerListaDeUsuarios() {

    this.usuariosCollection = this.afs.collection('Roles');

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as AdmiInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }


  // Guardar Nuevo CLIENTE
  // TODO -  Refactorizar en los lugares donde se usa
  guardarCliente(newCliente: ClienteInterface) {

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('clientes').add(newCliente);
      resolve();
    });

    return promesa;
  }


  actualizarCliente(idCliente: string, newCliente: ClienteInterface) {
    // console.log( idCliente, newCliente);

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.doc(idCliente).update(newCliente);
      resolve();
    });

    return promesa;
  }

  // NOTE - Esta función es identica a la que se encuentro más arriba ObtenerListaClientes
  // TODO - Refactorizar

  ObtenerListaDeClientes() {
    this.clientesCollection = this.afs.collection('clientes');
    return this.clientes = this.clientesCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as ClienteInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }

  ObtenerListaDeproductos() {
    this.productoCollection = this.afs.collection('sedes').doc('andahuaylas').collection('productos');
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as ClienteInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }



  // Guardar Nuevo Proveedor

  guardarProveedor(newProveedor: ProveedorInterface) {

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('proveedores').add(newProveedor);
      resolve();
    });

    return promesa;
  }


  actualizarProveedor(idProveedor: string, newProveedor: ProveedorInterface) {
    // console.log( idProveedor, newProveedor);

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('proveedores').doc(idProveedor).update(newProveedor);
      resolve();
    });

    return promesa;
  }


  ObtenerListaDeProveedores() {

    this.proveedoresCollection = this.afs.collection('proveedores');

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

  EliminarProveedor(idProveedor: string) {
    this.productoDoc = this.afs.doc<ProductoInterface>(`proveedores/${idProveedor}`);
    this.productoDoc.delete();
  }

  // chelin
  ObtenerListaDeUsuariosSede(sede: string) {

    this.usuariosCollection = this.afs.collection('Roles', ref => ref.where('sede', '==', sede ));

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as AdmiInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }
  guardarCajaChica(newcajaChica) {
    // const celular = newUsuario.celular;
    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('CajaChica').add(newcajaChica); // .get().set(newcajaChina) //si es  que quieres asignar una id
      resolve();
    });
    return promesa;
    // this.afs.collection<ProductoInterface>(categoria).add(newProducto);
  }
  ObtenerListaCajaChica(sede: string) {

    this.usuariosCollection = this.afs.collection('CajaChica', ref => ref.where('sede', '==', sede ).orderBy('FechaApertura', 'desc') );

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as AdmiInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));
  }
  CerrarCajaChica(id: string, dato: any){
    const saldoFin = dato.saldoFinal;
    const FechaCier = dato.FechaCierre;

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('CajaChica').doc(id).update({
        saldoFinal: saldoFin,
        FechaCierre: FechaCier,
        estado: 'Cerrado'
      });
      resolve();
    });

    return promesa;
  }
  EliminarCajaChica(idCaja: string) {
    const promesa =  new Promise<void>( (resolve, reject) => {
      this.productoDoc = this.afs.doc<ProductoInterface>(`CajaChica/${idCaja}`);
      this.productoDoc.delete();
      resolve();
    });

    return promesa;
  }
  EditarCajaChica(id: string, dato: any){
    const montoInicial = dato.saldoInicial;
    const vendedor = dato.nombreVendedor;
    const dni = dato.dniVendedor;
    const promesa =  new Promise<void>( (resolve, reject) => {
        this.afs.collection('CajaChica').doc(id).update({
          saldoInicial: montoInicial,
          nombreVendedor: vendedor,
          dniVendedor: dni
        });
        resolve();
      });
    return promesa;
  }
  VerificarCajaChicaVendedor(estadoCaja: string, dni: string) {
    console.log('obteniedno caja de: ', dni, ' con el estado ABIERTO: ', estadoCaja);
    // tslint:disable-next-line:max-line-length
    return this.afs.collection('CajaChica').ref.where('estado', '==', estadoCaja).where( 'dniVendedor', '==', dni).limit(1).get();
  }
  ObtenerReporteVentaGeneralDia(sede: string, dia: string) {
    console.log('service dia', dia);
    return this.afs.collection('sedes').doc(sede).collection('ventas').doc(dia).collection('ventasDia').ref.get();
  }
  ObtenerReporteVentaDiaVendedor(sede: string, dia: string, dniVendedor: string) {
    // console.log('service dia', dia);
    // tslint:disable-next-line:max-line-length
    return this.afs.collection('sedes').doc(sede).collection('ventas').doc(dia).collection('ventasDia').ref.where('vendedor.dni', '==', dniVendedor).get();
  }
  ObtenerDetallesProdVentas(sede: string, id: string) {
    console.log('id', id);
    const datos = this.afs.collection('sedes').doc(sede).collection('productosVenta').doc(id);
    return datos.snapshotChanges().pipe(map(action => {
      if (action.payload.exists === false) {
        return null;
      } else {
        const data = action.payload.data();
        return data;
      }
    }));
  }


  // ObtenerProductos por categoria
  ObtenerProductosCategoria(sede: string, subCategoria: string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos' , ref => ref.where('subCategoria', '==', subCategoria).orderBy('fechaRegistro', 'desc'));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.productos = this.productoCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }

  // ELIMINAR UN USUARIO

  EliminarUsuario(id: string) {
    const promesa =  new Promise<void>( (resolve, reject) => {
      this.administradorDoc = this.afs.doc<ProductoInterface>(`Roles/${id}`);
      this.administradorDoc.delete().then(() => {
      resolve();
      });
    });
    return promesa;
  }

  // COMPRAS
  // TODO: OBTENER LISTA DE COMPRAS
  ObtenerListaCompras(sede: string) {
    // const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.comprasCollection = this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('compras' , ref => ref.orderBy('fechaRegistro', 'desc').limit(10));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.clientes = this.comprasCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as CompraInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }


  // TODO: GUARDAR COMPRA
  guardarCompra(newCompra: CompraInterface, sede: string) {

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('compras').add(newCompra);
      resolve(resolve);
    });

    return promesa;
  }

  actualizarCompra(idCompra: string, datosCompra: CompraInterface, sede: string) {
    // console.log( idProveedor, newProveedor);

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('compras').doc(idCompra).update(datosCompra);
      resolve();
    });

    return promesa;
  }

  toggleAnularCompra(idCompra: string, esAnulado: boolean, sede: string) {
    // console.log( idProveedor, newProveedor);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('compras').doc(idCompra).update({anulado: !esAnulado});
      resolve(resolve);
    });
    return promesa;
  }

  ActualizarProductoStock(sede: string, productId: string, stock: number){
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede).collection('productos').doc(productId).update({cantStock: stock});
      resolve(resolve);
    });

    return promesa;
  }


/* -------------------------------------------------------------------------- */
/*                              consultas para datos de api                   */
/* -------------------------------------------------------------------------- */
  async guardarDatosEmpresa(empresa: EmpresaInterface) {
    await this.obtenerEmpresa().subscribe(data => {
      this.datosEmpresa = data;
    });

    if (this.datosEmpresa.length){
      // Actualizar empresa
      const id = this.datosEmpresa[0].id;
      const promesa =  new Promise( (resolve) => {
        this.afs.collection('empresa').doc(id).update(empresa);
        // tslint:disable-next-line: no-unused-expression
        resolve;
      });

      return promesa;
    } else{
      // agregar empresa
      const promesa =  new Promise( (resolve, reject) => {
        this.afs.collection('empresa').add(empresa);
        // tslint:disable-next-line: no-unused-expression
        resolve;
      });
      return promesa;
    }
  }

  obtenerEmpresa(){

    const empresa = this.afs.collection('empresa');

    return empresa.snapshotChanges()
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

  guardarCDR(venta: VentaInterface, sede: string, cdrVenta: CDRInterface){
    console.log('guuuuuuuuuuuuuuuardadr cdr');
    // const idFecha = venta.fechaEmision.getDay() + '-' + venta.fechaEmision.getMonth() + '-' + venta.fechaEmision.getFullYear();
    console.log('ffffffffffffffffffffffffffffff',  venta.fechaEmision);
    const fecha: any = venta.fechaEmision;
    const fechaFormateada = new Date(moment.unix(fecha.seconds).format('D MMM YYYY H:mm'));
    const fechaString = formatDate(fechaFormateada, 'dd-MM-yyyy', 'en');

    console.log('ffffffffeeeeeeeeeecha', fechaString, cdrVenta);

    const promesa =  new Promise<void>( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fechaString)
      .collection('ventasDia').doc(venta.idVenta).update({cdr: cdrVenta});
      resolve();
    });

    return promesa;
  }


/* -------------------------------------------------------------------------- */


  // PUNTO DE VENTA

  confirmarVenta(venta: VentaInterface, sede: string) {
    console.log(venta);
    const data = {
      productos: venta.listaItemsDeVenta
    };

    const id = formatDate(new Date(), 'dd-MM-yyyy', 'en');
    const promesa = new Promise( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('productosVenta').add(data).then( guardado => {
        const dataVenta = {
          idListaProductos: guardado.id,
          cliente: venta.cliente,
          vendedor: venta.vendedor,
          totalPagarVenta: venta.totalPagarVenta,
          tipoComprobante: venta.tipoComprobante,
          serieComprobante: venta.serieComprobante,
          numeroComprobante: venta.numeroComprobante,
          fechaEmision: new Date(),
          bolsa: venta.bolsa,
          tipoPago: venta.tipoPago,
        };
        // tslint:disable-next-line:max-line-length
        this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(id).collection('ventasDia').add(dataVenta).then(ventas => {
          resolve(ventas.id);
        });
      });
    });
    return promesa;
  }



  obtenerProductosDeVenta(idProductoVenta: string, sede: string){
    console.log('PPPPPPPPPPPPPPPPPPPPPRODUCTOvENTA', idProductoVenta);
    this.itemDeventaDoc = this.afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('productosVenta').doc(idProductoVenta); // , ref => ref.where('id', '==', idProductoVenta));

    return  this.itemDeventaDoc.snapshotChanges()
      .pipe(map(
        action => {
          if (action.payload.exists === false) {
            return null;
          } else {
            const data = action.payload.data();
            return data;
          }
          // return changes.map(action => {
          //   const data = action.payload.doc.data() as ItemDeVentaInterface;
          //   // data.id = action.payload.doc.id;
          //   console.log('yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy', data);
          //   return data;
          //   });
          }
      ));
  }


  // ESTADO DE CAJA CHICA

  EstadoCajaChicaVendedor(estadoCaja: string, dni: string) {
    console.log('obteniedno caja de: ', dni, ' con el estado ABIERTO: ', estadoCaja);
    // tslint:disable-next-line:max-line-length
    const consulta = this.afs.collection('CajaChica', ref => ref.where('estado', '==', estadoCaja).where( 'dniVendedor', '==', dni).limit(1));
    return consulta.snapshotChanges().pipe(map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as CompraInterface;
        data.id = action.payload.doc.id;
        return data;
      });
    }));
  }

  // CORRELCION DE COMPROBANTE

  obtenerCorrelacion(serie: string, sede: string) {
    // tslint:disable-next-line:max-line-length
    const consulta = this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('serie', ref => ref.where('serie', '==', serie).limit(1));
    return consulta.snapshotChanges().pipe(map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as CompraInterface;
        data.id = action.payload.doc.id;
        return data;
      });
    }));
  }

  // ACTUALIZAR CORRELACION

  ActualizarCorrelacion(id: string, sede: string, correlacion1: number){
    console.log('ACTUALIZA CORRELACIN ' + correlacion1);
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('serie').doc(id).update({correlacion: correlacion1});
      resolve(resolve);
    });

    return promesa;
  }

}

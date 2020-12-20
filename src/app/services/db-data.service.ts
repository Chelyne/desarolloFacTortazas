import { Injectable } from '@angular/core';
import { AngularFirestoreCollection, AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProductoInterface } from '../models/ProductoInterface';
import { AdmiInterface } from '../models/AdmiInterface';
import { UsuarioInterface } from '../models/usuario';
import { ClienteInterface } from '../models/cliente-interface';
import { ProveedorInterface } from '../models/proveedor';
import { UsuarioInterfce } from '../models/User';
import { CompraInterface } from '../models/Compra';

@Injectable({
  providedIn: 'root'
})
export class DbDataService {

  private productoCollection: AngularFirestoreCollection<ProductoInterface>;
  private productos: Observable<ProductoInterface[]>;

  private productoDoc: AngularFirestoreDocument<ProductoInterface>;
  private producto: Observable<ProductoInterface>;

  private clienteCollection: AngularFirestoreCollection<AdmiInterface>;
  private clientes: Observable<AdmiInterface[]>;

  private clientesCollection: AngularFirestoreCollection<ClienteInterface>;
  // private clientes: Observable<ClienteInterface[]>;

  private administradorDoc: AngularFirestoreDocument<AdmiInterface>;
  private administrador: Observable<AdmiInterface>;

  private usuariosCollection: AngularFirestoreCollection<UsuarioInterface>;
  private usuarios: Observable<UsuarioInterface[]>;

  private usuarioDoc: AngularFirestoreDocument<UsuarioInterface>;
  private usuario: Observable<UsuarioInterface>;

  private proveedoresCollection: AngularFirestoreCollection<ProveedorInterface>;
  private proveedores: Observable<ProveedorInterface[]>;


  constructor(private afs: AngularFirestore) { }

  guardarProducto(newProducto: ProductoInterface, sede: string): void {
    const sede1 =  sede.toLocaleLowerCase();
    this.afs.collection('sedes').doc(sede1).collection('productos').add(newProducto);
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
          precio: data.precio,
          cantStock: data.cantStock,
          descripcionProducto: data.descripcionProducto
          // tallas: data.tallas
        });
      } else {
        this.productoDoc.update({
          nombre: data.nombre,
          cantidad: data.cantidad,
          medida: data.medida,
          precio: data.precio,
          cantStock: data.cantStock,
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

  ObtenerListaProductosByName(sede: string, nombre:string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos' , ref => ref.orderBy('nombre').startAt(nombre).endAt(nombre+"\uf8ff").limit(10));
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

  ObtenerListaProductosSinCat(sede: string) {
    const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.productoCollection = this.afs.collection('sedes').doc(sede1).collection('productos', ref => ref.orderBy('fechaTimeRegistro', 'desc').limit(10));
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
    const promesa =  new Promise((resolve, reject) => {
      this.afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ofertas').add(oferta);
      resolve(resolve);
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
    const promesa = new Promise((resolve, reject) => {
      this.afs.collection('sedes').doc(data.sede.toLocaleLowerCase()).collection('ofertas').doc(id).update(datos);
      resolve(resolve);
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
    const promesa =  new Promise((resolve, reject) => {
      this.afs.collection('tips').add(tip);
      resolve(resolve);
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
    const promesa = new Promise((resolve, reject) => {
      this.afs.collection('sedes').doc(sede).collection('productos').doc(id).update({img: url}).then(() => {
        resolve(resolve);
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
  guardarUsuario(newUser: UsuarioInterface) {
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').add(newUser);
      resolve(resolve);
    });

    return promesa;
  }


  actualizarUsuario(idUser: string, newUser: UsuarioInterface) {
    // console.log( idUser, newUser);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('usuarios').doc(idUser).update(newUser);
      resolve(resolve);
    });

    return promesa;
  }


  ObtenerUsuario(dni: string) {

    this.usuariosCollection = this.afs.collection('usuarios', ref => ref.where('dni', '==', dni ));

    return this.usuarios = this.usuariosCollection.snapshotChanges()
    .pipe(map(
      changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as UsuarioInterface;
          data.id = action.payload.doc.id;
          return data;
          });
        }
    ));

  }


  ObtenerListaDeUsuarios() {

    this.usuariosCollection = this.afs.collection('usuarios');

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as UsuarioInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }


  // Guardar Nuevo CLIENTE
  // TODO -  Refactorizar en los lugares donde se usa
  guardarCliente(newCliente: ClienteInterface) {

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('clientes').add(newCliente);
      resolve(resolve);
    });

    return promesa;
  }


  actualizarCliente(idCliente: string, newCliente: ClienteInterface) {
    // console.log( idCliente, newCliente);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('clientes').doc(idCliente).update(newCliente);
      resolve(resolve);
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

    this.clientesCollection = this.afs.collection('sedes').doc('andahuaylas').collection('productos');

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



  // Guardar Nuevo Proveedor

  guardarProveedor(newProveedor: ProveedorInterface) {

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('proveedores').add(newProveedor);
      resolve(resolve);
    });

    return promesa;
  }


  actualizarProveedor(idProveedor: string, newProveedor: ProveedorInterface) {
    // console.log( idProveedor, newProveedor);

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('proveedores').doc(idProveedor).update(newProveedor);
      resolve(resolve);
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
  // chelin
  ObtenerListaDeUsuariosSede(sede: string) {

    this.usuariosCollection = this.afs.collection('usuarios', ref => ref.where('sede', '==', sede ));

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as UsuarioInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

  }
  guardarCajaChica(newcajaChica) {
    // const celular = newUsuario.celular;
    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('CajaChica').add(newcajaChica); // .get().set(newcajaChina) //si es  que quieres asignar una id
      resolve(resolve);
    });
    return promesa;
    // this.afs.collection<ProductoInterface>(categoria).add(newProducto);
  }
  ObtenerListaCajaChica(sede: string) {

    this.usuariosCollection = this.afs.collection('CajaChica', ref => ref.where('sede', '==', sede ).orderBy('FechaApertura', 'asc') );

    return this.usuarios = this.usuariosCollection.snapshotChanges()
      .pipe(map(
        changes => {
          return changes.map(action => {
            const data = action.payload.doc.data() as UsuarioInterface;
            data.id = action.payload.doc.id;
            return data;
            });
          }
      ));

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



  private comprasCollection: AngularFirestoreCollection<ProductoInterface>;
  private compras: Observable<ProductoInterface[]>;

  private compraDoc: AngularFirestoreDocument<ProductoInterface>;
  private compra: Observable<ProductoInterface>;

  //COMPRAS
  //TODO: OBTENER LISTA DE COMPRAS
  ObtenerListaCompras() {
    // const sede1 = sede.toLocaleLowerCase();
    // tslint:disable-next-line:max-line-length
    this.comprasCollection = this.afs.collection('compras' , ref => ref.orderBy('fechaRegistro', 'desc').limit(10));
    // tslint:disable-next-line:max-line-length
    // this.productoCollection = this.afs.collection<ProductoInterface>('frutas', ref => ref.where('propietario', '==', propietario).orderBy('fechaRegistro', 'desc'));
    return this.clientes = this.comprasCollection.snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as ProductoInterface;
          data.id = action.payload.doc.id;
          return data;
        });
      }));
  }


  //TODO: GUARDAR COMPRA
  guardarCompra(newCompra: CompraInterface) {

    const promesa =  new Promise( (resolve, reject) => {
      this.afs.collection('compras').add(newCompra);
      resolve(resolve);
    });

    return promesa;
  }

}

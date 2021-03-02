import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, ToastController, PopoverController, ModalController } from '@ionic/angular';
import { CategoriasService } from '../../services/categorias.service';
import { PaginationProductosService } from '../../services/pagination-productos.service';
import { Subscription } from 'rxjs';

import { VentaInterface } from 'src/app/models/venta/venta';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { ProductoInterface } from 'src/app/models/ProductoInterface';
import { DbDataService } from '../../services/db-data.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { StorageService } from '../../services/storage.service';
import { PoppoverClientesComponent } from '../../components/poppover-clientes/poppover-clientes.component';

import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
import { VentasCongeladasPage } from '../../modals/ventas-congeladas/ventas-congeladas.page';
import { isNullOrUndefined } from 'util';
import { ClienteInterface } from '../../models/cliente-interface';
import { AgregarEditarClientePage } from '../../modals/agregar-editar-cliente/agregar-editar-cliente.page';
import { ModalAgregarProductoPage } from '../../modals/modal-agregar-producto/modal-agregar-producto.page';
import { ModalVentasPage } from '../../modals/modal-ventas/modal-ventas.page';
import { IngresoEgresoPage } from '../../modals/ingreso-egreso/ingreso-egreso.page';
import { BuscadorService } from 'src/app/services/buscador.service';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.page.html',
  styleUrls: ['./punto-venta.page.scss'],
})
export class PuntoVentaPage implements OnInit {
  sede = this.storage.datosAdmi.sede;

  @ViewChild('search', {static: false}) search: any;
  productos: ProductoInterface[];
  buscando: boolean;

  sinResultados: string;

  numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.'];
  categorias;
  listaProductos = [];
  categoria: string;
  categoriaP;

  listaVenta = [];
  private suscripcionProducto: Subscription;

  sinDatos;
  sinCategorias;

  cliente;

  buscarNombre = true;

  // ADD NUEOV CLIENTE
  modalEvento: string;
  modalTitle: string;
  modalTag: string;
  modalDataCliente: ClienteInterface;



  // Ventas
    listaDeVentas: VentaInterface[] = [];

    venta: VentaInterface;

    importeTotalPagar: number;


  // ObjetoVentas o ItemsDeVenta
    // listaItemsDeVenta:ItemDeVentaInterface[] = [];
    listaItemsDeVenta: ItemDeVentaInterface[] = [];



  // Productos
    listaDeProductos: ProductoInterface[];
    productoItem: ProductoInterface;

    cajaChica = false;

    // MODAL INGRESOS EGRESOS

    saldo = 0;
    modalButtonTag: string;
    modalSaldo: number;

  constructor(private menuCtrl: MenuController,
              private categoriasService: CategoriasService,
              private pagination: PaginationProductosService,
              private dataApi: DbDataService,
              private afs: AngularFirestore,
              private storage: StorageService,
              private toastController: ToastController,
              private popoverController: PopoverController,
              private confirmarVentaServ: ConfirmarVentaService,
              private rutaActiva: ActivatedRoute,
              private modalController: ModalController,
              private router: Router,
              private modalCtlr: ModalController,
              private buscadorService: BuscadorService
  ) {
    this.menuCtrl.enable(true);

    this.rutaActiva.queryParams.subscribe(params => {
      this.categoriaP = 'petshop';
    });
  }

  ngOnInit() {
    this.dataApi.ObtenerListaCategorias(this.sede).subscribe(categorias => {
      if (categorias.length > 0) {
        this.categorias = categorias;
        console.log('CATS: ', this.categorias);
        this.sinCategorias = false;
      } else {
        this.sinCategorias = true;
      }
    });
    // this.categorias = this.categoriasService.getcategoriasNegocio('petshop'); //categorias estaticos
    this.sinDatos = false;

    if (!isNullOrUndefined(this.storage.listaVenta)) {
      this.listaDeVentas = this.storage.listaVenta;
    }
    console.log('sede', this.sede);
    console.log('categoria', this.categoriaP);
  }

  ionViewWillEnter() {
    if (this.confirmarVentaServ.getEsCancelado()){
      this.listaItemsDeVenta = [];
      this.confirmarVentaServ.setVenta({});
      this.confirmarVentaServ.setEsCancelado(false);
      this.calcularTotalaPagar();
      this.cliente = '';
    }

  }

  ionViewDidEnter() {
    this.dataApi.EstadoCajaChicaVendedor('Aperturado', this.storage.datosAdmi.dni).subscribe(data => {
      if (data.length > 0) {
        this.cajaChica = true;
      } else {
        this.cajaChica = false;
      }
    });
  }

  // agregar producto
  agregarProducto() {
    this.abrirModalNuevoProducto();
  }

  async abrirModalNuevoProducto(){

    const modal =  await this.modalCtlr.create({
      component: ModalAgregarProductoPage,
      cssClass: 'modal-fullscreen',
      componentProps: {
        sede: this.sede,
        categoria: this.categoriaP,
      }
    });

    await modal.present();
  }


  listaProductosCategoria(categoria: string) {
    this.sinDatos = null;
    if (this.categoria !== categoria) {
      console.log('de cero');
      this.listaProductos = [];
    }
    this.categoria = categoria;
    // const propietario = this.storage.datosNegocio.correo;
    if (document.getElementById(this.categoria)) {
      document.getElementById(this.categoria).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });

    }
    this.dataApi.ObtenerProductosCategoria(this.sede, categoria).subscribe(datos => {
      if (datos.length > 0) {
        this.listaProductos =  datos;
        this.sinDatos = false;

      } else {
        console.log('NO HAY PRODUCTOS');
        this.sinDatos = true;
      }
    });
    // this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, null).subscribe( data => {
    //   if (data !== null) {
    //     this.listaProductos.push(...data);
    //     this.sinDatos = false;
    //   } else {
    //     this.sinDatos = true;
    //   }
    // });
  }

  loadData(event) {
    // const propietario = this.storage.datosNegocio.correo;
    setTimeout(() => {
      const sede1 = 'andahuaylas';
      this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, 'normal').subscribe( data => {
        if (data !== null) {
          this.listaProductos.push(...data);
          event.target.complete();
          // this.sinDatos = false;
        } else {
          // this.sinDatos = true;
          event.target.disabled = true;
        }
      });
    }, 500);
  }


  // addListaVenta(data) {
  //   this.listaVenta.push(data);
  // }

  //

  AgregarItemDeVenta(prodItem: ProductoInterface){

    let producExist = false;
    const idProdItem: string = prodItem.id;

    if (this.listaItemsDeVenta.length > 0) {
      for (const item of this.listaItemsDeVenta) {
        if (idProdItem === item.idProducto){
            producExist = true;
            item.cantidad += 1;
            item.totalxprod = item.cantidad * item.producto.precio;
            break;
        }
      }
    }

    if (!producExist){
      this.listaItemsDeVenta.unshift( this.CrearItemDeVenta(prodItem));
    }

    this.calcularTotalaPagar();
  }

  CrearItemDeVenta(prodItem: ProductoInterface): ItemDeVentaInterface{
    return {
      producto: prodItem,
      idProducto: prodItem.id,
      cantidad: 1,
      montoNeto: prodItem.precio,
      descuentoProducto: 0,
      porcentajeDescuento: 0,
      totalxprod: prodItem.precio // ya que descuento es 0;
    };
  }

  inputModificado(
    evento: {id: string, cantidad: number, porcentaje: number, descuento: number,
    montoNeto: number, totalxprod: number}
  ){
    console.log(evento);
    this.ActualizarMonto(evento.id, evento.cantidad,
    evento.porcentaje, evento.descuento, evento.montoNeto, evento.totalxprod);
  }

  ActualizarMonto(
    idProdItem: string, cantidad: number, porcentaje: number, descuento: number,
    montoNeto: number, totalxprod: number
  ){
    if (this.listaItemsDeVenta.length > 0) {
      for (const itemDeVenta of this.listaItemsDeVenta) {
        if (idProdItem === itemDeVenta.idProducto){
            itemDeVenta.cantidad = cantidad;
            itemDeVenta.descuentoProducto = descuento;
            itemDeVenta.porcentajeDescuento = porcentaje;
            itemDeVenta.montoNeto = montoNeto;
            itemDeVenta.totalxprod = totalxprod;
        }
      }
    }

    this.calcularTotalaPagar();
  }


  quitarProducto(evento: {id: string}){

    let index = 0;
    const idProdItem: string = evento.id;

    if (this.listaItemsDeVenta.length > 0) {

      for (const itemDeVenta of this.listaItemsDeVenta) {
        if (idProdItem === itemDeVenta.idProducto){
            console.log('quitar producto', index);
            this.listaItemsDeVenta.splice(index, 1);
            break;
        }
        index++;
      }
    }

    this.calcularTotalaPagar();
  }

  calcularTotalaPagar(){
    let totalxpagar = 0;

    for (const item of this.listaItemsDeVenta) {
      totalxpagar += item.totalxprod;
    }
    // console.log(totalxpagar);

    this.importeTotalPagar = totalxpagar;
  }

  // ......................................
  // nuevas funcionalidades

  AgregaraListaDeEspera(){
    // poner la venta en la lista de espera
    // anadir el array de itemsDeVenta a listaDeVentas
    if (this.cliente) {
      this.listaDeVentas.push(this.CrearItemDeVentas());
      this.listaItemsDeVenta = [];
      this.importeTotalPagar = 0;
      console.log(this.listaDeVentas);
      this.storage.congelarVenta(this.listaDeVentas).then(() => {
        this.presentToast('Se guardo la lista de venta', 'success');
      });
    } else {
      this.presentToast('Selecione un cliente', 'danger');
    }
  }

  CrearItemDeVentas(): VentaInterface{
    return {
      cliente: this.cliente,
      listaItemsDeVenta: this.listaItemsDeVenta,
      idVenta: this.CrearVentaId(),
      montoNeto: this.importeTotalPagar,
      // totalPagarVenta: this.importeTotalPagar // Descuento 0;
    };
  }

  // sacar de la lista de espera
  moverAListaPrincipal(venta: VentaInterface){

    this.listaItemsDeVenta = venta.listaItemsDeVenta;

    const idVenta = venta.idVenta;

    let index = 0;
    for (const ventaItem of this.listaDeVentas) {
      if (idVenta === ventaItem.idVenta) {
        // eliminar de lista de espera
        this.listaDeVentas.splice(index, 1);
        break;
      }
      index++;
    }

    this.calcularTotalaPagar();
  }

  QuitarListaDeVenta(){
    this.listaItemsDeVenta = [];
    this.importeTotalPagar = 0;
  }

  CrearVentaId(): string{
    const hoy = new Date();
    const hora = '' + hoy.getHours() + '' + hoy.getMinutes() + '' + hoy.getSeconds() + '' + hoy.getMilliseconds();
    return hora;
  }

  LimpiarListaDeVentas(){
    this.listaDeVentas = [];
  }

  irPagar(){
    if (this.cliente) {
      if (this.listaItemsDeVenta.length > 0) {
        if (this.cajaChica) {
          this.confirmarVentaServ.setVenta(this.CrearItemDeVentas());
          this.router.navigate(['/confirmar-venta']);
        } else {
          this.presentToast('Por favor aperture su caja chica para vender', 'danger');
        }
      } else {
        this.presentToast('Por favor agregue productos a vender', 'danger');
      }
    } else {
      this.presentToast('Por favor seleccione un cliente', 'danger');
    }
  }

  buscarCodigo() {

  }


   // implementacion de buscador ed productos
   Search(ev) {
    this.sinResultados = null;
    this.buscando = true;
    console.log(ev.detail.value);
    const key = ev.detail.value;
    console.log('dato a buscar', key);
    const lowercaseKey = key.toLowerCase();
    // const lowercaseKey = key; // esto es para buscar sin convertir en minuscula
    console.log('dato convertido en minuscula', key);
    // console.log(lowercaseKey);
    if ( lowercaseKey.length > 0) {
      // console.log('sede', this.sede);
      console.log('lowercase> 0', lowercaseKey);
      let contador = 0;
      for (let iterator of lowercaseKey) {
        console.log(iterator);
        iterator = parseInt(iterator, 10);
        if (isNaN(iterator)) {
          contador--;
        } else {
          contador++;
        }
        console.log('conbtador', contador);
        if (contador >= 1) {
          this.buscarNombre = false;
          break;
        } else {
          this.buscarNombre = true;
        }
      }
      // tslint:disable-next-line:max-line-length
      if (this.buscarNombre) {
        // BUSCA POR NOMBRE
        // tslint:disable-next-line:max-line-length
        this.afs.collection('sedes').doc(this.storage.datosAdmi.sede.toLowerCase()).collection('productos', res => res.orderBy('nombre').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')).snapshotChanges()
        .pipe(map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data();
            data.id = action.payload.doc.id;
            return data;
          });
        }
        )).subscribe(res => {
          if (res.length === 0 ) {
            console.log('no hay datos');
            this.productos = null;
            this.buscando = false;
            this.sinResultados = 'No se encontraron productos';
            this.presentToast(this.sinResultados, 'danger');
          } else {
            console.log(res );
            this.productos = res;
            this.buscando = false;
          }
        }, error => { console.log('error de subscribe'  + error); }
        );

        // BUSCA POR CODIGO PARA CONCATENAR
        // tslint:disable-next-line:max-line-length
        this.afs.collection('sedes').doc(this.storage.datosAdmi.sede.toLowerCase()).collection('productos', res => res.orderBy('codigoBarra').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')).snapshotChanges()
        .pipe(map(changes => {
          return changes.map(action => {
            const data = action.payload.doc.data();
            data.id = action.payload.doc.id;
            return data;
          });
        }
        )).subscribe(res => {
          if (res.length === 0 ) {
            console.log('no hay datos');
            if (isNullOrUndefined(this.productos)) {
              this.productos = null;
              this.buscando = false;
              this.sinResultados = 'No se encontraron productos';
              this.presentToast(this.sinResultados, 'danger');
            }
          } else {
            console.log(res );
            if (isNullOrUndefined(this.productos)) {
              this.productos = res;
            } else {
              this.productos.concat(res);
            }
            // this.productos = res;
            this.buscando = false;
            this.sinResultados = null;
          }
        }, error => { console.log('error de subscribe'  + error); }
        );
      } else {

        if (lowercaseKey.length > 10) {
          // tslint:disable-next-line:max-line-length
          this.afs.collection('sedes').doc(this.storage.datosAdmi.sede.toLowerCase()).collection('productos', res => res.orderBy('codigoBarra').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')).snapshotChanges()
          .pipe(map(changes => {
            return changes.map(action => {
              const data = action.payload.doc.data();
              data.id = action.payload.doc.id;
              return data;
            });
          }
          )).subscribe(res => {
            if (res.length === 0 ) {
              console.log('no hay datos');
              this.productos = null;
              this.buscando = false;
              this.sinResultados = 'No se encontraron productos';
              this.presentToast(this.sinResultados, 'danger');
            } else {
              console.log(res );
              this.productos = res;
              this.buscando = false;
            }
          }, error => { console.log('error de subscribe'  + error); }
          );
        } else {
          // tslint:disable-next-line:max-line-length
          this.afs.collection('sedes').doc(this.storage.datosAdmi.sede.toLowerCase()).collection('productos', res => res.orderBy('codigo').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')).snapshotChanges()
          .pipe(map(changes => {
            return changes.map(action => {
              const data = action.payload.doc.data();
              data.id = action.payload.doc.id;
              return data;
            });
          }
          )).subscribe(res => {
            if (res.length === 0 ) {
              console.log('no hay datos');
              this.productos = null;
              this.buscando = false;
              this.sinResultados = 'No se encontraron productos';
              this.presentToast(this.sinResultados, 'danger');
            } else {
              console.log(res );
              this.productos = res;
              this.buscando = false;
            }
          }, error => { console.log('error de subscribe'  + error); }
          );
        }

      }

     } else  {
      console.log('lowercase 0');
      this.productos = null;
      this.buscando = null;
     }
  }

  Search2(ev){
    this.buscando = true;

    const target = ev.detail.value;

    if (target.length) {
      this.buscadorService.Buscar(target).then( data => {
        if (data.length){
          this.productos = data;
        } else {
          this.productos = null;
          this.presentToast('No se encontro el producto', 'danger');
        }
        this.buscando = false;
      });
    } else {
      this.productos = null;
      this.buscando = null;
    }
  }

  // limpia el buscador
  limpiarBuscador() {
    this.buscando = null;
  }

  cambiarModoBusqueda() {
    this.buscarNombre = !this.buscarNombre;
    this.limpiarBuscador();
    this.productos = null;
    this.search.value = null;
    this.search.setFocus();
  }

   // FIN BUSCADOR DE PRODUCTOS


  async presentToast(mensaje: string, color1: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: color1
    });
    toast.present();
  }

  // busqueda de clientes
  async abrirPoppoverClientes(ev: any) {
    // let clientes;
    // this.dataApi.ObtenerListaDeClientes().subscribe(datos => {
    //   console.log(datos);
    //   if (datos.length > 0) {
    //     clientes = datos;
    //   }
    // });
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PoppoverClientesComponent,
      cssClass: 'poppoverCliente',
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        // listaClientes: clientes,
        seleccionado: this.cliente
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data && data.cliente) {
      this.cliente = data.cliente;
      // switch (data.cliente) {
      //   case 'Editar': this.presentModalEditar(); break;
      //   case 'Eliminar': this.presentAlertConfirmEliminar(); break;
      // }
    }
  }

  async modalCongelados() {
    const modal = await this.modalController.create({
      component: VentasCongeladasPage,
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const data = await modal.onWillDismiss();
    if (isNullOrUndefined(data.data)) {
      console.log(data.data);
    } else {
      console.log(data.data.dataVenta);
      this.moverAListaPrincipal(data.data.dataVenta);
      if (data.data.dataVenta.cliente) {
        this.cliente = data.data.dataVenta.cliente;
      }
      this.storage.congelarVenta(this.listaDeVentas).then(() => {
        console.log('todo ok');
      });
    }
  }

  // AGREGAR NUEVO CLIENTE
  AgregarNuevoCliente(){
    this.modalEvento = 'guardarCliente';
    this.modalTitle = 'Agregar Nuevo Cliente';
    this.modalTag = 'Guardar';
    this.abrirModal();
  }

  async abrirModal(){

    const modal =  await this.modalController.create({
      component: AgregarEditarClientePage,
      componentProps: {
        eventoInvoker: this.modalEvento,
        titleInvoker: this.modalTitle,
        tagInvoker: this.modalTag,
        dataInvoker: this.modalDataCliente

      }
    });
    await modal.present();
  }

  async modalVentas() {
    const modal = await this.modalController.create({
      component: ModalVentasPage,
      cssClass: 'modal-fullscreen'
    });
    return await modal.present();
  }

  // async modalIngresos(){
  //   const modal =  await this.modalController.create({
  //     component: AgregarEditarClientePage,
  //     componentProps: {
  //       eventoInvoker: this.modalEvento,
  //       titleInvoker: this.modalTitle,
  //       tagInvoker: this.modalTag,
  //       dataInvoker: this.modalDataCliente
  //     }
  //   });
  //   await modal.present();
  // }

  // buscador mas efectivo
  async busquedaGeneral(texto: string) {
    const nombres = texto.toLowerCase().split(' ');
    console.log('nombres', nombres, nombres[0]);
    this.productos = [];
    await this.buscarInicio(nombres[0]);
    await this.buscarcuerpo(nombres);
    console.log('lista', this.productos);
  }

  buscarInicio(texto: string) {
    // res.orderBy('codigoBarra').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')
    this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos', ref => ref
    // .where('nombre', 'array-contains-any', ['blanc'] )
    .orderBy('nombre').startAt(texto.toLowerCase()).endAt(texto.toLowerCase() + '\uf8ff').limit(25)
    ).snapshotChanges()
    .pipe(map(changes => {
      return changes.map((action: any) => {
        const data = action.payload.doc.data();
        data.id = action.payload.doc.id;
        console.log('data', data);
        return data;
      });
    })).subscribe(res => {
      console.log('inicio', res);
      for (const item of res) {
        this.productos.push(item);
      }
      console.log('lista de busquedas', this.productos);
    });
  }

  buscarcuerpo(arrayBuscar: any) {
    console.log('array a buscar', arrayBuscar);
    // res.orderBy('codigoBarra').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')
    this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos', ref => ref
    .where('arrayNombre', 'array-contains-any', arrayBuscar ).limit(25)
    // .orderBy('completo').startAt('blanc').endAt('blanc' + '\uf8ff').limit(5)
    ).snapshotChanges()
    .pipe(map(changes => {
      return changes.map((action: any) => {
        const data = action.payload.doc.data();
        data.id = action.payload.doc.id;
        // console.log('data', data);
        return data;
      });
    })).subscribe(res => {
      if (res.length === 0 ) { // no existe datos de parrafo
        if (this.productos.length === 0) {
          console.log('no hay datos');
          this.productos = null;
          this.buscando = false;
          this.sinResultados = 'No se encontró el producto';
          this.presentToast(this.sinResultados, 'danger');

        }else {
          this.buscando = false;
        }
      } else { // existe datos de parrafo
        // this.productos = res;
        let contador = 0;
        for (const item of res) {
          contador ++;
          if (!this.existeEnBusqueda(item)) {
          this.productos.push(item);
          }
          if (contador === res.length) {
            this.buscando = false;
          }
      }
      }

    });
  }


  existeEnBusqueda(producto: any) {
    for (const item of this.productos) {
      if (item.id === producto.id) {
        return true;
      }
    }
    return false;
  }

  // MODAL INGRESOS EGRESOS

  // TODO-Cambiar nombre
  execModalIngresoEgreso(accion: string){
    console.log(accion);
    if (accion === 'Ingreso') {
      this.modalEvento = 'Ingreso';
      this.modalTag = 'Monto a Ingresar';
      this.modalButtonTag = 'Ingresar monto';
      this.modalSaldo = this.saldo;

    } else if (accion === 'Egreso') {
      this.modalEvento = 'Egreso';
      this.modalTag = 'Monto a Retirar';
      this.modalButtonTag = 'Retirar monto';
      this.modalSaldo = this.saldo;

    } else{
      console.log('La funcion no es valida');
    }

    this.abrirModalIngresosEgresos();
  }

  async abrirModalIngresosEgresos(){

    const modal =  await this.modalCtlr.create({
      component: IngresoEgresoPage,
      componentProps: {
        eventoInvoker: this.modalEvento,
        buttonTagInvoer: this.modalButtonTag,
        tagInvoker: this.modalTag,
        saldoInvoker: this.modalSaldo
      }
    });

    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (data){
      console.log(data);
      this.saldo = data.newMonto;
    }

  }

}


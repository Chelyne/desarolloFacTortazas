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
// import { TestServiceService } from 'src/app/services/test-service.service';

import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
import { VentasCongeladasPage } from '../../modals/ventas-congeladas/ventas-congeladas.page';
import { isNullOrUndefined } from 'util';
import { ClienteInterface } from '../../models/cliente-interface';
import { AgregarEditarClientePage } from '../../modals/agregar-editar-cliente/agregar-editar-cliente.page';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.page.html',
  styleUrls: ['./punto-venta.page.scss'],
})
export class PuntoVentaPage implements OnInit {

  @ViewChild('search', {static: false}) search: any;
  productos: ProductoInterface[];
  buscando: boolean;

  sinResultados: string;

  numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.'];
  categorias = [];
  listaProductos = [];
  categoria: string;

  listaVenta = [];
  private suscripcionProducto: Subscription;

  sinDatos;

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

  constructor(private menuCtrl: MenuController,
              private categoriasService: CategoriasService,
              private pagination: PaginationProductosService,
              private dataApi: DbDataService,
              private afs: AngularFirestore,
              private storage: StorageService,
              private toastController: ToastController,
              private popoverController: PopoverController,
              private testServ: ConfirmarVentaService,
              private rutaActiva: ActivatedRoute,
              private modalController: ModalController,
              private router: Router,
  ) {
    this.menuCtrl.enable(true);
  }

  ngOnInit() {
    this.categorias = this.categoriasService.getcategoriasNegocio('petshop');
    this.sinDatos = false;

    if (this.rutaActiva.snapshot.params.cancelar === 'true') {
      this.listaItemsDeVenta = [];
    }

    if (!isNullOrUndefined(this.storage.listaVenta)) {
      this.listaDeVentas = this.storage.listaVenta;
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
  listaProductosCategoria(categoria: string) {
    this.sinDatos = null;
    if (this.categoria !== categoria) {
      console.log('de cero');
      this.listaProductos = [];
    }
    this.categoria = categoria;
    // const propietario = this.storage.datosNegocio.correo;
    const sede1 = 'andahuaylas';
    if (document.getElementById(this.categoria)) {
      document.getElementById(this.categoria).scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });

    }
    this.dataApi.ObtenerProductosCategoria(sede1, categoria).subscribe(datos => {
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
        // console.log('ssssssssssssssssss')
        if (idProdItem === itemDeVenta.idProducto){
            itemDeVenta.cantidad = cantidad;
            itemDeVenta.descuentoProducto = descuento;
            itemDeVenta.porcentajeDescuento = porcentaje;
            itemDeVenta.montoNeto = montoNeto;
            itemDeVenta.totalxprod = totalxprod;
            // itemDeVenta.totalxprod = cantidad * itemDeVenta.producto.precio; // - descuento;
            // itemDeVenta.precioVenta = precioVenta;



            // if (isNullOrUndefined(porcentaje)) {
            //   if (isNullOrUndefined(precioVenta)) {
            //     itemDeVenta.totalxprod = itemDeVenta.cantidad * itemDeVenta.producto.precio;
            //   } else {
            //     itemDeVenta.totalxprod = precioVenta;
            //   }
            //   break;

            // } else {
            //     itemDeVenta.totalxprod = itemDeVenta.cantidad * itemDeVenta.producto.precio;
            //     itemDeVenta.totalxprod = itemDeVenta.totalxprod - (itemDeVenta.totalxprod * (porcentaje / 100));
            //     break;
            // }

            // if (isNullOrUndefined(precioVenta)) {
            //   itemDeVenta.totalxprod = itemDeVenta.cantidad * itemDeVenta.producto.precio;
            // } else {
            //   itemDeVenta.totalxprod = precioVenta;
            // }
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
          this.testServ.setVenta(this.CrearItemDeVentas());
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
      } else {
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
      }
     } else  {
      console.log('lowercase 0');
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
}

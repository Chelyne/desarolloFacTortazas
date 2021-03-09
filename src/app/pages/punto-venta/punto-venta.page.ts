import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, PopoverController, ModalController } from '@ionic/angular';

import { VentaInterface } from 'src/app/models/venta/venta';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { ProductoInterface } from 'src/app/models/ProductoInterface';
import { StorageService } from '../../services/storage.service';
import { PoppoverClientesComponent } from '../../components/poppover-clientes/poppover-clientes.component';

import { Router } from '@angular/router';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
import { VentasCongeladasPage } from '../../modals/ventas-congeladas/ventas-congeladas.page';
import { isNullOrUndefined } from 'util';
import { ClienteInterface } from '../../models/cliente-interface';
import { AgregarEditarClientePage } from '../../modals/agregar-editar-cliente/agregar-editar-cliente.page';
import { ModalAgregarProductoPage } from '../../modals/modal-agregar-producto/modal-agregar-producto.page';
import { ModalVentasPage } from '../../modals/modal-ventas/modal-ventas.page';
import { IngresoEgresoPage } from '../../modals/ingreso-egreso/ingreso-egreso.page';
import { BuscadorService } from 'src/app/services/buscador.service';
import { GlobalService } from '../../global/global.service';
import { DataBaseService } from '../../services/data-base.service';
import { GENERAL_CONFIG } from '../../../config/apiPeruConfig';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.page.html',
  styleUrls: ['./punto-venta.page.scss'],
})
export class PuntoVentaPage implements OnInit {
  logo = GENERAL_CONFIG.datosEmpresa.logo;
  sede = this.storage.datosAdmi.sede;

  @ViewChild('search', {static: false}) search: any;
  productos: ProductoInterface[];
  buscando: boolean;

  sinResultados: string;

  categorias;
  listaProductos = [];
  categoria: string;

  listaVenta = [];

  sinDatos;
  sinCategorias;

  cliente;

  buscarNombre = true;

  // ADD NUEVO CLIENTE INGRESO EGRESO
  dataModal = {
    evento: '',
  };

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
              private dataApi: DataBaseService,
              public storage: StorageService,
              private popoverController: PopoverController,
              private confirmarVentaServ: ConfirmarVentaService,
              private modalController: ModalController,
              private router: Router,
              private modalCtlr: ModalController,
              private buscadorService: BuscadorService,
              private servGlobal: GlobalService
  ) {
    this.menuCtrl.enable(true);
  }

  ngOnInit() {
    this.dataApi.obtenerListaCategorias(this.sede).subscribe(categorias => {
      if (categorias.length > 0) {
        this.categorias = categorias;
        console.log('CATS: ', this.categorias);
        this.sinCategorias = false;
      } else {
        this.sinCategorias = true;
      }
    });
    this.sinDatos = false;

    if (!isNullOrUndefined(this.storage.listaVenta)) {
      this.listaDeVentas = this.storage.listaVenta;
    }
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
    this.dataApi.validarCajaChicaVendedor('Aperturado', this.storage.datosAdmi.dni).then(data => {
      console.log('CAJA, ', data);
      if (data) {
        this.cajaChica = true;
      } else {
        this.cajaChica = false;
      }
    });
  }

  // agregar producto
  async abrirModalNuevoProducto(){
    const modal =  await this.modalCtlr.create({
      component: ModalAgregarProductoPage,
      cssClass: 'modal-fullscreen'
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
      console.log(datos);
      if (datos.length > 0) {
        this.listaProductos =  datos;
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
      }
    });
  }

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
    this.servGlobal.presentToast('Agregado a lista de venta', {icon: 'cart-outline', duracion: 500, position: 'top'});
  }

  CrearItemDeVenta(prodItem: ProductoInterface): ItemDeVentaInterface{
    if (!prodItem.precio) {
      prodItem.precio = 0;
    }
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
        this.servGlobal.presentToast('Se guardo la lista de venta', {color: 'success'});
      });
    } else {
      this.servGlobal.presentToast('Selecione un cliente', {color: 'danger'});
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

  hayProductosVentaCero() {
    for (const item of this.listaItemsDeVenta) {
      if (item.totalxprod === 0) {
        return true;
      }
    }
    return false;
  }

  irPagar(){
    if (this.cliente) {
      if (this.listaItemsDeVenta.length > 0 && !this.hayProductosVentaCero()) {
        if (this.cajaChica) {
          this.confirmarVentaServ.setVenta(this.CrearItemDeVentas());
          this.router.navigate(['/confirmar-venta']);
        } else {
          this.servGlobal.presentToast('Por favor aperture su caja chica para vender', {color: 'danger'});
        }
      } else {
        this.servGlobal.presentToast('Por favor agregue productos a vender o verifique que no haya productos con precio S/. 0.00', {color: 'danger', duracion: 3000});
      }
    } else {
      this.servGlobal.presentToast('Por favor seleccione un cliente', {color: 'danger'});
    }
  }

  buscador(ev){
    this.buscando = true;

    const target = ev.detail.value;

    if (target.length) {
      this.buscadorService.Buscar(target).then( data => {
        if (data.length){
          this.productos = data;
        } else {
          this.productos = null;
          this.servGlobal.presentToast('No se encontro el producto', {color: 'danger'});
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

  focusLimpio(event) {
    this.limpiarBuscador();
    this.productos = null;
    this.search.value = null;
    this.search.setFocus();
  }

  cambiarModoBusqueda() {
    this.buscarNombre = !this.buscarNombre;
    this.limpiarBuscador();
    this.productos = null;
    this.search.value = null;
    this.search.setFocus();
  }

   // FIN BUSCADOR DE PRODUCTOS

  // busqueda de clientes
  async abrirPoppoverClientes(ev: any) {
    console.log(ev);
    const popover = await this.popoverController.create({
      component: PoppoverClientesComponent,
      cssClass: 'poppoverCliente',
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        seleccionado: this.cliente
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data && data.cliente) {
      this.cliente = data.cliente;
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
    this.dataModal.evento = 'agregar';
    this.abrirModal();
  }

  async abrirModal(){
    const modal =  await this.modalCtlr.create({
      component: AgregarEditarClientePage,
      componentProps: {
        dataModal: this.dataModal
      }
    });
    await modal.present();

    const {data} = await modal.onWillDismiss();
    console.log(data);
    if (data && data.data) {
      if (data.evento === 'agregar') {
        console.log('agregar', data.data);
        this.agregar(data.data);
      }
    }
  }

  agregar(cliente: ClienteInterface){
    this.dataApi.guardarCliente(cliente).then(() => {
      this.servGlobal.presentToast('Cliente guardado correctamente', {color: 'success'});
    }).catch(err => {
      this.servGlobal.presentToast('No se pudo guardar el cliente', {color: 'danger'});
    });
  }

  async modalVentas() {
    const modal = await this.modalController.create({
      component: ModalVentasPage,
      cssClass: 'modal-fullscreen'
    });
    return await modal.present();
  }

  // MODAL INGRESOS EGRESOS
  modalIngresoEgreso(accion: string){
    console.log(accion);
    if (accion === 'Ingreso') {
      this.dataModal.evento = 'ingreso';
    } else if (accion === 'Egreso') {
      this.dataModal.evento = 'egreso';
    } else{
      console.log('La funcion no es valida');
    }
    this.abrirModalIngresosEgresos();
  }

  async abrirModalIngresosEgresos(){
    const modal =  await this.modalCtlr.create({
      component: IngresoEgresoPage,
      componentProps: {
        dataModal: this.dataModal
      }
    });
    await modal.present();
  }
}


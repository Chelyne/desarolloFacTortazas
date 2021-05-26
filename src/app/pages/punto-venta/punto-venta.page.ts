import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuController, PopoverController, ModalController } from '@ionic/angular';

import { VentaInterface } from 'src/app/models/venta/venta';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { ProductoInterface, VariantesInterface } from 'src/app/models/ProductoInterface';
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
import { BuscadorService } from 'src/app/services/buscador.service';
import { GlobalService } from '../../global/global.service';
import { DataBaseService } from '../../services/data-base.service';
import { GENERAL_CONFIG } from '../../../config/generalConfig';
import { ModalIngresosEgresosPage } from '../../modals/modal-ingresos-egresos/modal-ingresos-egresos.page';
import { PopoverVariantesComponent } from '../../components/popover-variantes/popover-variantes.component';
import { CajaChicaInterface } from '../../models/CajaChica';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.page.html',
  styleUrls: ['./punto-venta.page.scss'],
})
export class PuntoVentaPage implements OnInit {
  logo = GENERAL_CONFIG.datosEmpresa.logo;
  sede = this.storage.datosAdmi.sede;

  @ViewChild('search', {static: false}) search: any;
  productos: ProductoInterface[] = null;
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

  categoriaObservador;
  datosCaja: CajaChicaInterface;

  constructor(
    private menuCtrl: MenuController,
    private dataApi: DataBaseService,
    public storage: StorageService,
    private popoverController: PopoverController,
    private confirmarVentaServ: ConfirmarVentaService,
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

    if (!isNullOrUndefined(this.storage.listaVenta)){
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
      if (data && data.length) {
        this.cajaChica = true;
        this.datosCaja = data[0];
      } else {
        this.cajaChica = false;
      }
    });
  }

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

    this.categoriaObservador = this.dataApi.ObtenerProductosCategoria(this.sede, categoria);
    this.categoriaObservador.subscribe(datos => {
      console.log(datos);
      if (datos.length > 0) {
        this.listaProductos =  datos;
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
      }
    });
  }

  async AgregarItemDeVenta(productoSelect: ProductoInterface){
    try {
      let varianteSelected: VariantesInterface;
      let idProdItem: string = productoSelect.id;

      if (productoSelect.variantes && productoSelect.variantes.length) {
        const data = await this.presentPopoverVariantes(productoSelect);
        if (data.variante){
          varianteSelected = data.variante;
          console.log('%c⧭', 'color: #bfffc8', varianteSelected);
          idProdItem = `${productoSelect.id}-${varianteSelected.medida}`;

          console.log('%c%s', 'color: #731d6d', idProdItem);
        } else {
          return;
        }
      } else {
        /** variante por defecto */
        varianteSelected = {
          medida: productoSelect.medida,
          factor: 1,
          precio: productoSelect.precio,
        };
      }

      let producExist = false;

      if (this.listaItemsDeVenta.length) {
        console.log('%c⧭', 'color: #997326', this.listaItemsDeVenta);
        for (const item of this.listaItemsDeVenta) {

          console.log('%c%s', 'color: #1d3f73', idProdItem, item.idProducto, Boolean(idProdItem === item.idProducto));
          if (idProdItem === item.idProducto){
              producExist = true;
              item.cantidad += 1;
              item.totalxprod = item.cantidad * varianteSelected.precio;
              break;
          }
        }
      }

      if (!producExist){
        const productoCreado = this.CrearItemDeVenta(productoSelect, varianteSelected);
        if (productoCreado){
          this.listaItemsDeVenta.unshift(productoCreado);
        }
      }

      this.calcularTotalaPagar();
      this.servGlobal.presentToast('Agregado a lista de venta', {icon: 'cart-outline', duracion: 500, position: 'top'});


    } catch (error) {
      console.log('%cOCURRIO UN ERROR', 'color:white;background-color:red' , error);
      this.servGlobal.presentToast(error, {color: 'danger'});
    }
  }

  async presentPopoverVariantes(productoSelect: ProductoInterface) {
    console.log('PRODUCTO DE VENTA CON VARIANTE', productoSelect);

    const popover = await this.popoverController.create({
      component: PopoverVariantesComponent,
      cssClass: 'popoverVariantes',
      componentProps: {
        producto: productoSelect
      },
      translucent: true
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    if (data) {
      return data; /** retorna data.variante */
    }
    return 'VARIANTE_NO_SELECT';
  }

  CrearItemDeVenta(itemProducto: ProductoInterface, variante: VariantesInterface): ItemDeVentaInterface{
    // if (!itemProducto.precio) {
    //   itemProducto.precio = 0;
    // }

    const TryToconvertNumber = (numero: any) => {
      if (typeof(numero) === 'number'){
        return numero;
      }
      const num = parseFloat(`${numero}`);
      return num;
    };

    variante.factor = TryToconvertNumber(variante.factor);
    if (isNaN(variante.factor)){
      throw String('El factor es una cadena, Edite el producto');
    }

    variante.precio = TryToconvertNumber(variante.precio);
    if (isNaN(variante.precio)){
      throw String('El precio es una cadena, Edite el producto');
    }

    const itemDeventa: ItemDeVentaInterface =  {
      producto: itemProducto,
      cantidad: 1,
      precio: variante.precio,
      factor: variante.factor,
      medida: variante.medida,
      montoNeto: variante.precio,
      descuentoProducto: 0,
      porcentajeDescuento: 0,
      totalxprod: variante.precio /** ya que descuento es */
    };

    if (itemProducto.variantes && itemProducto.variantes.length){
      // itemDeventa.idProducto = itemProducto.id;
      itemDeventa.idProducto = `${itemProducto.id}-${variante.medida}`;
    } else {
      itemDeventa.idProducto = `${itemProducto.id}`;
    }
    // itemDeventa.idProducto = `${itemProducto.id}-${variante.medida}`;


    console.log('%c⧭', 'color: #cc0088', itemDeventa);

    return itemDeventa;
  }

  inputModificado(
    evento: ItemDeVentaInterface
  ){
    const itemVentaActualizado: ItemDeVentaInterface = evento;

    if (this.listaItemsDeVenta.length > 0) {
      for (let itemDeVenta of this.listaItemsDeVenta) {
        if (itemVentaActualizado.idProducto === itemDeVenta.idProducto){
          itemDeVenta = itemVentaActualizado;
          break;
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
            // console.log('quitar producto', index);
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

  async AgregaraListaDeEspera(){
    // poner la venta en la lista de espera
    // anadir el array de itemsDeVenta a listaDeVentas
    if (this.cliente) {
      const loadController = await this.servGlobal.presentLoading('Guardando venta congelada...');
      await this.dataApi.guardarCongelarVenta(this.sede, this.CrearItemDeVentas()).then(res => {
        if (res) {
          this.servGlobal.presentToast('Se guardo la lista de venta', {color: 'success'});
        } else {
          this.servGlobal.presentToast('No se pudo guardar la venta', {color: 'danger'});
        }
      });
      loadController.dismiss();
      this.listaItemsDeVenta = [];
      this.importeTotalPagar = 0;

      // this.listaDeVentas.push(this.CrearItemDeVentas());
      // console.log(this.listaDeVentas);
      // this.storage.congelarVenta(this.listaDeVentas).then(() => {
      //   this.servGlobal.presentToast('Se guardo la lista de venta', {color: 'success'});
      // });
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
      idCajaChica: this.datosCaja.id,
      vendedor: {
        id: this.storage.datosAdmi.id
      }
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

  async buscador(ev){
    this.buscando = true;

    const target = ev.detail.value;

    if (target.length) {
      this.buscadorService.Buscar(target).then( data => {
        if (data.length){
          this.productos = data;

          /** si todo es buscado por codigo de barra agregar */
          if (this.productos){
            if (this.productos.length === 1 && this.buscadorService.isFullStringoOrNamber(target) === 'allNumber' && target.length >= 5 ){
              console.log('sssssssssssssssssssssssssssssssssssssssssssssssssssssss');
              this.AgregarItemDeVenta(this.productos[0]);
              this.focusLimpio();
            }
          }
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

  // agregarProductoAListaDeVenta(){
  //   if (this.productos){
  //     if (this.productos.length === 1 && this.buscadorService.isFullStringoOrNamber(target)){
  //       console.log('sssssssssssssssssssssssssssssssssssssssssssssssssssssss');
  //       this.AgregarItemDeVenta(this.productos[0]);
  //     }
  //   }
  // }

  // limpia el buscador
  limpiarBuscador() {
    this.buscando = null;
  }

  focusLimpio() {
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
    const modal = await this.modalCtlr.create({
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

    // const {data} = await modal.onWillDismiss();
    // console.log(data);
    // if (data && data.data) {
    //   if (data.evento === 'agregar') {
    //     console.log('agregar', data.data);
    //     this.agregar(data.data);
    //   }
    // }
  }

  // agregar(cliente: ClienteInterface){
  //   this.dataApi.guardarCliente(cliente).then(() => {
  //     this.servGlobal.presentToast('Cliente guardado correctamente', {color: 'success'});
  //   }).catch(err => {
  //     this.servGlobal.presentToast('No se pudo guardar el cliente', {color: 'danger'});
  //   });
  // }

  async modalVentas() {
    const modal = await this.modalCtlr.create({
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
      component: ModalIngresosEgresosPage,
      componentProps: {
        dataModal: this.dataModal
      }
    });
    return await modal.present();
  }
}


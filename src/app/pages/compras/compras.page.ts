import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, MenuController, ToastController } from '@ionic/angular';
import { AgregarProductoPage } from 'src/app/modals/agregar-producto/agregar-producto.page';
import { CompraInterface, ItemDeCompraInterface } from 'src/app/models/Compra';
import { ProductoInterface } from 'src/app/models/ProductoInterface';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { DbDataService } from 'src/app/services/db-data.service';
import { EditarCompraService } from 'src/app/services/editar-compra.service';
import { StorageService } from 'src/app/services/storage.service';
import { ListaDeProveedoresPage } from '../lista-de-proveedores/lista-de-proveedores.page';
import { ModalProveedoresPage } from '../../modals/modal-proveedores/modal-proveedores.page';
import { ModalProductoCompraPage } from '../../modals/modal-producto-compra/modal-producto-compra.page';
import { isNullOrUndefined } from 'util';

import { GlobalService } from '../../global/global.service';
import { BuscadorService } from 'src/app/services/buscador.service';


@Component({
  selector: 'app-compras',
  templateUrl: './compras.page.html',
  styleUrls: ['./compras.page.scss'],
})
export class ComprasPage implements OnInit {

  sede = this.storage.datosAdmi.sede;

  listaDeProductosObservada: ProductoInterface[] = [];
  listaDeProductos: ProductoInterface[] = [];


  productSelect: ProductoInterface = null;

  // Datos del buscador
    buscando = false;
    // sinResultados: string;

  provedorObtenido: ProveedorInterface = null;

  formItemDeCompras: FormGroup;

  formComprobante: FormGroup;

  // COMPRA
  ACTUALIZAR_COMPRA = false;
  compraAserActualizada: CompraInterface = {};

  compra: CompraInterface = {};
  listaItemsDeCompra: ItemDeCompraInterface[] = [];
  totalxCompra = 0;

  constructor(
    private dataApi: DbDataService,
    private storage: StorageService,
    private modalCtlr: ModalController,
    private menuCtrl: MenuController,
    private editCompra: EditarCompraService,
    private globalService: GlobalService,
    private buscadorService: BuscadorService
  ) {
    this.ObtenerProductos();
    this.formItemDeCompras = this.createFormCompras();
    this.formComprobante = this.createFormComprobante();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);

    this.ObtenerCompraFromService();

    if (Object.entries(this.compra).length !== 0){
      this.ACTUALIZAR_COMPRA = true;
      // this.formItemDeCompras = {};
      this.formComprobante = new FormGroup({
        tipoComp: new FormControl(this.compra.typoComprobante, [Validators.required]),
        serieComp: new FormControl(this.compra.serieComprobante, [Validators.required]),
        numeroComp: new FormControl(this.compra.numeroComprobante, [Validators.required]),
        fechaEmisionComp: new FormControl(this.compra.fechaDeEmision, [])
      });
      this.provedorObtenido = this.compra.proveedor;
      this.listaItemsDeCompra = this.compra.listaItemsDeCompra;
      this.calcularTotalaPagar();
    }

  }


  ObtenerCompraFromService(){
    this.compra = {...this.editCompra.getCompra()};
    // Utilizando el patron prototype
    this.compraAserActualizada = JSON.parse(JSON.stringify(this.editCompra.getCompra()));
    this.editCompra.setCompra({});
  }


  ObtenerProductos(){
    this.dataApi.ObtenerListaProductosSinCat(this.sede).subscribe(data => {
      this.listaDeProductosObservada = data;
      this.listaDeProductos = data;
    });
  }



  /* -------------------------------------------------------------------------- */
  /*                                 //Buscador                                 */
  /* -------------------------------------------------------------------------- */
  Search(ev){
    this.buscando = true;

    const target = ev.detail.value;

    if (target.length) {
      this.buscadorService.Buscar(target).then( data => this.listaDeProductos = data);
    } else  {
      this.listaDeProductos = this.listaDeProductosObservada;
    }
  }


  limpiarBuscador() {
    this.buscando = false;
  }
  /* -------------------------------------------------------------------------- */






  /* -------------------------------------------------------------------------- */
  /*                      formulario de item de compras                         */
  /* -------------------------------------------------------------------------- */



  createFormCompras(){
    return new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', []),
      cantidad: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      pu_compra: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuento: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  get nombre() { return this.formItemDeCompras.get('nombre'); }
  get descripcion() { return this.formItemDeCompras.get('descripcion'); }
  get pu_compra() { return this.formItemDeCompras.get('pu_compra'); }
  get cantidad() { return this.formItemDeCompras.get('cantidad'); }
  get descuento() { return this.formItemDeCompras.get('descuento'); }

  updateFormCompras(productSelect: ProductoInterface){
    return new FormGroup({
      nombre: new FormControl(productSelect.nombre, [Validators.required]),
      descripcion: new FormControl(productSelect.descripcionProducto ? productSelect.descripcionProducto : 'No hay descripcion', []),
      cantidad: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*$')]),
      pu_compra: new FormControl('', [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuento: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  editFormCompras(itemCompra: ItemDeCompraInterface){
    return new FormGroup({
      nombre: new FormControl(itemCompra.producto.nombre, [Validators.required]),
      descripcion: new FormControl(itemCompra.producto.descripcionProducto, []),
      cantidad: new FormControl(itemCompra.cantidad, [Validators.required, Validators.pattern('^[0-9]*$')]),
      pu_compra: new FormControl(itemCompra.pu_compra, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuento: new FormControl(itemCompra.descuento, [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }




  seleccionarProducto(productSelect: ProductoInterface){
    this.productSelect = productSelect;
    this.formItemDeCompras = this.updateFormCompras(productSelect);
  }


  AgregarItemAListaDeCompra(){

    const item: ItemDeCompraInterface = this.CrearItemDeCompra();
    this.listaItemsDeCompra.push(item);

    this.limpiarFormCompra();

    this.calcularTotalaPagar();
  }

  // TODO: debería ser: ver a espacio de editar compra
  EditarItemDeCompra(itemCompra: ItemDeCompraInterface){
    this.productSelect = itemCompra.producto;
    this.formItemDeCompras = this.editFormCompras(itemCompra);
    this.quitarProductoDeListaCompras(itemCompra.id);
  }


  EliminarItemDeCompra(idCompra: string){
    this.quitarProductoDeListaCompras(idCompra);
  }



  quitarProductoDeListaCompras(idItemCompra: string){

    let index = 0;

    if (this.listaItemsDeCompra.length) {

      for (const itemDeCompra of this.listaItemsDeCompra) {
        if (idItemCompra === itemDeCompra.id){
            console.log('quitar producto', index);
            this.listaItemsDeCompra.splice(index, 1);
            break;
        }
        index++;
      }
    }

    this.calcularTotalaPagar();
  }


  calcularTotalaPagar(){
    let totalxcompra = 0;

    for (const item of this.listaItemsDeCompra) {
      totalxcompra += item.totalCompraxProducto;
    }
    this.totalxCompra = totalxcompra;
  }

  CrearItemDeCompra(): ItemDeCompraInterface{

    const localPuCompra = parseFloat(this.formItemDeCompras.value.pu_compra);

    const localCantidad = parseInt(this.formItemDeCompras.value.cantidad, 10);
    let localDescuento = parseFloat(this.formItemDeCompras.value.descuento);

    if (isNaN(localDescuento)) {
      localDescuento = 0;
    }

    const itemDeCompra = {
      id: this.productSelect.id,
      producto: this.productSelect,
      pu_compra: localPuCompra,
      cantidad: localCantidad,
      descuento: localDescuento,
      totalCompraxProducto: localPuCompra * localCantidad - localDescuento
    };

    return itemDeCompra;
  }


  limpiarFormCompra() {
    this.productSelect = null;
    this.formItemDeCompras = this.createFormCompras();
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */


  /* -------------------------------------------------------------------------- */
  /*                                  proveedor                                 */
  /* -------------------------------------------------------------------------- */


  async modalProveedor(){
    const modal =  await this.modalCtlr.create({
      component: ModalProveedoresPage,
      componentProps: {
      }
    });
    await modal.present();
    const {data} = await modal.onDidDismiss();
    if (data){
      this.provedorObtenido = data.proveedor;
    }
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */


  /* -------------------------------------------------------------------------- */
  /*                               form comprobante                             */
  /* -------------------------------------------------------------------------- */

  createFormComprobante(){
    return new FormGroup({
      tipoComp: new FormControl('facElectronica', [Validators.required]),
      serieComp: new FormControl('', [Validators.required]),
      numeroComp: new FormControl('', [Validators.required]),
      fechaEmisionComp: new FormControl('', [])
    });
  }

  get tipoComp() { return this.formComprobante.get('tipoComp'); }
  get serieComp() { return this.formComprobante.get('serieComp'); }
  get numeroComp() { return this.formComprobante.get('numeroComp'); }
  get fechaEmisionComp() { return this.formComprobante.get('fechaEmisionComp'); }



  async generarCompra(){
    const compra = {
      proveedor: this.provedorObtenido,
      listaItemsDeCompra: this.listaItemsDeCompra,
      IGV_compra: 0,
      totalxCompra: this.totalxCompra,
      typoComprobante: this.formComprobante.value.tipoComp,
      serieComprobante: this.formComprobante.value.serieComp,
      numeroComprobante: this.formComprobante.value.numeroComp,
      fechaDeEmision: this.formComprobante.value.fechaEmisionComp,
      fechaRegistro: new Date()

    };

    /** actualizar Stock de productos */
    for (const itemCompra of compra.listaItemsDeCompra) {
      await this.dataApi.incrementarStockProducto(itemCompra.producto.id, this.sede, itemCompra.cantidad);
    }

    this.dataApi.guardarCompra(compra, this.sede).then(
      () => {
        this.limpiarListaDeCompras();

        /** Resetear formulario de comprobante */
        this.formComprobante = this.createFormComprobante();

        this.globalService.presentToast('Guardó la compra con exito.', {color: 'success', duracion: 20000, position: 'top'});
      }
    );

  }


  ActualizarCompra(){
    const compra = {
      proveedor: this.provedorObtenido,
      listaItemsDeCompra: this.listaItemsDeCompra,
      IGV_compra: 0,
      totalxCompra: this.totalxCompra,
      typoComprobante: this.formComprobante.value.tipoComp,
      serieComprobante: this.formComprobante.value.serieComp,
      numeroComprobante: this.formComprobante.value.numeroComp,
      fechaDeEmision: this.formComprobante.value.fechaEmisionComp,
      fechaRegistro: new Date()

    };

    // for (const itemCompra of compra.listaItemsDeCompra) {
    //   console.log(itemCompra);
    //   this.dataApi.incrementarStockProducto(itemCompra.producto.id, this.sede, itemCompra.cantidad);
    // }

    // this.actualizarStockItemsCompra(compra);
    this.ActualizarStockProductos2(compra);


    this.dataApi.actualizarCompra(this.compra.id, compra, this.sede).then(
      () => {
        console.log('Se ingreso Correctamente');
        // this.presentToast("Se ingreso correctamente");
        // this.clienteModalForm.reset()
        // this.modalCtlr.dismiss();
      }
    );

    // this.limpiarListaDeCompras();
    // this.formComprobante = this.createFormComprobante();
    // this.presentToast('Actualizó con exito la compra.');
    this.globalService.presentToast('Actualizó la compra con exito.', {color: 'success', duracion: 2000, position: 'top'});
    this.editCompra.setCompra({});
  }

  // CLEAN
  actualizarStockItemsCompra(compraActual: CompraInterface){
    console.log(compraActual.listaItemsDeCompra, this.compraAserActualizada.listaItemsDeCompra);
    // Verificar si ambos productos estas en ambas listas
    for (const itemCompra of compraActual.listaItemsDeCompra) {
      let itemCompraEstaEnAmbos = false;
      for (const itemAnterior of this.compraAserActualizada.listaItemsDeCompra) {
        if (itemCompra.producto.id === itemAnterior.producto.id){
          console.log('ME EJECUTE');
          const diferencia = itemCompra.cantidad - itemAnterior.cantidad;
          console.log('productos semejantes', diferencia);
          if (diferencia > 0){
            // incrementarDiferencia;
            this.dataApi.incrementarStockProducto(itemCompra.producto.id, this.sede, diferencia);
          } else if (diferencia < 0){
            // Decrementar diferencia
            this.dataApi.decrementarStockProducto(itemCompra.producto.id, this.sede, -diferencia);
          }
          itemCompraEstaEnAmbos = true;
          break;
        }
      }
      if (!itemCompraEstaEnAmbos){
        this.dataApi.incrementarStockProducto(itemCompra.producto.id, this.sede, itemCompra.cantidad);
      }
    }

    // Si un producto que esta en la lista anterio ya no se encuentra
    for (const itemAnterior of this.compraAserActualizada.listaItemsDeCompra) {
      let itemCompraEstaEnAmbos = false;
      for (const itemCompra of compraActual.listaItemsDeCompra) {
        if (itemCompra.producto.id === itemAnterior.producto.id){
          itemCompraEstaEnAmbos = true;
        }
      }

      if (!itemCompraEstaEnAmbos){
        this.dataApi.decrementarStockProducto(itemAnterior.producto.id, this.sede, itemAnterior.cantidad);
      }
    }
  }

  ActualizarStockProductos2(compraActual: CompraInterface){
    const interseccion: {id: string, cantidad: number}[] = [];
    const soloActual: {id: string, cantidad: number}[] = [];
    const soloAnterior: {id: string, cantidad: number}[] = [];

    for (const itemCompra of compraActual.listaItemsDeCompra) {
      let itemCompraEstaEnAmbos = false;
      for (const itemAnterior of this.compraAserActualizada.listaItemsDeCompra) {
        if (itemCompra.producto.id === itemAnterior.producto.id){
          interseccion.push({id: itemCompra.producto.id, cantidad: itemCompra.cantidad - itemAnterior.cantidad});
          itemCompraEstaEnAmbos = true;
          break;
        }
      }
      if (!itemCompraEstaEnAmbos){
        soloActual.push({id: itemCompra.producto.id, cantidad: itemCompra.cantidad});
      }
    }

    for (const itemAnterior of this.compraAserActualizada.listaItemsDeCompra) {
      let itemCompraEstaEnAmbos = false;

      for (const itemIntesec of interseccion) {
        if (itemIntesec.id === itemAnterior.producto.id){
          itemCompraEstaEnAmbos = true;
        }
      }

      if (!itemCompraEstaEnAmbos){
        soloAnterior.push({id: itemAnterior.producto.id, cantidad: -itemAnterior.cantidad});
      }
    }


    console.log(interseccion, soloAnterior, soloActual);

    const actulizarStock = (listaProductos: {id: string, cantidad: number}[]) => {
      for (const producto of listaProductos) {
        if (producto.cantidad > 0){
          this.dataApi.incrementarStockProducto(producto.id, this.sede, producto.cantidad);
        } else if (producto.cantidad < 0) {
          this.dataApi.decrementarStockProducto(producto.id, this.sede, -producto.cantidad);
        }
      }
    };

    actulizarStock(interseccion);
    actulizarStock(soloActual);
    actulizarStock(soloAnterior);
  }


  cancelarActulizarCompra(){
    this.editCompra.setCompra({});
  }


  /* -------------------------------------------------------------------------- */
  /*                           agregar nuevo producto                           */
  /* -------------------------------------------------------------------------- */

  AgregarNuevoProducto(){
    this.abrirModalNuevoProducto();
  }

  async abrirModalNuevoProducto(){

    const modal =  await this.modalCtlr.create({
      component: AgregarProductoPage
    });

    await modal.present();
  }



  /* -------------------------------------------------------------------------- */
  /*                                  cleaners                                  */
  /* -------------------------------------------------------------------------- */
  limpiarProductSelect(){
    this.productSelect = null;
  }

  limpiarListaDeCompras(){
    this.listaItemsDeCompra = [];
    this.calcularTotalaPagar();
  }

  // NOTE - ESTA FUNCION YA NO SE ESTA USANDO
  async agregarProductoCompra() {
    const modal = await this.modalCtlr.create({
      component: ModalProductoCompraPage,
      cssClass: 'my-custom-class'
    });
    await modal.present();

    const data = await modal.onWillDismiss();
    // tslint:disable-next-line: deprecation
    if (isNullOrUndefined(data.data)) {
    } else {
      console.log(data.data.data);
      this.listaItemsDeCompra.push(data.data.data);
      console.log(this.listaItemsDeCompra);
      this.calcularTotalaPagar();
    }
  }


  // CLEAN
  /* ------------------------------------------------------------------------------------ */
  /* Funciones utilizadas para testear  incrementar y decrementar Stock de producto       */
  /* ------------------------------------------------------------------------------------ */

  // async lecturaProd(){
  //   const idProducto = '01xo7jxVqGvd0AuLxGGL';
  //   const sede = 'andahuaylas';
  //   console.log('El producto', await this.dataApi.obtenerProductoById(idProducto, sede));
  // }

  // async addProd(){
  //   const idProducto = '01xo7jxVqGvd0AuLxGGL';
  //   const sede = 'andahuaylas';
  //   await this.dataApi.incrementarStockProducto(idProducto, sede, 5);
  // }

  // async substracProd(){
  //   const idProducto = '01xo7jxVqGvd0AuLxGGL';
  //   const sede = 'andahuaylas';
  //   await this.dataApi.decrementarStockProducto(idProducto, sede, 3);
  // }

  /* ------------------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------------------ */

}

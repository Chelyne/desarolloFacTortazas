import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, MenuController, LoadingController } from '@ionic/angular';
import { CompraInterface, ItemDeCompraInterface } from 'src/app/models/Compra';
import { ProductoInterface } from 'src/app/models/ProductoInterface';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { EditarCompraService } from 'src/app/services/editar-compra.service';
import { StorageService } from 'src/app/services/storage.service';
import { ModalProveedoresPage } from '../../modals/modal-proveedores/modal-proveedores.page';

import { GlobalService } from '../../global/global.service';
import { BuscadorService } from 'src/app/services/buscador.service';
import { DataBaseService } from 'src/app/services/data-base.service';
import { ModalAgregarProductoPage } from 'src/app/modals/modal-agregar-producto/modal-agregar-producto.page';
import { ModalEditarItemCompraPage } from 'src/app/modals/modal-editar-item-compra/modal-editar-item-compra.page';
import { EditarProductoPage } from 'src/app/modals/editar-producto/editar-producto.page';
import { AgregarEditarProveedorPage } from 'src/app/modals/agregar-editar-proveedor/agregar-editar-proveedor.page';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { GENERAL_CONFIG } from 'src/config/generalConfig';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.page.html',
  styleUrls: ['./compras.page.scss'],
})
export class ComprasPage implements OnInit {

  sede = this.storage.datosAdmi.sede;
  listaSedes = GENERAL_CONFIG.listaSedes;

  listaDeProductosObservada: ProductoInterface[] = [];
  listaDeProductos: ProductoInterface[] = [];

  productSelect: ProductoInterface = null;

  // Datos del buscador
  buscando = false;

  provedorObtenido: ProveedorInterface = null;

  formItemDeCompras: FormGroup;

  formComprobante: FormGroup;

  // COMPRA
  ACTUALIZAR_COMPRA = false;
  compraAserActualizada: CompraInterface = {};

  compra: CompraInterface = {};
  listaItemsDeCompra: ItemDeCompraInterface[] = [];
  totalxCompra = 0;
  loading;

  comprando = false;
  palabraBuscar: string;
  constructor(
    private dataApi: DataBaseService,
    private storage: StorageService,
    private modalCtlr: ModalController,
    private menuCtrl: MenuController,
    private editCompra: EditarCompraService,
    private globalService: GlobalService,
    private buscadorService: BuscadorService,
    private loadingController: LoadingController,
    private router: Router
  ) {
    this.obtenerProductos();
    this.formItemDeCompras = this.createFormCompras();
    this.formComprobante = this.createFormComprobante();
  }

  ngOnInit() {
    this.menuCtrl.enable(true);

    this.obtenerCompraFromService();

    if (Object.entries(this.compra).length !== 0){
      this.ACTUALIZAR_COMPRA = true;
      this.formComprobante = this.updateFormCombrobante();
      this.provedorObtenido = this.compra.proveedor;
      this.listaItemsDeCompra = this.compra.listaItemsDeCompra;
      this.calcularTotalaPagar();
    }

  }


  obtenerCompraFromService(){
    this.compra = {...this.editCompra.getCompra()};
    /** Utilizando el patron prototype */
    this.compraAserActualizada = JSON.parse(JSON.stringify(this.editCompra.getCompra()));
    this.editCompra.setCompra({});
  }


  obtenerProductos(){
    this.dataApi.obtenerListaProductos(this.sede).subscribe(data => {
      this.listaDeProductosObservada = data;
      this.listaDeProductos = data;
    });
  }



  /* -------------------------------------------------------------------------- */
  /*                                 Buscador                                   */
  /* -------------------------------------------------------------------------- */
  buscador(ev: any){
    this.buscando = true;

    const target = ev.detail.value;
    this.palabraBuscar =  target;

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

  get nombre() { return this.formItemDeCompras.get('nombre'); }
  get descripcion() { return this.formItemDeCompras.get('descripcion'); }
  get pu_compra() { return this.formItemDeCompras.get('pu_compra'); }
  get cantidad() { return this.formItemDeCompras.get('cantidad'); }
  get descuento() { return this.formItemDeCompras.get('descuento'); }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */


  /* -------------------------------------------------------------------------- */
  /*                               form comprobante                             */
  /* -------------------------------------------------------------------------- */

  createFormComprobante(){
    return new FormGroup({
      tipoComp: new FormControl('factura', [Validators.required]),
      serieComp: new FormControl('', [Validators.required]),
      numeroComp: new FormControl('', [Validators.required]),
      fechaEmisionComp: new FormControl('', [])
    });
  }

  updateFormCombrobante(){
    return new FormGroup({
      tipoComp: new FormControl(this.compra.typoComprobante, [Validators.required]),
      serieComp: new FormControl(this.compra.serieComprobante, [Validators.required]),
      numeroComp: new FormControl(this.compra.numeroComprobante, [Validators.required]),
      fechaEmisionComp: new FormControl(this.compra.fechaDeEmision, [])
    });
  }

  get tipoComp() { return this.formComprobante.get('tipoComp'); }
  get serieComp() { return this.formComprobante.get('serieComp'); }
  get numeroComp() { return this.formComprobante.get('numeroComp'); }
  get fechaEmisionComp() { return this.formComprobante.get('fechaEmisionComp'); }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */



  /**
   * @objetivo : Mueve el producto seleccionado al formItemDeCompras
   */
  seleccionarProducto(productSelect: ProductoInterface){
    this.productSelect = productSelect;
    this.formItemDeCompras = this.updateFormCompras(productSelect);
  }

  /**
   * @objetivo : Agrega el item_de_compra a la listaItemsDeCompra
   */
  agregarItemACompra(){

    const item: ItemDeCompraInterface = this.crearItemDeCompra();
    this.listaItemsDeCompra.push(item);

    this.limpiarFormCompra();

    this.calcularTotalaPagar();
  }

  /**
   * @objetivo : Mueve el producto de la ListaItemsDeCompra al formItemDeCompras
   */
  // CLEAN - ya no se usa
  editarItemDeCompra(itemCompra: ItemDeCompraInterface){
    this.productSelect = itemCompra.producto;
    this.formItemDeCompras = this.editFormCompras(itemCompra);
    this.eliminarItemDeCompra(itemCompra.id);
  }

  /**
   * @objetivo : Eliminar un item de ListaItemsDeCompra
   */
  eliminarItemDeCompra(idItemCompra: string){
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

  /**
   * @objetivo : Calcular Total a pagar por la compra
   */
  calcularTotalaPagar(){
    let totalxcompra = 0;

    for (const item of this.listaItemsDeCompra) {
      totalxcompra += item.totalCompraxProducto;
    }
    this.totalxCompra = totalxcompra;
  }

  crearItemDeCompra(): ItemDeCompraInterface{

    const puCompraEntrante = parseFloat(this.formItemDeCompras.value.pu_compra);

    const cantidadEntrante = parseInt(this.formItemDeCompras.value.cantidad, 10);
    let descuentoEntrante = parseFloat(this.formItemDeCompras.value.descuento);

    if (isNaN(descuentoEntrante)) {
      descuentoEntrante = 0;
    }

    const itemDeCompra = {
      id: this.productSelect.id,
      producto: this.productSelect,
      pu_compra: puCompraEntrante,
      cantidad: cantidadEntrante,
      descuento: descuentoEntrante,
      totalCompraxProducto: puCompraEntrante * cantidadEntrante - descuentoEntrante
    };

    return itemDeCompra;
  }


  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  // AGREGAR NUEVO ITEM A COMPRA

  async modalAgregarItemDeCompra(item: ProductoInterface){
    const itemDeCompra: ItemDeCompraInterface = {
      producto: item,
      descuento: 0,
      // cantidad: 0,
      id: item.id,
      // pu_compra: 0,
      totalCompraxProducto: 0
    };
    console.log('ADD ITEM', itemDeCompra);
    const modal =  await this.modalCtlr.create({
      component: ModalEditarItemCompraPage,
      // cssClass: 'modal-fullscreen',
      componentProps: {
        dataModal: {itemCompra: itemDeCompra}
      }
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (data){
      console.log(data);
      this.listaItemsDeCompra.push(data.itemCompraModicado);
      this.calcularTotalaPagar();
      this.globalService.presentToast('Producto agregado', {duracion: 500});
      // this.actualizarItemEnListaItemCompra(data.itemCompraModicado);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                         modal editar itemDeCompra                          */
  /* -------------------------------------------------------------------------- */

  async modalEditarItemDeCompra(itemDeCompra: ItemDeCompraInterface){
    console.log('ITEM DE COMPRA EN COMPRAS', itemDeCompra);
    const modal =  await this.modalCtlr.create({
      component: ModalEditarItemCompraPage,
      // cssClass: 'modal-fullscreen',
      componentProps: {
        dataModal: {itemCompra: itemDeCompra}
      }
    });
    await modal.present();

    const {data} = await modal.onDidDismiss();
    if (data){
      this.actualizarItemEnListaItemCompra(data.itemCompraModicado);
    }
  }

  async actualizarItemEnListaItemCompra(itemCompraModificado: ItemDeCompraInterface ){
    let index = 0;
    for (const itemDeCompra of this.listaItemsDeCompra) {
      if (itemDeCompra.id === itemCompraModificado.id){
        this.listaItemsDeCompra[index] = itemCompraModificado;
        break;
      }
      index++;
    }
    this.calcularTotalaPagar();
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: 10000
    });
    await this.loading.present();
  }

  /* -------------------------------------------------------------------------- */
  /*                               GUARDAR Y ACTUALIZAR COMPRA                  */
  /* -------------------------------------------------------------------------- */

  async generarCompra(){
    if (isNullOrUndefined(this.provedorObtenido)) {
      this.globalService.presentToast('Seleccione un proveedor', {color: 'danger'});
      return;
    }
    if (this.listaItemsDeCompra.length > 0) {
      this.comprando = true;
      await this.presentLoading('Generando compra...');
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
        for (const sede of this.listaSedes) {
          await this.dataApi.actualizarPrecioCompraProducto(itemCompra.producto.id, sede, itemCompra.pu_compra);
          await this.dataApi.actualizarPrecioVentaProducto(itemCompra.producto.id, sede, itemCompra.pu_venta);
        }
      }

      this.dataApi.guardarCompra(compra, this.sede).then((ventaId) => {
        if (ventaId){
          this.limpiarListaDeCompras();
          this.provedorObtenido = null;
          /** Resetear formulario de comprobante */
          this.formComprobante = this.createFormComprobante();
          this.globalService.presentToast('Se guardó la compra con éxito.', {color: 'success', position: 'top'});
          this.loading.dismiss();
          this.comprando = false;
        } else {
          this.globalService.presentToast('La compra no se guardó.', {color: 'danger', position: 'top'});
          this.loading.dismiss();
          this.comprando = false;
        }
      }).catch( err => {
        console.log(err);
        this.globalService.presentToast('La compra no se guardó.', {color: 'danger',  position: 'top'});
        this.loading.dismiss();
        this.comprando = false;
      });
    } else {
      this.globalService.presentToast('No tienes productos agregados', {color: 'danger'});
    }
  }

  async actualizarCompra() {
    if (isNullOrUndefined(this.provedorObtenido)) {
      this.globalService.presentToast('Seleccione un proveedor', {color: 'danger'});
      return;
    }
    if (this.listaItemsDeCompra.length > 0) {
      this.comprando = true;
      await this.presentLoading('Generando compra...');
      console.log('Actualizando', this.listaItemsDeCompra);
      const compra = {
        proveedor: this.provedorObtenido,
        listaItemsDeCompra: this.listaItemsDeCompra,
        IGV_compra: 0,
        totalxCompra: this.totalxCompra,
        typoComprobante: this.formComprobante.value.tipoComp,
        serieComprobante: this.formComprobante.value.serieComp,
        numeroComprobante: this.formComprobante.value.numeroComp,
        fechaDeEmision: this.formComprobante.value.fechaEmisionComp,
        // fechaRegistro: new Date()
      };
      this.actualizarStockProductos2(compra);
      this.dataApi.actualizarCompra(this.compra.id, compra, this.sede).then(() => {
        this.globalService.presentToast('Actualizó la compra con exito.', {color: 'success', duracion: 2000, position: 'top'});
        this.comprando = false;
        this.loading.dismiss();
        this.router.navigate(['/lista-de-compras']);
      }).catch( () => {
        this.globalService.presentToast('No se pudo actualizar la compra.', {color: 'danger', duracion: 2000, position: 'top'});
        this.comprando = false;
        this.loading.dismiss();
      });
    } else {
      this.globalService.presentToast('No tienes productos agregados', {color: 'danger'});
    }
  }

  actualizarStockItemsCompra(compraActual: CompraInterface){
    console.log(compraActual.listaItemsDeCompra, this.compraAserActualizada.listaItemsDeCompra);
    // Verificar si ambos productos estas en ambas listas
    for (const itemCompra of compraActual.listaItemsDeCompra) {
      let itemCompraEstaEnAmbos = false;
      for (const itemAnterior of this.compraAserActualizada.listaItemsDeCompra) {
        if (itemCompra.producto.id === itemAnterior.producto.id){
          const diferencia = itemCompra.cantidad - itemAnterior.cantidad;
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

  actualizarStockProductos2(compraActual: CompraInterface){
    const interseccion: {id: string, cantidad: number, pu_compra?: number, pu_venta?: number}[] = [];
    const soloActual: {id: string, cantidad: number, pu_compra?: number, pu_venta?: number}[] = [];
    const soloAnterior: {id: string, cantidad: number, pu_compra?: number, pu_venta?: number}[] = [];

    for (const itemCompra of compraActual.listaItemsDeCompra) {
      let itemCompraEstaEnAmbos = false;
      for (const itemAnterior of this.compraAserActualizada.listaItemsDeCompra) {
        if (itemCompra.producto.id === itemAnterior.producto.id){

          const format: any = {id: itemCompra.producto.id, cantidad: itemCompra.cantidad - itemAnterior.cantidad};
          if (itemCompra.producto.precioCompra !== itemAnterior.pu_compra){
            format.pu_compra = itemCompra.pu_compra;
          }
          if (itemCompra.producto.precio !== itemAnterior.pu_venta){
            format.pu_venta = itemCompra.pu_venta;
          }
          interseccion.push(format);
          itemCompraEstaEnAmbos = true;
          break;
        }
      }
      if (!itemCompraEstaEnAmbos){
        soloActual.push({id: itemCompra.producto.id, cantidad: itemCompra.cantidad, pu_compra: itemCompra.pu_compra, pu_venta: itemCompra.pu_venta});
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
        soloAnterior.push({id: itemAnterior.producto.id, cantidad: -itemAnterior.cantidad, pu_compra: itemAnterior.pu_compra, pu_venta: itemAnterior.pu_venta});
      }
    }


    console.log('LISTA FILTRADA', interseccion, soloAnterior, soloActual);
    console.log('LISTA INTERSECICION', interseccion);
    console.log('LISTA ANTERIOR', soloAnterior, );
    console.log('LISTA ACTUAL', soloActual);

    const actulizarStock = async (listaProductos: {id: string, cantidad: number, pu_compra?: number, pu_venta?: number}[]) => {
      for (const producto of listaProductos) {
        if (producto.cantidad > 0){
          await this.dataApi.incrementarStockProducto(producto.id, this.sede, producto.cantidad);
        } else if (producto.cantidad < 0) {
          await this.dataApi.decrementarStockProducto(producto.id, this.sede, -producto.cantidad);
        }

        for (const sede of this.listaSedes) {
          if (producto.pu_compra){
            await this.dataApi.actualizarPrecioCompraProducto(producto.id, sede, producto.pu_compra);
          }
          if (producto.pu_venta){
            await this.dataApi.actualizarPrecioVentaProducto(producto.id, sede, producto.pu_venta);
          }
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
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */


  /* -------------------------------------------------------------------------- */
  /*                                  proveedor                                 */
  /* -------------------------------------------------------------------------- */

  async modalProveedor(){
    const modal =  await this.modalCtlr.create({
      component: ModalProveedoresPage,
      componentProps: {}
    });

    await modal.present();
    const {data} = await modal.onDidDismiss();
    if (data){
      this.provedorObtenido = data.proveedor;
    }
  }

  async modalAgregarNuevoProveedor(){
    const modal = await this.modalCtlr.create({
      component: AgregarEditarProveedorPage,
      // cssClass: 'modal-fullscreen',
      componentProps: {
        dataModal: {
          evento: 'agregar'
        }
      }
    });
    await modal.present();
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */


  /* -------------------------------------------------------------------------- */
  /*                     PRODUCTOS: AGREGAR Y ACTUALIZAR                        */
  /* -------------------------------------------------------------------------- */

  async modalNuevoProducto(){

    const modal =  await this.modalCtlr.create({
      component: ModalAgregarProductoPage,
      cssClass: 'modal-fullscreen'
    });

    await modal.present();
  }

  async modalEditarProducto(producto: ProductoInterface) {
    const modal = await this.modalCtlr.create({
      component: EditarProductoPage,
      cssClass: 'modal-fullscreen',
      componentProps: {
        dataProducto: producto,
      }
    });
    await modal.present();

    const { data } =  await modal.onWillDismiss();
    console.log('BUSCAMOSSSS: ', data);
    if (data) {
      const ev = {
        detail: { value: this.palabraBuscar}
      }
      this.buscador(ev);
    }
    // if (data) {
    //   this.dataApi.actualizarProducto(data.producto).then(() => {
    //     this.globalService.presentToast('Producto se actualizó correctamente', {color: 'success'});
    //     const ev = {
    //       detail: { value: this.palabraBuscar}
    //     }
    //     this.buscador(ev);
    //     }).catch(() => {
    //     this.globalService.presentToast('Producto no se actualizó', {color: 'danger'});
    //   });
    // }
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */



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

  limpiarFormCompra() {
    this.productSelect = null;
    this.formItemDeCompras = this.createFormCompras();
  }
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */






}

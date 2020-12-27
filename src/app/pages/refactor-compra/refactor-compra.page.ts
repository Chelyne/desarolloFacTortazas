import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AgregarProductoPage } from 'src/app/modals/agregar-producto/agregar-producto.page';
import { CompraInterface, ItemDeCompraInterface } from 'src/app/models/Compra';
import { ProductoInterface } from 'src/app/models/ProductoInterface';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from 'src/app/services/storage.service';
import { ListaDeProveedoresPage } from '../lista-de-proveedores/lista-de-proveedores.page';

@Component({
  selector: 'app-refactor-compra',
  templateUrl: './refactor-compra.page.html',
  styleUrls: ['./refactor-compra.page.scss'],
})
export class RefactorCompraPage implements OnInit {

  sede = this.storage.datosAdmi.sede;
  listaDeProductos:ProductoInterface[] = [];

  productSelect:ProductoInterface = null;

  //Datos del buscador
    buscando: boolean=false;
    //sinResultados: string;

  provedorObtenido:ProveedorInterface=null;

  formItemDeCompras:FormGroup;

  formComprobante:FormGroup;

  //TODO - Subir a la parte superior
  //NOTE - parece no ser necesario
  //COMPRA
  compra:CompraInterface;
  listaItemsDeCompra:ItemDeCompraInterface[] = [];
  totalxCompra:number = 0;




  constructor(
    private dataApi: DbDataService,
    private storage: StorageService,
    private modalCtlr: ModalController
  ) {
    this.ObtenerProductos();
    this.formItemDeCompras = this.createFormCompras();
    this.formComprobante = this.createFormComprobante();
  }

  ngOnInit() {
  }


  ObtenerProductos(){
    this.dataApi.ObtenerListaProductosSinCat(this.sede,10).subscribe(data => {
      this.listaDeProductos = data;
      // console.log(data);
    });
  }



  /* -------------------------------------------------------------------------- */
  /*                                 //Buscador                                 */
  /* -------------------------------------------------------------------------- */
  Search(ev) {
    this.buscando = true;

    const key = ev.detail.value;
    const lowercaseKey = key.toLowerCase();

    if (lowercaseKey.length) {
      this.dataApi.ObtenerListaProductosByName(this.sede, lowercaseKey,10).subscribe(data => {
        this.listaDeProductos = data;
      });
    } else  {
      this.ObtenerProductos();
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
      cantidad: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
      pu_compra: new FormControl('',[Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuento: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  get nombre() { return this.formItemDeCompras.get('nombre'); }
  get descripcion() { return this.formItemDeCompras.get('descripcion'); }
  get pu_compra() { return this.formItemDeCompras.get('pu_compra'); }
  get cantidad() { return this.formItemDeCompras.get('cantidad'); }
  get descuento() { return this.formItemDeCompras.get('descuento'); }

  updateFormCompras(productSelect:ProductoInterface){
    return new FormGroup({
      nombre: new FormControl(productSelect.nombre, [Validators.required]),
      descripcion: new FormControl(productSelect.descripcionProducto, []),
      cantidad: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
      pu_compra: new FormControl('',[Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuento: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  editFormCompras(itemCompra:ItemDeCompraInterface){
    return new FormGroup({
      nombre: new FormControl(itemCompra.producto.nombre, [Validators.required]),
      descripcion: new FormControl(itemCompra.producto.descripcionProducto, []),
      cantidad: new FormControl(itemCompra.pu_compra, [Validators.required, Validators.pattern("^[0-9]*$")]),
      pu_compra: new FormControl(itemCompra.cantidad,[Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuento: new FormControl(itemCompra.descuento, [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }




  seleccionarProducto(productSelect:ProductoInterface){
    // console.log(productSelect);
    this.productSelect = productSelect;
    this.formItemDeCompras = this.updateFormCompras(productSelect);
  }



  AgregarAListaDeCompra(){

    //Agregar el item de compra
    // console.log('Agregar a lista de compra');
    let item:ItemDeCompraInterface = this.CrearItemDeCompra();
    // console.log('44444444444444444,', item)
    this.listaItemsDeCompra.push(item);
    // console.log(this.listaItemsDeCompra);
    this.limpiarFormCompra();
    this.calcularTotalaPagar();
  }


  EditarItemDeCompra(itemCompra:ItemDeCompraInterface){
    this.productSelect = itemCompra.producto;
    this.formItemDeCompras = this.editFormCompras(itemCompra);
    this.quitarProductoDeListaCompras(itemCompra.id);
  }


  EliminarItemDeCompra(idCompra:string){
    this.quitarProductoDeListaCompras(idCompra);
  }



  quitarProductoDeListaCompras(idItemCompra:string){

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

  CrearItemDeCompra():ItemDeCompraInterface{

    const local_pu_compra:number = parseFloat(this.formItemDeCompras.value.pu_compra);
    const local_cantidad:number = parseInt(this.formItemDeCompras.value.cantidad);
    let local_descuento:number = parseFloat(this.formItemDeCompras.value.descuento);
    if(isNaN(local_descuento)) local_descuento = 0;

    let itemDeCompra = {
      id: this.productSelect.id,
      producto: this.productSelect,
      PU_compra: local_pu_compra,
      cantidad: local_cantidad,
      descuento: local_descuento,
      totalCompraxProducto: local_pu_compra * local_cantidad - local_descuento
    }

    return itemDeCompra;
  }


  limpiarFormCompra() {
    this.productSelect = null;
    this.formItemDeCompras = this.createFormCompras();
  }


  /* -------------------------------------------------------------------------- */
  /*                                  proveedor                                 */
  /* -------------------------------------------------------------------------- */


  async abriModalProveedor(){

    const modal =  await this.modalCtlr.create({
      component: ListaDeProveedoresPage,
      componentProps: {
        esModal: true
      }
    });

    await modal.present()


    const {data} = await modal.onDidDismiss();
    if(data){
      this.provedorObtenido = data.proveedor;
    }
  }




  /* -------------------------------------------------------------------------- */
  /*                               form comprobante                             */
  /* -------------------------------------------------------------------------- */

  createFormComprobante(){
    return new FormGroup({
      tipoComp: new FormControl('facElectronica', [Validators.required]),
      serieComp: new FormControl('', [Validators.required]),
      numeroComp: new FormControl('',[Validators.required]),
      fechaEmisionComp: new FormControl('', [])
    });
  }

  get tipoComp() { return this.formComprobante.get('tipoComp'); }
  get serieComp() { return this.formComprobante.get('serieComp'); }
  get numeroComp() { return this.formComprobante.get('numeroComp'); }
  get fechaEmisionComp() { return this.formComprobante.get('fechaEmisionComp'); }



  generarCompra(){
    let compra = {
      proveedor: this.provedorObtenido,
      listaItemsDeCompra: this.listaItemsDeCompra,
      IGV_compra: 0,
      totalxCompra: this.totalxCompra,
      typoComprobante: this.formComprobante.value.tipoComp,
      serieComprobante: this.formComprobante.value.serieComp,
      numeroComprobante: this.formComprobante.value.numeroComp,
      fechaDeEmision: this.formComprobante.value.fechaEmisionComp,
      fechaRegistro: new Date()

    }

    this.dataApi.guardarCompra(compra).then(
      () => {
        console.log('Se ingreso Correctamente');
        // this.presentToast("Se ingreso correctamente");
        // this.clienteModalForm.reset()
        // this.modalCtlr.dismiss();
      }
    );

    this.limpiarListaDeCompras();
    this.formComprobante = this.createFormComprobante();

  }


  /* -------------------------------------------------------------------------- */
  /*                           agregar nuevo producto                           */
  /* -------------------------------------------------------------------------- */

  AgregarNuevoProducto(){
    this.abrirModalNuevoProducto();
  }

  async abrirModalNuevoProducto(){

    const modal =  await this.modalCtlr.create({
      component: AgregarProductoPage//,
      // componentProps: {
      //   eventoInvoker: this.modalEvento,
      //   titleInvoker: this.modalTitle,
      //   tagInvoker: this.modalTag,
      //   dataInvoker: this.modalDataCliente
      // }
    });

    await modal.present()
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

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';

@Component({
  selector: 'app-producto-venta',
  templateUrl: './producto-venta.component.html',
  styleUrls: ['./producto-venta.component.scss'],
})
export class ProductoVentaComponent implements OnInit {

  @Input() itemDeVenta: ItemDeVentaInterface;

  @Output()  cambiarPropiedadesProducto = new EventEmitter<{
    id: string,
    cantidad: number,
    porcentaje: number,
    descuento: number,
    montoNeto: number,
    totalxprod: number
  }>();
  @Output()  quitarItemDeVenta = new EventEmitter<{id: string}>();

  formVenta: FormGroup;

  constructor() {
    // this.formVenta = this.createFormVenta();
    // console.log("se creo el modulo venta");
  }

  ngOnInit() {
    // console.log(this.prod);
    // console.log(this.prod.idProducto);
    // console.log('cantidadEnVentaModule  ', this.prod.cantidad);
    this.formVenta = this.updateFormVenta();
    console.log(this.itemDeVenta);
  }


  createFormVenta() {
    return new FormGroup({
      cantidad: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')]),
      precioVenta: new FormControl('', [Validators.required]),
      porcentaje: new FormControl('', [Validators.required])
    });
  }

  updateFormVenta() {
    return new FormGroup({
      cantidad: new FormControl(this.itemDeVenta.cantidad, [Validators.required, Validators.pattern('[0-9]+')]),
      precioVenta: new FormControl(this.obtenerPrecioVenta(), [Validators.required]),
      porcentaje: new FormControl(this.itemDeVenta.porcentajeDescuento, [Validators.required])
    });
  }

  get cantidad() { return this.formVenta.get('cantidad'); }
  get precioVenta() { return this.formVenta.get('precioVenta'); }
  get porcentaje() { return this.formVenta.get('porcentaje'); }

  // ANCHOR - Refactorizar
  obtenerPrecioVenta(): number{
    // Obtiene el ImporteTotal por el producto
    if (this.itemDeVenta.montoNeto !== this.itemDeVenta.totalxprod){
      return this.itemDeVenta.totalxprod;
    }
    return this.itemDeVenta.montoNeto - this.itemDeVenta.descuentoProducto;
    return this.itemDeVenta.totalxprod;
    return 0;
  }

  // ANCHOR - Refactorizar
  obtenerPorcentajeVenta(): number{
    // Retorna el porcentja de descuento
    return this.itemDeVenta.porcentajeDescuento;
  }

  // ANCHOR - Refactorizar
  calcularMonotoDescuento(porcentaje: number){
    // calcula el descuento segun el porcentaje de venta
    // NOTE - monto neto no esta guardado en ninguna parte
    const montoNeto = parseInt(this.formVenta.value.cantidad, 10) * this.itemDeVenta.producto.precio;
    return  montoNeto * porcentaje / 100;
    return this.itemDeVenta.descuentoProducto;
  }
  // calcular(porcentaje: number){
  //   // calcula el descuento segun el porcentaje de venta
  //   // NOTE - monto neto no esta guardado en ninguna parte
  //   this.itemDeVenta.montoNeto = parseInt(this.formVenta.value.cantidad, 10) * this.itemDeVenta.producto.precio;
  //   return  montoNeto * porcentaje / 100;
  //   return this.itemDeVenta.descuentoProducto;
  // }

  calcularPorcentaje(numero: number, porcentaje:number){
    return numero * porcentaje / 100;
  }

  // hacerCalculos(){
  //   this.itemDeVenta.montoNeto = parseInt(this.formVenta.value.cantidad, 10) * this.itemDeVenta.producto.precio;
  //   this.itemDeVenta.porcentajeDescuento = this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0;
  //   console.log('sssssssssssssdddd', this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);
  //   this.itemDeVenta.descuentoProducto = this.calcularPorcentaje(this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);
  //   this.itemDeVenta.totalxprod = this.itemDeVenta.montoNeto - this.itemDeVenta.descuentoProducto;
  //   this.emitirCambioDePropiedades();
  // }

  cambioCantidad(){
    this.itemDeVenta.cantidad = this.formVenta.value.cantidad ? parseInt(this.formVenta.value.cantidad, 10) : 0;
    this.itemDeVenta.montoNeto = this.itemDeVenta.cantidad * this.itemDeVenta.producto.precio;
    // this.itemDeVenta.porcentajeDescuento = this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0;
    console.log('sssssssssssssdddd', this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);

    this.itemDeVenta.descuentoProducto = this.calcularPorcentaje(this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);
    this.itemDeVenta.totalxprod = this.itemDeVenta.montoNeto - this.itemDeVenta.descuentoProducto;
    console.log('itemDeVentaaaaaaaa', this.itemDeVenta);
    this.emitirCambioDePropiedades();
  }

  cambioPorcentaje(){
    // this.itemDeVenta.cantidad = this.formVenta.value.cantidad ? parseInt(this.formVenta.value.cantidad, 10) : 0;
    this.itemDeVenta.montoNeto = this.itemDeVenta.cantidad * this.itemDeVenta.producto.precio;
    this.itemDeVenta.porcentajeDescuento = this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0;
    console.log('sssssssssssssdddd', this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);

    this.itemDeVenta.descuentoProducto = this.calcularPorcentaje(this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);
    this.itemDeVenta.totalxprod = this.itemDeVenta.montoNeto - this.itemDeVenta.descuentoProducto;
    console.log('itemDeVentaaaaaaaa', this.itemDeVenta);
    this.emitirCambioDePropiedades();
  }

  cambioPrecio(){
    // this.itemDeVenta.cantidad = this.formVenta.value.cantidad ? parseInt(this.formVenta.value.cantidad, 10) : 0;
    this.itemDeVenta.montoNeto = this.itemDeVenta.cantidad * this.itemDeVenta.producto.precio;
    // this.itemDeVenta.porcentajeDescuento = this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0;
    console.log('sssssssssssssdddd', this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);
    this.itemDeVenta.porcentajeDescuento = 0.0;
    console.log('sssssssssssssdddd', this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);

    this.itemDeVenta.totalxprod = this.formVenta.value.precioVenta ? parseFloat(this.formVenta.value.precioVenta): this.itemDeVenta.montoNeto;
    this.itemDeVenta.descuentoProducto = this.itemDeVenta.montoNeto - this.itemDeVenta.totalxprod;
    console.log('cambioPrecio', this.itemDeVenta);
    this.emitirCambioDePropiedades();
  }

  emitirCambioDePropiedades(){
    this.cambiarPropiedadesProducto.emit({
      id: this.itemDeVenta.idProducto,
      cantidad: this.itemDeVenta.cantidad,
      porcentaje: this.itemDeVenta.porcentajeDescuento,
      descuento: this.itemDeVenta.descuentoProducto,
      montoNeto: this.itemDeVenta.montoNeto,
      totalxprod: this.itemDeVenta.totalxprod
    });
  }


  // // event Emitters
  // cambioCantidadd(){
  //   if (!this.cantidad.errors) {
  //     this.cambiarPropiedadesProducto.emit({
  //       id: this.itemDeVenta.idProducto,
  //       cantidad: parseInt(this.formVenta.value.cantidad, 10),
  //       // precioVenta: undefined, // TODO no enviar
  //       porcentaje: this.itemDeVenta.porcentajeDescuento,
  //       descuento: this.calcularMonotoDescuento(this.itemDeVenta.porcentajeDescuento)
  //     });
  //   } else {
  //     if (this.cantidad.errors.required){
  //       this.cambiarPropiedadesProducto.emit({
  //         id: this.itemDeVenta.idProducto,
  //         cantidad: 0,
  //         porcentaje: this.obtenerPorcentajeVenta(),
  //         descuento: 0
  //       });
  //     }
  //   }
  // }

  // cambioPorcentaje(){
  //   console.log('cambio porcentaje', parseInt(this.formVenta.value.porcentaje, 10));
  //   if (!this.porcentaje.errors) {
  //     this.cambiarPropiedadesProducto.emit({
  //       id: this.itemDeVenta.idProducto,
  //       cantidad: parseInt(this.formVenta.value.cantidad, 10),
  //       porcentaje: this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0,
  //       descuento: (this.itemDeVenta.cantidad * this.itemDeVenta.producto.precio) *
  //       (this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0) / 100

  //     });
  //   } else {
  //     if (this.porcentaje.errors.required){
  //       this.cambiarPropiedadesProducto.emit({
  //         id: this.itemDeVenta.idProducto,
  //         cantidad: this.itemDeVenta.cantidad,
  //         porcentaje: 0,
  //         descuento: 0
  //       });
  //     }
  //   }
  // }


  // cambioPrecio(){
  //   // console.log(this.formVenta.value.cantidad);
  //   // console.log('sdfsdfsdf', this.cantidad.errors);
  //   console.log('El precio cambio');
  //   if (!this.precioVenta.errors) {
  //     console.log('eL PRECIO DE VENTA NO TIENE ERRORES');
  //     this.calcularPorcentajeDescuento();
  //     this.cambiarCantidadProd.emit({
  //       id: this.itemDeVenta.idProducto,
  //       cantidad: this.itemDeVenta.cantidad,
  //       precioVenta:  this.formVenta.value.precioVenta ? parseFloat(this.formVenta.value.precioVenta) : 0,
  //       porcentaje: 0,
  //       descuento: this.itemDeVenta.descuentoProducto

  //     });
  //   } else {
  //     console.log('eL PRECIO DE VENTA TIENE ERRORES');
  //     if (this.precioVenta.errors.required){
  //       console.log('eMITIR CUANDO EL PRECIO DE VENTA TIENE ERRORES');

  //       this.cambiarCantidadProd.emit({
  //         id: this.itemDeVenta.idProducto,
  //         cantidad: this.itemDeVenta.cantidad,
  //         precioVenta: 0, // this.formVenta.value.precioVenta ? parseInt(this.formVenta.value.precioVenta, 10) : null,
  //         porcentaje: 0,
  //         descuento: 0
  //       });
  //     }
  //   }
  // }

  calcularPorcentajeDescuento(){
    let monto = this.formVenta.value.precioVenta ? parseInt(this.formVenta.value.precioVenta, 10) : 0;
    monto = this.itemDeVenta.totalxprod - monto;
    this.itemDeVenta.porcentajeDescuento = (100 * monto) / this.itemDeVenta.totalxprod;
    this.itemDeVenta.descuentoProducto = monto;
  }



  eventoEliminarItem(){
    this.quitarItemDeVenta.emit({
      id : this.itemDeVenta.idProducto,
    });
  }



}

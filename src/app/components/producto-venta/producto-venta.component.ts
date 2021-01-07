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

  @Output()  cambiarCantidadProd = new EventEmitter<{
    id: string,
    cantidad: number,
    precioVenta: number,
    porcentaje: number,
    descuento: number
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
      porcentaje: new FormControl(this.itemDeVenta.porcentaje ? this.itemDeVenta.porcentaje : 0, [Validators.required])
    });
  }

  get cantidad() { return this.formVenta.get('cantidad'); }
  get precioVenta() { return this.formVenta.get('precioVenta'); }
  get porcentaje() { return this.formVenta.get('porcentaje'); }

  obtenerPrecioVenta(): number{
    if (typeof this.itemDeVenta.precioVenta === 'undefined' || this.itemDeVenta.precioVenta < 0){
      console.log('El precio de vena no esta definido-------------------------------');
      if (typeof(this.itemDeVenta.descuentoProducto) === 'undefined'){
        return this.itemDeVenta.totalxprod;
      }
      return this.itemDeVenta.totalxprod - this.itemDeVenta.descuentoProducto;

    }
    console.log('El precio de venta esta definido------------------------------');

    return this.itemDeVenta.precioVenta;
  }

  obtenerPorcentajeVenta(): number{
    if (typeof this.itemDeVenta.porcentaje === 'undefined'){
      return 0;
    } else{
      return this.itemDeVenta.porcentaje;
    }
  }

  obtenerDescuentoVenta(){
    return parseInt(this.formVenta.value.cantidad, 10) * this.itemDeVenta.producto.precio * this.obtenerPorcentajeVenta() / 100;
  }



  // event Emitters
  cambioCantidad(){
    if (!this.cantidad.errors) {
      this.cambiarCantidadProd.emit({
        id: this.itemDeVenta.idProducto,
        cantidad: parseInt(this.formVenta.value.cantidad, 10),
        precioVenta: undefined, // TODO no enviar
        porcentaje: this.obtenerPorcentajeVenta(),
        descuento: parseInt(this.formVenta.value.cantidad, 10) * this.itemDeVenta.producto.precio * this.obtenerPorcentajeVenta() / 100
      });
    } else {
      if (this.cantidad.errors.required){
        this.cambiarCantidadProd.emit({
          id: this.itemDeVenta.idProducto,
          cantidad: 0,
          precioVenta: undefined, // TODO no enviar
          porcentaje: this.obtenerPorcentajeVenta(),
          descuento: 0
        });
      }
    }
  }

  cambioPorcentaje(){
    console.log('cambio porcentaje', parseInt(this.formVenta.value.porcentaje, 10));
    if (!this.porcentaje.errors) {
      this.cambiarCantidadProd.emit({
        id: this.itemDeVenta.idProducto,
        cantidad: this.itemDeVenta.cantidad,
        precioVenta: undefined, // this.formVenta.value.precioVenta ? parseInt(this.formVenta.value.precioVenta, 10) : null, // no se nvia
        porcentaje: this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0,
        descuento: (this.itemDeVenta.cantidad * this.itemDeVenta.producto.precio) *
        (this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0) / 100

      });
    } else {
      if (this.porcentaje.errors.required){
        this.cambiarCantidadProd.emit({
          id: this.itemDeVenta.idProducto,
          cantidad: this.itemDeVenta.cantidad,
          precioVenta: undefined, // this.formVenta.value.precioVenta ? parseInt(this.formVenta.value.precioVenta, 10) : null,
          porcentaje: 0,
          descuento: 0
        });
      }
    }
  }


  cambioPrecio(){
    // console.log(this.formVenta.value.cantidad);
    // console.log('sdfsdfsdf', this.cantidad.errors);
    console.log('El precio cambio');
    if (!this.precioVenta.errors) {
      console.log('eL PRECIO DE VENTA NO TIENE ERRORES');
      this.calcularPorcentajeDescuento();
      this.cambiarCantidadProd.emit({
        id: this.itemDeVenta.idProducto,
        cantidad: this.itemDeVenta.cantidad,
        precioVenta:  this.formVenta.value.precioVenta ? parseFloat(this.formVenta.value.precioVenta) : 0,
        porcentaje: 0,
        descuento: this.itemDeVenta.descuentoProducto

      });
    } else {
      console.log('eL PRECIO DE VENTA TIENE ERRORES');
      if (this.precioVenta.errors.required){
        console.log('eMITIR CUANDO EL PRECIO DE VENTA TIENE ERRORES');

        this.cambiarCantidadProd.emit({
          id: this.itemDeVenta.idProducto,
          cantidad: this.itemDeVenta.cantidad,
          precioVenta: 0, // this.formVenta.value.precioVenta ? parseInt(this.formVenta.value.precioVenta, 10) : null,
          porcentaje: 0,
          descuento: 0
        });
      }
    }
  }

  calcularPorcentajeDescuento(){
    let monto = this.formVenta.value.precioVenta ? parseInt(this.formVenta.value.precioVenta, 10) : 0;
    monto = this.itemDeVenta.totalxprod - monto;
    this.itemDeVenta.porcentaje = (100 * monto) / this.itemDeVenta.totalxprod;
    this.itemDeVenta.descuentoProducto = monto;
  }


  eventoEliminarItem(){
    this.quitarItemDeVenta.emit({
      id : this.itemDeVenta.idProducto,
    });
  }



}

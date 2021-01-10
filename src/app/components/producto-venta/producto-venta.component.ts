import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { fromEvent } from 'rxjs';
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
    this.formVenta = this.updateFormVenta();
    console.log(this.itemDeVenta);
  }

  confirugarcionDeObserbables(){
    const inpCantidad = document.getElementById('cantidadInp');
    fromEvent(inpCantidad, 'keyup')
    .subscribe( () => {
      this.cambioCantidad();
      console.log('desde el from event cantidad');
    });

    const inpPorcentaje = document.getElementById('porcentajeInp');
    fromEvent(inpPorcentaje, 'keyup')
    .subscribe( () => {
      this.cambioPorcentaje();
      console.log('desde el from event porcentaje');
    });

    const inpPrecio = document.getElementById('precioInp');
    fromEvent(inpPrecio, 'keyup')
    .subscribe( () => {
      this.cambioPrecio();
      console.log('desde el from event precio');
    });
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

  calcularPorcentaje(numero: number, porcentaje: number){
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
    this.itemDeVenta.descuentoProducto = this.calcularPorcentaje(this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);
    this.itemDeVenta.totalxprod = this.itemDeVenta.montoNeto - this.itemDeVenta.descuentoProducto;

    this.emitirCambioDePropiedades();
    // setTimeout( () =>  this.emitirCambioDePropiedades()
    // , 500);
    console.log('cambioCantidad', this.itemDeVenta);
  }

  cambioPorcentaje(){
    // this.itemDeVenta.cantidad = this.formVenta.value.cantidad ? parseInt(this.formVenta.value.cantidad, 10) : 0;
    this.itemDeVenta.montoNeto = this.itemDeVenta.cantidad * this.itemDeVenta.producto.precio;
    this.itemDeVenta.porcentajeDescuento = this.formVenta.value.porcentaje ? parseFloat(this.formVenta.value.porcentaje) : 0;

    this.itemDeVenta.descuentoProducto = this.calcularPorcentaje(this.itemDeVenta.montoNeto, this.itemDeVenta.porcentajeDescuento);
    this.itemDeVenta.totalxprod = this.itemDeVenta.montoNeto - this.itemDeVenta.descuentoProducto;

    this.emitirCambioDePropiedades();
    console.log('cambioPorcentaje', this.itemDeVenta);
  }

  cambioPrecio(){
    // this.itemDeVenta.cantidad = this.formVenta.value.cantidad ? parseInt(this.formVenta.value.cantidad, 10) : 0;
    this.itemDeVenta.montoNeto = this.itemDeVenta.cantidad * this.itemDeVenta.producto.precio;
    this.itemDeVenta.porcentajeDescuento = 0.0;

    // tslint:disable-next-line: max-line-length
    this.itemDeVenta.totalxprod = this.formVenta.value.precioVenta ? parseFloat(this.formVenta.value.precioVenta): this.itemDeVenta.montoNeto;
    this.itemDeVenta.descuentoProducto = this.itemDeVenta.montoNeto - this.itemDeVenta.totalxprod;

    this.emitirCambioDePropiedades();
    console.log('cambioPrecio', this.itemDeVenta);
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

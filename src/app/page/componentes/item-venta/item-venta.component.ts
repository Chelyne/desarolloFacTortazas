import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProductoInterface } from 'src/app/interfaces/producto';

import { ObjetoVenta } from 'src/app/interfaces/venta/objeto-venta';

@Component({
  selector: 'app-item-venta',
  templateUrl: './item-venta.component.html',
  styleUrls: ['./item-venta.component.scss'],
})
export class ItemVentaComponent implements OnInit {

  @Input() title: string;
  @Input() saludo: string;
  @Input() prod: ObjetoVenta;

  @Output()  cambiarCantidadProd = new EventEmitter<{id :string, cantidad: number}>();

  cambioCantidad(){

    console.log(this.formVenta.value.cantidad);
    if (this.formVenta.value.cantidad) {

      let obj = {
        id : this.prod.idProducto,
        cantidad: parseInt(this.formVenta.value.cantidad)
      }
      this.cambiarCantidadProd.emit(obj);
    }
  }

  formVenta : FormGroup;


  constructor() {
    this.formVenta = this.createFormVenta();
    console.log("se creo el modulo venta");
  }

  ngOnInit() {
    console.log(this.prod);
    console.log(this.prod.idProducto);
    console.log('cantidadEnVentaModule  ', this.prod.cantidad);
    this.formVenta = this.updateFormVenta();
  }

  createFormVenta() {
    return new FormGroup({
      cantidad: new FormControl('', [Validators.required])
    });
  }
  updateFormVenta() {
    return new FormGroup({
      cantidad: new FormControl(this.prod.cantidad, [Validators.required])
    });
  }

  putValor(algo){

  }

  get cantidad() { return this.formVenta.get('cantidad'); }

}

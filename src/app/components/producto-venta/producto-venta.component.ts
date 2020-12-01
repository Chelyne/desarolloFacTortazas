import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ItemDeVentaInterface } from 'src/app/interfaces/venta/objeto-venta';

@Component({
  selector: 'app-producto-venta',
  templateUrl: './producto-venta.component.html',
  styleUrls: ['./producto-venta.component.scss'],
})
export class ProductoVentaComponent implements OnInit {

  @Input() prod: ItemDeVentaInterface;

  @Output()  cambiarCantidadProd = new EventEmitter<{id :string, cantidad: number}>();
  @Output()  quitarItemDeVenta = new EventEmitter<{id:string}>();

  formVenta : FormGroup;

  //TODO Quitar comentarios
  constructor() {
    //this.formVenta = this.createFormVenta();
    console.log("se creo el modulo venta");
  }

  ngOnInit() {
    //console.log(this.prod);
    //console.log(this.prod.idProducto);
    //console.log('cantidadEnVentaModule  ', this.prod.cantidad);
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

  get cantidad() { return this.formVenta.get('cantidad'); }




  //event Emitters
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

  eventoEliminarItem(){
    const obj = {
      id : this.prod.idProducto,
    }

    this.quitarItemDeVenta.emit(obj);
  }

}

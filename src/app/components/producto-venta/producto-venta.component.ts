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

  @Output()  cambiarCantidadProd = new EventEmitter<{id :string, cantidad: number}>();
  @Output()  quitarItemDeVenta = new EventEmitter<{id:string}>();

  formVenta : FormGroup;

  constructor() {
    //this.formVenta = this.createFormVenta();
    //console.log("se creo el modulo venta");
  }

  ngOnInit() {
    //console.log(this.prod);
    //console.log(this.prod.idProducto);
    //console.log('cantidadEnVentaModule  ', this.prod.cantidad);
    this.formVenta = this.updateFormVenta();
  }


  createFormVenta() {
    return new FormGroup({
      cantidad: new FormControl('', [Validators.required, Validators.pattern('[0-9]+')])
    });
  }

  updateFormVenta() {
    return new FormGroup({
      cantidad: new FormControl(this.itemDeVenta.cantidad, [Validators.required, Validators.pattern('[0-9]+')])
    });
  }

  get cantidad() { return this.formVenta.get('cantidad'); }




  //event Emitters
  cambioCantidad(){

    // console.log(this.formVenta.value.cantidad);
    // console.log('sdfsdfsdf', this.cantidad.errors);

    if (!this.cantidad.errors) {
      this.cambiarCantidadProd.emit({
        id: this.itemDeVenta.idProducto,
        cantidad: parseInt(this.formVenta.value.cantidad)
      });
    }
    else {
      if(this.cantidad.errors.required){
        this.cambiarCantidadProd.emit({
          id: this.itemDeVenta.idProducto,
          cantidad: 0
        });
      }
    }
  }

  eventoEliminarItem(){
    this.quitarItemDeVenta.emit({
      id : this.itemDeVenta.idProducto,
    });
  }

}

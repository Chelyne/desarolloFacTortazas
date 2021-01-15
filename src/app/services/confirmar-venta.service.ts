import { Injectable } from '@angular/core';
import { ClienteInterface } from '../models/cliente-interface';
import { ItemDeVentaInterface } from '../models/venta/item-de-venta';
import { VentaInterface } from '../models/venta/venta';

@Injectable({
  providedIn: 'root'
})
export class ConfirmarVentaService {


  venta: VentaInterface = {};
  esCancelado = false;

  constructor() { }


  getVentaService(): VentaInterface{
    return this.venta;
  }

  setVenta(venta: VentaInterface){
    this.venta = venta;
    // this.listaItemsDeVenta = venta.listaItemsDeVenta;
  }

  getEsCancelado(): boolean{
    return this.esCancelado;
  }

  setEsCancelado(newValue: boolean){
    this.esCancelado = newValue;
  }

  resetService(){
    // NOTE - Cambia esCancelado a true para que lo pueda usar
    //        POS (punto de venta),
    // NOTE - Por lo tanto solo funciona en cancelar venta y
    //        ConfirmarVenta del Componente Confirmar Venta
    this.esCancelado = true;
    // Resestea el objeto ventas a un objeto vacio
    this.venta = {};
  }

}

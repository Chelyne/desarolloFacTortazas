import { Injectable } from '@angular/core';
import { ClienteInterface } from '../models/cliente-interface';
import { ItemDeVentaInterface } from '../models/venta/item-de-venta';
import { VentaInterface } from '../models/venta/venta';

@Injectable({
  providedIn: 'root'
})
export class ConfirmarVentaService {

  textService: string = 'Nada desde service';

  venta: VentaInterface = {};
  listaItemsDeVenta: ItemDeVentaInterface[] = [];

  cliente: ClienteInterface;

  // cancelarVenta: boolean = false;

  constructor() { }

  getTextService(){
    return this.textService;
  }

  setTextService(text: string){
    this.textService = text;
  }

  getVentaService(): VentaInterface{
    return this.venta;
  }

  setVenta(venta: VentaInterface){
    this.venta = venta;
  }

  cleanData(){
    this.listaItemsDeVenta = [];
  }

}

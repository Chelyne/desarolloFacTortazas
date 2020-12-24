import { Injectable } from '@angular/core';
import { CompraInterface } from '../models/Compra';

@Injectable({
  providedIn: 'root'
})
export class EditarCompraService {

  compra: CompraInterface = {};

  constructor() { }

  getCompra(){
    return this.compra;
  }

  setCompra(compra: CompraInterface){
    this.compra = compra;
  }

  cleanData(){
    this.compra = {};
  }

}

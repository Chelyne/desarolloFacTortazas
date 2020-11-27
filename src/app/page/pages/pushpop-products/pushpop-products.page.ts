import { Component, OnInit } from '@angular/core';
import { ProductoInterface } from 'src/app/interfaces/producto';

import { ProductoService } from 'src/app/services/producto/producto.service';
import { VentaInterface } from 'src/app/interfaces/venta/venta-interface';
import { ObjetoVenta } from 'src/app/interfaces/venta/objeto-venta';

@Component({
  selector: 'app-pushpop-products',
  templateUrl: './pushpop-products.page.html',
  styleUrls: ['./pushpop-products.page.scss'],
})
export class PushpopProductsPage implements OnInit {

  productosList: ProductoInterface[];
  productoItem: ProductoInterface;

  listaVenta: VentaInterface;

  avalue:number = 4;
  //TODO - darle un tipo a listaDeVenta
  listaDeVenta:any[] = [];

  constructor(private dataApi: ProductoService) {
    this.ObtenerProductos();
  }

  ngOnInit() {
  }

  ObtenerProductos(){
    console.log("getProductos");

    this.dataApi.ObtenerListaProductos().subscribe(data => {
      console.log(data);
      this.productosList = data;
      //console.log(this.usuariosList.length);
    });

  }

  listaProductos:ObjetoVenta[] = [];

  AgregarProducto(prodItem: ProductoInterface){


    let producExist: boolean = false;
    const idProdItem: string = prodItem.id;

    if (this.listaProductos.length > 0) {
        this.listaProductos.forEach(item =>{
          console.log('ssssssssssssssssss')
          if (idProdItem === item.idProducto){
              producExist = true;
              item.cantidad += 1;
              item.tatalxprod = item.cantidad * item.producto.prec_unit;
              return;
          }
        });
    }

    if(!producExist){

      this.listaProductos.push( this.CreateObjetoVenta(prodItem));
      console.log('ListaProductosVenta', this.listaProductos);
    }

    this.calcularTotalaPagar();
  }



  CreateObjetoVenta(prodItem: ProductoInterface):ObjetoVenta{
    return {
      producto: prodItem,
      idProducto: prodItem.id,
      cantidad: 1,
      tatalxprod: prodItem.prec_unit
    };
  }

  inputModief(evento:{id :string, cantidad: number}){
    console.log(evento);
    this.ActualizarMonto(evento.id, evento.cantidad);
  }

  ActualizarMonto(idProdItem: string, cantidad: number){

    if (this.listaProductos.length > 0) {
        this.listaProductos.forEach(item =>{
          console.log('ssssssssssssssssss')
          if (idProdItem === item.idProducto){
              item.cantidad = cantidad;
              item.tatalxprod = item.cantidad * item.producto.prec_unit;
              return;
          }
        });
    }
    this.calcularTotalaPagar();
  }


  quitarProducto(prodItem: ObjetoVenta){

    let index: number= 0;
    const idProdItem: string = prodItem.idProducto;

    if (this.listaProductos.length > 0) {
        this.listaProductos.forEach(item =>{
          console.log('dddddddd')

          if (idProdItem === item.idProducto){
              console.log("quitar producto", index);
              this.listaProductos.splice(index,1);
              return;
          }
          index++;
        });
    }

    this.calcularTotalaPagar();

  }

  totalxPagar:number;

  calcularTotalaPagar(){
    let totalxpagar: number = 0;
    this.listaProductos.forEach(item => {
      totalxpagar += item.tatalxprod;
    });
    console.log(totalxpagar);

    this.totalxPagar = totalxpagar;
  }






  unMonto = {};
  logForm(valor: any) {
    console.log(valor);
  }



}

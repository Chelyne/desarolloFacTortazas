import { Component, OnInit } from '@angular/core';
import { ProductoInterface } from 'src/app/interfaces/producto';
import { ItemDeVentaInterface } from 'src/app/interfaces/venta/objeto-venta';
import { VentaInterface } from 'src/app/interfaces/venta/venta-interface';
import { ProductoService } from 'src/app/services/producto/producto.service';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.page.html',
  styleUrls: ['./punto-venta.page.scss'],
})
export class PuntoVentaPage implements OnInit {

  //Ventas
    listaDeVentas:VentaInterface[] = [];

    venta: VentaInterface;

    totalxPagar:number;


  //ObjetoVentas o ItemsDeVenta
    itemsDeVenta:ItemDeVentaInterface[] = [];



  //Productos
    listaDeProductos: ProductoInterface[];
    productoItem: ProductoInterface;


  constructor(private dataApi: ProductoService) {
    this.ObtenerProductos();
  }

  ngOnInit() {
  }



  ObtenerProductos(){
    //console.log("getProductos");

    this.dataApi.ObtenerListaProductos().subscribe(data => {
      //console.log(data);
      this.listaDeProductos = data;
      //console.log(this.usuariosList.length);
    });
  }



  AgregarItemDeVenta(prodItem: ProductoInterface){

    let producExist: boolean = false;
    const idProdItem: string = prodItem.id;

    if (this.itemsDeVenta.length > 0) {
      for (const item of this.itemsDeVenta) {
        if (idProdItem === item.idProducto){
            producExist = true;
            item.cantidad += 1;
            item.tatalxprod = item.cantidad * item.producto.prec_unit;
            break;
        }
      }
    }

    if(!producExist){
      this.itemsDeVenta.push( this.CrearItemDeVenta(prodItem));
      //console.log('ListaProductosVenta', this.itemsDeVenta);
    }

    this.calcularTotalaPagar();
  }

  CrearItemDeVenta(prodItem: ProductoInterface):ItemDeVentaInterface{
    return {
      producto: prodItem,
      idProducto: prodItem.id,
      cantidad: 1,
      tatalxprod: prodItem.prec_unit
    };
  }

  inputModificado(evento:{id :string, cantidad: number}){
    //console.log(evento);
    this.ActualizarMonto(evento.id, evento.cantidad);
  }

  ActualizarMonto(idProdItem: string, cantidad: number){

    if (this.itemsDeVenta.length > 0) {
      for (const item of this.itemsDeVenta) {
        //console.log('ssssssssssssssssss')
        if (idProdItem === item.idProducto){
            item.cantidad = cantidad;
            item.tatalxprod = item.cantidad * item.producto.prec_unit;
            break;
        }
      }
    }

    this.calcularTotalaPagar();
  }


  quitarProducto(evento:{id:string}){

    let index: number= 0;
    const idProdItem: string = evento.id;

    if (this.itemsDeVenta.length > 0) {

      for (const itemDeVenta of this.itemsDeVenta) {
        if (idProdItem === itemDeVenta.idProducto){
            console.log("quitar producto", index);
            this.itemsDeVenta.splice(index,1);
            break;
        }
        index++;
      }
    }

    this.calcularTotalaPagar();
  }

  calcularTotalaPagar(){
    let totalxpagar: number = 0;

    for (const item of this.itemsDeVenta) {
      totalxpagar += item.tatalxprod;
    }
    //console.log(totalxpagar);

    this.totalxPagar = totalxpagar;
  }

  //......................................
  //nuevas funcionalidades

  AgregaraListaDeEspera(){
    //poner la venta en la lista de espera
    //anadir el array de itemsDeVenta a listaDeVentas
    // +totalapagar
    //NOTE - quizas necesitas; crearVenta
    this.listaDeVentas.push(this.CrearItemDeVentas());
    this.itemsDeVenta = [];
    this.totalxPagar = 0;
    console.log(this.listaDeVentas);

  }

  CrearItemDeVentas():VentaInterface{
    return {
      itemsDeVenta: this.itemsDeVenta,
      totalaPagar: this.totalxPagar,
      idVenta: this.CrearVentaId()
    };
  }

  //sacar de espera
  //moverAListaPrincipal
  moverAListaPrincipal(venta:VentaInterface){

    this.itemsDeVenta = venta.itemsDeVenta;

    const idVenta = venta.idVenta;
    let index = 0;
    for (const ventaItem of this.listaDeVentas) {
      if (idVenta== ventaItem.idVenta) {
        this.listaDeVentas.splice(index,1);
        break;
      }
      index++;
    }

    this.calcularTotalaPagar();
  }

  QuitarListaDeVenta(){
    this.itemsDeVenta = [];
    this.totalxPagar = 0;
  }

  CrearVentaId():string{
    const hoy = new Date();
    const hora = ''+hoy.getHours()+''+hoy.getMinutes()+''+hoy.getSeconds()+''+hoy.getMilliseconds();
    //console.log(typeof hora);
    //console.log('la hora: ', hora);

    return hora;
  }

  LimpiarListaDeVentas(){
    this.listaDeVentas = [];
  }


}

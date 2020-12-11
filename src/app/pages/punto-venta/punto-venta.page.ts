import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { CategoriasService } from '../../services/categorias.service';
import { PaginationProductosService } from '../../services/pagination-productos.service';
import { Subscription } from 'rxjs';

import { VentaInterface } from 'src/app/models/venta/venta';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { ProductoInterface } from 'src/app/models/ProductoInterface';

@Component({
  selector: 'app-punto-venta',
  templateUrl: './punto-venta.page.html',
  styleUrls: ['./punto-venta.page.scss'],
})
export class PuntoVentaPage implements OnInit {
  numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, '.'];
  categorias = [];
  listaProductos = [];
  categoria: string;

  listaVenta = [];
  private suscripcionProducto: Subscription;
  constructor(private menuCtrl: MenuController,
              private categoriasService: CategoriasService,
              private pagination: PaginationProductosService) {
    this.menuCtrl.enable(true);
   }


  //Ventas
    listaDeVentas:VentaInterface[] = [];

    venta: VentaInterface;

    totalxPagar:number;


  //ObjetoVentas o ItemsDeVenta
    // listaItemsDeVenta:ItemDeVentaInterface[] = [];
    listaItemsDeVenta:ItemDeVentaInterface[] = [];



  //Productos
    listaDeProductos: ProductoInterface[];
    productoItem: ProductoInterface;



  ngOnInit() {
    this.categorias = this.categoriasService.getcategoriasNegocio('petshop');
  }


  listaProductosCategoria(categoria: string) {
    if (this.categoria !== categoria) {
      console.log('de cero');
      this.listaProductos = [];
    }
    this.categoria = categoria;
    // const propietario = this.storage.datosNegocio.correo;
    const sede1 = 'andahuaylas';
    this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, null).subscribe( data => {
      if (data !== null) {
        this.listaProductos.push(...data);
        // this.sinDatos = false;
      } else {
        // this.sinDatos = true;
      }
    });
  }

  loadData(event) {
    // const propietario = this.storage.datosNegocio.correo;
    setTimeout(() => {
      const sede1 = 'andahuaylas';
      this.suscripcionProducto = this.pagination.getProductos(sede1, this.categoria, 'normal').subscribe( data => {
        if (data !== null) {
          this.listaProductos.push(...data);
          event.target.complete();
          // this.sinDatos = false;
        } else {
          // this.sinDatos = true;
          event.target.disabled = true;
        }
      });
    }, 500);
  }


  // addListaVenta(data) {
  //   this.listaVenta.push(data);
  // }

  //

  AgregarItemDeVenta(prodItem: ProductoInterface){

    let producExist: boolean = false;
    const idProdItem: string = prodItem.id;

    if (this.listaItemsDeVenta.length > 0) {
      for (const item of this.listaItemsDeVenta) {
        if (idProdItem === item.idProducto){
            producExist = true;
            item.cantidad += 1;
            item.tatalxprod = item.cantidad * item.producto.precio;
            break;
        }
      }
    }

    if(!producExist){
      this.listaItemsDeVenta.push( this.CrearItemDeVenta(prodItem));
    }

    this.calcularTotalaPagar();
  }

  CrearItemDeVenta(prodItem: ProductoInterface):ItemDeVentaInterface{
    return {
      producto: prodItem,
      idProducto: prodItem.id,
      cantidad: 1,
      tatalxprod: prodItem.precio
    };
  }

  inputModificado(evento:{id :string, cantidad: number}){
    //console.log(evento);
    this.ActualizarMonto(evento.id, evento.cantidad);
  }

  ActualizarMonto(idProdItem: string, cantidad: number){
    if (this.listaItemsDeVenta.length > 0) {
      for (const itemDeVenta of this.listaItemsDeVenta) {
        //console.log('ssssssssssssssssss')
        if (idProdItem === itemDeVenta.idProducto){
            itemDeVenta.cantidad = cantidad;
            itemDeVenta.tatalxprod = itemDeVenta.cantidad * itemDeVenta.producto.precio;
            break;
        }
      }
    }

    this.calcularTotalaPagar();
  }


  quitarProducto(evento:{id:string}){

    let index: number= 0;
    const idProdItem: string = evento.id;

    if (this.listaItemsDeVenta.length > 0) {

      for (const itemDeVenta of this.listaItemsDeVenta) {
        if (idProdItem === itemDeVenta.idProducto){
            console.log("quitar producto", index);
            this.listaItemsDeVenta.splice(index,1);
            break;
        }
        index++;
      }
    }

    this.calcularTotalaPagar();
  }

  calcularTotalaPagar(){
    let totalxpagar: number = 0;

    for (const item of this.listaItemsDeVenta) {
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
    this.listaItemsDeVenta = [];
    this.totalxPagar = 0;
    console.log(this.listaDeVentas);

  }

  CrearItemDeVentas():VentaInterface{
    return {
      listaItemsDeVenta: this.listaItemsDeVenta,
      totalaPagar: this.totalxPagar,
      idVenta: this.CrearVentaId()
    };
  }

  //sacar de espera
  //moverAListaPrincipal
  moverAListaPrincipal(venta:VentaInterface){

    this.listaItemsDeVenta = venta.listaItemsDeVenta;

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
    this.listaItemsDeVenta = [];
    this.totalxPagar = 0;
  }

  CrearVentaId():string{
    const hoy = new Date();
    const hora = ''+hoy.getHours()+''+hoy.getMinutes()+''+hoy.getSeconds()+''+hoy.getMilliseconds();
    return hora;
  }

  LimpiarListaDeVentas(){
    this.listaDeVentas = [];
  }


}

import { Component, OnInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { ProductoInterface } from '../../models/ProductoInterface';
import { CategoriasService } from '../../services/categorias.service';
import { ActivatedRoute } from '@angular/router';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
})
export class CatalogoPage implements OnInit {
  categorias = [];
  categoria = 'todo';
  sede;

  sinProductos =  false;
  ultimaCategoria;
  
  listaDeproductos: ProductoInterface[];


  constructor(
    private dataApi: DbDataService,
    private categoriasService: CategoriasService,
    private route: ActivatedRoute) {

    this.ObtenerClientes();

    
    
    this.route.queryParams.subscribe(params => {
      this.categoria = params.categoria;
      this.sede = params.sede;
      console.log('sede= :',this.sede);
    });
    
   }

   ngOnInit() {
    
    this.categorias = this.categoriasService.getcategoriasNegocio(this.categoria);
    this.ultimaCategoria = 4;
    console.log('hola',this.categorias);
  }

  loadData(event) {
    // const propietario = this.storage.datosNegocio.correo;
    setTimeout(() => {
      const siguiente = this.categoriasService.getcategoriasNegocio(this.categoria).slice(this.ultimaCategoria, this.ultimaCategoria + 4);
      if (siguiente.length > 0) {
        this.ultimaCategoria = this.ultimaCategoria + 4;
        siguiente.forEach(element => {
          this.categorias.push(element);
          event.target.complete();
        });
      } else {
        event.target.disabled = true;
      }
    }, 500);
  }

  receiveMessage($event) {
    if (isNullOrUndefined(this.sinProductos)) {
      this.sinProductos = $event;
    }
    if (this.sinProductos === false) {

    } else if (this.sinProductos === true) {
      this.sinProductos = $event;
    }
  }

  ObtenerClientes(){
    //console.log("getUsuarios");
    
    this.dataApi.ObtenerListaDeproductos().subscribe(data => {
      // console.log(data);
      this.listaDeproductos = data;
      //console.log(this.usuariosList.length);
      console.log('products=', this.listaDeproductos);
      
    });

  }

}

import { Component, OnInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { ProductoInterface } from '../../models/ProductoInterface';
import { CategoriasService } from '../../services/categorias.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
})
export class CatalogoPage implements OnInit {
  categorias = [];
  categoria;  
  ultimaCategoria;
  sede;
  
  listaDeproductos: ProductoInterface[];


  constructor(
    private dataApi: DbDataService,
    private categoriasService: CategoriasService,
    private route: ActivatedRoute) {
      
    this.route.queryParams.subscribe(params => {
      this.categoria = params.categoria;
      this.sede = params.sede;
      console.log(this.sede);
    });

    this.ObtenerClientes();
   }

   ngOnInit() {
    console.log(this.categorias);
    this.categorias = this.categoriasService.getcategoriasNegocio(this.categoria);
    this.ultimaCategoria = 4;
    console.log('jajaja', this.categorias);
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

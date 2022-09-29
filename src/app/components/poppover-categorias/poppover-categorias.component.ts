import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { PopoverController } from '@ionic/angular';
import { timer } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { DataBaseService } from '../../services/data-base.service';

@Component({
  selector: 'app-poppover-categorias',
  templateUrl: './poppover-categorias.component.html',
  styleUrls: ['./poppover-categorias.component.scss'],
})
export class PoppoverCategoriasComponent implements OnInit, AfterViewInit {
  @ViewChild('search', {static: false}) search: any;
  sede = this.storage.datosAdmi.sede;

  @Input() listaCategorias: any = [];
  @Input() categoriaSeleccionada: any;
  // listaClientes = [];

  textoBuscar = '';
  constructor(private dataApi: DataBaseService,
              private popoverController: PopoverController,
              private storage: StorageService) { }

  ngOnInit() {
    console.log(this.categoriaSeleccionada);
    this.dataApi.obtenerListaCategorias(this.sede).subscribe(datos =>  {
      console.log(datos);
      if (datos.length > 0) {
        this.listaCategorias = datos;
      } else {
        this.listaCategorias = ['No Hay Datos'];
      }
    });
  }

  ngAfterViewInit(): void {
    timer(500).subscribe(() => {
      this.search.setFocus();
      console.log('Set Focus');
    });
  }


  buscarCategoria(event) {
    console.log(event);
    const texto = event.target.value;
    this.textoBuscar = texto;
  }

  popAction(valor: string) {
    this.popoverController.dismiss({
      categoriaSeleccionada: valor
    });
  }

}

import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { PopoverController } from '@ionic/angular';
import { timer } from 'rxjs';
import { StorageService } from '../../services/storage.service';
import { DataBaseService } from '../../services/data-base.service';

@Component({
  selector: 'app-popover-marcas',
  templateUrl: './popover-marcas.component.html',
  styleUrls: ['./popover-marcas.component.scss'],
})
export class PopoverMarcasComponent implements OnInit {
  @ViewChild('search', {static: false}) search: any;
  sede = this.storage.datosAdmi.sede;

  @Input() listaMarcas: any = [];
  @Input() marcaSeleccionada: any;
  // listaClientes = [];

  textoBuscar = '';
  constructor(private dataApi: DataBaseService,
              private popoverController: PopoverController,
              private storage: StorageService) { }

  ngOnInit() {
    console.log(this.marcaSeleccionada);
    this.dataApi.obtenerMarcas().subscribe(datos =>  {
      console.log(datos);
      if (datos.length > 0) {
        this.listaMarcas = datos;
      } else {
        this.listaMarcas = ['No Hay Datos'];
      }
    });
  }

  ngAfterViewInit(): void {
    timer(500).subscribe(() => {
      this.search.setFocus();
      console.log('Set Focus');
    });
  }


  buscarMarca(event) {
    console.log(event);
    const texto = event.target.value;
    this.textoBuscar = texto;
  }

  popAction(valor: string) {
    this.popoverController.dismiss({
      marcaSeleccionada: valor
    });
  }
}

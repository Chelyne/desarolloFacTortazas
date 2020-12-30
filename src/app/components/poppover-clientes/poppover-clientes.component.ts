import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { PopoverController } from '@ionic/angular';
import { timer } from 'rxjs';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-poppover-clientes',
  templateUrl: './poppover-clientes.component.html',
  styleUrls: ['./poppover-clientes.component.scss'],
})
export class PoppoverClientesComponent implements OnInit, AfterViewInit {
  @ViewChild('search', {static: false}) search: any;

  @Input() listaClientes: any = [];
  @Input() seleccionado: any;
  // listaClientes = [];

  textoBuscar = '';
  constructor(private dataApi: DbDataService,
              private popoverController: PopoverController,
              private storage: StorageService) { }

  ngOnInit() {
    console.log(this.seleccionado);
    this.dataApi.ObtenerListaDeClientes().subscribe(datos =>  {
      console.log(datos);
      if (datos.length > 0) {
        this.listaClientes = datos;
      } else {
        this.listaClientes = ['No Hay Datos'];
      }
    });
  }

  ngAfterViewInit(): void {
    timer(500).subscribe(() => {
      this.search.setFocus();
      console.log('Set Focus');
    });
  }


  buscarCliente(event) {
    // console.log(event);
    const texto = event.target.value;
    this.textoBuscar = texto;
  }

  popAction(valor: string) {
    this.popoverController.dismiss({
      cliente: valor
    });
  }

}

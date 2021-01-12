import { Component, OnInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { VentaInterface } from '../../models/venta/venta';
import { FormGroup, FormControl } from '@angular/forms';
import { splitAtColon } from '@angular/compiler/src/util';
import { StorageService } from '../../services/storage.service';
import { ApiPeruService } from 'src/app/services/api/api-peru.service';

@Component({
  selector: 'app-lista-de-ventas',
  templateUrl: './lista-de-ventas.page.html',
  styleUrls: ['./lista-de-ventas.page.scss'],
})
export class ListaDeVentasPage implements OnInit {
  listaDeVentas: VentaInterface[] = [];
  sedes = this.storage.datosAdmi.sede;
  fachaventas = '02-01-2021';


  ventasForm: FormGroup;

  constructor(
    private dataApi: DbDataService,
    private storage: StorageService,
    private apiPeru: ApiPeruService
  ) {
    this.ObtenerVentas();
    this.ventasForm = this.createFormGroup();
   }

  ngOnInit() {
  }

  ObtenerVentas(){
    this.dataApi.ObtenerListaDeVentas(this.sedes, this.fachaventas).subscribe(data => {
      this.listaDeVentas = data;
      // console.log('VENTAS', data);
    });

    console.log('hola', this.sedes);
    console.log('ventas', this.fachaventas);
    console.log('listaventas', this.listaDeVentas);

  }

  createFormGroup() {
    return new FormGroup({
      fechadeventa: new FormControl(),
    });
  }

  NoEnviados(){
    let fecha = this.ventasForm.value.fechadeventa;
    this.fachaventas = fecha.split('-').reverse().join('-');
    this.ObtenerVentas();
    console.log(this.fachaventas);

  }


  EnviarComprobante(){
    for (const venta of this.listaDeVentas) {
      // this.apiPeru.enviarComprobanteASunat(venta);
    }
  }

  enviarUnComprobante(data) {
    console.log(data);
    // this.apiPeru.enviarComprobanteASunat(data);
  }
}

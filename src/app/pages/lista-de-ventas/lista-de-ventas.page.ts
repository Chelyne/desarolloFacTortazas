import { Component, OnInit, ɵConsole } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { VentaInterface } from '../../models/venta/venta';
import { FormGroup, FormControl } from '@angular/forms';
import { splitAtColon } from '@angular/compiler/src/util';
import { StorageService } from '../../services/storage.service';
import { ApiPeruService } from 'src/app/services/api/api-peru.service';
import { LoadingController, MenuController, ToastController } from '@ionic/angular';
import { formatDate } from '@angular/common';

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
  sinDatos;
  buscando;

  loading;

  constructor(
    private dataApi: DbDataService,
    private storage: StorageService,
    private apiPeru: ApiPeruService,
    private menuCtrl: MenuController,
    private toastController: ToastController,
    private loadingController: LoadingController

  ) {
    this.ventasForm = this.createFormGroup();
   }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // this.ObtenerVentas();
  }



  createFormGroup() {
    return new FormGroup({
      fechadeventa: new FormControl(),
    });
  }

  NoEnviados(){

    this.ObtenerVentas();

  }

/* -------------------------------------------------------------------------- */
/*                           obtener lista de ventas                          */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

  ObtenerVentas(){
    this.buscando = true;
    // const fecha = this.ventasForm.value.fechadeventa;
    this.ventasForm.value.fechadeventa = this.ventasForm.value.fechadeventa.split('-').reverse().join('-');
    console.log(this.ventasForm.value.fechadeventa);
    this.dataApi.ObtenerListaDeVentas(this.sedes, this.ventasForm.value.fechadeventa).subscribe(data => {
      if (data.length > 0) {
        this.listaDeVentas = data;
        console.log(this.listaDeVentas);

        this.sinDatos = false;
        this.buscando = false;
      } else {
        this.sinDatos = true;
        this.buscando = false;
      }
    });

    // console.log('hola', this.sedes);
    // console.log('ventas', this.fachaventas);
    // console.log('listaventas', this.listaDeVentas);
  }
/* -------------------------------------------------------------------------- */
/*                           obtener lista de ventas                          */
/* -------------------------------------------------------------------------- */



  // EnviarComprobante(){
  //   for (const venta of this.listaDeVentas) {
  //     this.apiPeru.enviarComprobanteASunat(venta);
  //   }
  // }

  enviarUnComprobante(data) {
    console.log(data);
    this.apiPeru.enviarASunatAdaptador(data);
  }


  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      // duration: 10000
    });
    await this.loading.present();
  }

  async enviarComprobantesDelDia() {
    // const lista = await this.obtenerListaVentas().then((listaventas: VentaInterface[]) => listaventas);
    const lista = this.listaDeVentas;
    if (lista.length > 0) {
      // console.log(lista);
      await this.presentLoading('Enviando comprobantes, Por favor espere...');
      for (const venta of lista) {
        // this.contadorComprobantes++;
        console.log(venta);
        if ((venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura') && !venta.cdr) {
          await this.apiPeru.enviarASunatAdaptador(venta).then(cdr => {
            console.log(cdr);
          });
        } else {
          console.log('Es nota de venta' , venta);
        }
      }
      this.loading.dismiss();
      this.presentToast('Comprobantes enviados.');
    } else {
      this.presentToast('No hay ventas para enviar.');
    }
  }

  // async obtenerListaVentas() {
  //   const dia =  formatDate(new Date(), 'dd-MM-yyyy', 'en');
  //   console.log(dia);
  //   const promesa = new Promise((resolve, reject) => {
  //     this.dataApi.listaVentasDia(this.storage.datosAdmi.sede, dia).subscribe((datos => {
  //       console.log('no imprimir', datos);
  //       resolve(datos);
  //     }));
  //   });
  //   return promesa;
  // }

  async presentToast(mensaje: string, colors?: string, icono?: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: colors,
      buttons: [
        {
          side: 'start',
          icon: icono,
          // text: 'Favorite',
        }
      ]
    });
    toast.present();
  }

  // NOTE: No envia resumen diario solo formatea.
  enviarResumenDiario(){
    this.apiPeru.formatearResumenDiario(this.listaDeVentas);
  }
}

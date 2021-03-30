import { Component, OnInit, ɵConsole } from '@angular/core';
import { VentaInterface } from '../../models/venta/venta';
import { FormGroup, FormControl } from '@angular/forms';
import { StorageService } from '../../services/storage.service';
import { ApiPeruService } from 'src/app/services/api/api-peru.service';
import { LoadingController, MenuController, ToastController } from '@ionic/angular';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from '../../global/global.service';
import { ProductoInterface } from '../../models/ProductoInterface';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-lista-de-ventas',
  templateUrl: './lista-de-ventas.page.html',
  styleUrls: ['./lista-de-ventas.page.scss'],
})
export class ListaDeVentasPage implements OnInit {
  listaDeVentas: VentaInterface[] = [];
  listaDeProductos = [];
  sede = this.storage.datosAdmi.sede;
  fechaventas = '02-01-2021';
  fechaventasReverso = '2021-01-02';

  fechaventaDDMMYYYY = '02-01-2021';
  fechaventaYYYYMMDD = '2021-01-02';


  ventasForm: FormGroup;
  sinDatos;
  buscando;

  loading;

  constructor(
    private dataApi: DataBaseService,
    private storage: StorageService,
    private apiPeru: ApiPeruService,
    private menuCtrl: MenuController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private servGlobal: GlobalService
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
    this.fechaventaYYYYMMDD = this.ventasForm.value.fechadeventa;
    this.ventasForm.value.fechadeventa = this.ventasForm.value.fechadeventa.split('-').reverse().join('-');
    // console.log(this.ventasForm.value.fechadeventa);
    this.fechaventaDDMMYYYY = this.ventasForm.value.fechadeventa;
    console.log(this.fechaventaDDMMYYYY, this.fechaventaYYYYMMDD);
    this.dataApi.obtenerVentasPorDiaObs(this.sede, this.ventasForm.value.fechadeventa).subscribe(data => {
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
    // console.log('ventas', this.fechaventas);
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

  enviarUnComprobante(venta: VentaInterface) {
    console.log(venta);
    this.apiPeru.enviarASunatAdaptador(venta).then(exito => console.log('Comprobante enviado con ', exito))
    .catch( err => console.log('Error al enviar el comprobante', err));
  }


  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      // duration: 10000
    });
    await this.loading.present();
  }

  async actualizarStockDelDia() {
    const lista = [...this.listaDeVentas];
    if (lista.length) {
      for (const venta of lista) {
        console.log('ENVIAMOS: ', venta);
        if (venta.estadoVenta !== 'anulado') {
          await this.dataApi.obtenerProductosDeVenta(venta.idListaProductos, this.sede).then(ventas => {
            console.log('PRODUCTOS: ', ventas);
            this.listaDeProductos = this.listaDeProductos.concat(ventas);
          });
        }
      }
      this.actualizarStockProductos(this.listaDeProductos);
      console.log('LISTA: ', this.listaDeProductos);
    } else {
      this.servGlobal.presentToast('No hay list de ventas', {color: 'danger'});
    }
  }

  async actualizarStockProductos(lista: any[]) {
    for (const item of lista) {
      await this.dataApi.decrementarStockProducto(item.idProducto, this.sede, item.cantidad).then(() => {
        // console.log('Actualizado: ', producto.nombre, ' de ', producto.cantStock, ' a ', cantidad);
      });
    }
    console.log('TERMINAMOS DE HOY');
  }

  async enviarComprobantesDelDia() {
    /**
     * @PASO1 :Enviar boletas y factura a SUNAT
     */
    const lista = [...this.listaDeVentas];

    if (lista.length) {

      await this.presentLoading('Enviando comprobantes, Por favor espere...');

      for (const venta of lista) {

        console.log('VENTA_A_SER_ENVIADA', venta);

        let response: any;

        if ((venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura') && !venta.cdr) {

          response = await this.apiPeru.enviarASunatAdaptador(venta).catch( err => err);

          if (response === 'COMPROBANTE NO ENVIADO A SUNAT' || response === 'NO SE GUARDO EL CDR'){
            console.log('Error al Enviar Comprobantes: ', response);
            this.loading.dismiss();
            return;
          }

        } else {
          console.log('Es nota de venta' , venta);
        }

      }

      /**
       * @PASO2 :Enviar notas de credito
       */
      const lista2 = [...this.listaDeVentas];

      for (const venta of lista2) {
        let response: any;
        if (venta.estadoVenta === 'anulado' && venta.cdr && venta.cdr.sunatResponse.success) {
          if (!venta.cdrAnulado){
            response = await this.apiPeru.enviarNotaDeCreditoAdaptador(venta);
          }
        } else {
          if (venta.estadoVenta === 'anulado') {
            console.log('comprobante A ser ANULADO aun no emitido a SUNAT', venta);
          }
        }

        if (
          response === 'COMPROBANTE NO ENVIADO A SUNAT' ||
          response === 'NO SE GUARDO EL CDR' ||
          response === 'NO INCREMENTO LA CORRELACION'
        ){
          console.log('Error al Enviar Comprobantes: ', response);
          this.loading.dismiss();
          return;
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
    console.log(this.fechaventas);
    this.apiPeru.formatearResumenDiario(this.listaDeVentas, this.fechaventaYYYYMMDD);
  }

  async descargarZIP(venta: VentaInterface) {
    await this.presentLoading('Descargando...');
    const binaryString = window.atob(venta.cdr.sunatResponse.cdrZip);
    const binaryLen = binaryString.length;
    const ab = new ArrayBuffer(binaryLen);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < binaryLen; i++) {
      ia[i] = binaryString.charCodeAt(i);
    }
    // tslint:disable-next-line:prefer-const
    let bb: any = new Blob([ab]);
    bb.lastModifiedDate = new Date();
    bb.name = 'archive.zip';
    // bb.type = 'zip';
    // return bb;
    this.loading.dismiss();
    FileSaver.saveAs(bb, venta.serieComprobante + '-' + venta.numeroComprobante + '.zip');
  }

  async descargarXML(venta: VentaInterface) {
    await this.presentLoading('Descargando...');
    const fileToExport = new Blob([venta.cdr.xml], {type: 'text/xml'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileToExport);
    a.target = '_blank';
    a.download = venta.serieComprobante + '-' + venta.numeroComprobante + '.xml';
    this.loading.dismiss();
    a.click();
  }
}

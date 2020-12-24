import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController, AlertController, ToastController, PopoverController } from '@ionic/angular';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbrirCerrarCajaPage } from '../../modals/abrir-cerrar-caja/abrir-cerrar-caja.page';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from '../../services/storage.service';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { ExportarPDFService } from '../../services/exportar-pdf.service';
// pdf
import * as jspdf from 'jspdf';
import 'jspdf-autotable';
import {UserOptions} from 'jspdf-autotable';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
// tslint:disable-next-line:class-name
interface jsPDFWithPlugin extends jspdf.jsPDF {
  autoTable: (options: UserOptions) => jspdf.jsPDF;
 }

@Component({
  selector: 'app-caja-chica',
  templateUrl: './caja-chica.page.html',
  styleUrls: ['./caja-chica.page.scss'],
  providers: [
    DatePipe
  ]
})
export class CajaChicaPage implements OnInit {
  buscando: boolean;
  sede;
  listaCajaChica;

  sinResultados: string;
  dataPdf: any = [[
    1,
    'e101',
    'ravi',
    1000,
    'celine'
  ],
    [
      2,
    'e102',
    'ram',
    2000,
    'celine'
    ],
    [
      3,
    'e103',
    'rajesh',
    3000,
    'celine'
    ],
  ];

  constructor(private menuCtrl: MenuController,
              private router: Router,
              private afs: AngularFirestore,
              private excelService: ExportarPDFService,
              private alertCtrl: AlertController,
              private dataApi: DbDataService,
              private storage: StorageService,
              private datePipe: DatePipe,
              private toastController: ToastController,
              private popoverCtrl: PopoverController,
              private modalController: ModalController) {
                this.sede = this.storage.datosAdmi.sede;
                this.listaCajaChicaSede(this.sede);

              }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }
  async modalAperturaCajaChica(modoCaja: string, datos: any) {
    const modal = await this.modalController.create({
      component: AbrirCerrarCajaPage,
      cssClass: 'my-custom-class',
      componentProps: {
        modo: modoCaja,
        datosCaja: datos
      }
    });
    return await modal.present();
  }
  buscador(ev) {
    console.log('Reporte general', ev);

  }
  async confirmarCerrarCaja(id) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Cerrar Caja Chica POS',
      message: '¿Está seguro de cerrar caja?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.modalAperturaCajaChica('cerrar', id);
          }
        }
      ]
    });
    await alert.present();
  }
  Search(ev) {
    this.sinResultados = null;
    this.buscando = true;
    console.log(ev.detail.value);
    const key = ev.detail.value;
    console.log('dato a buscar', key);
    const lowercaseKey = key.toLowerCase();
    // const lowercaseKey = key; // esto es para buscar sin convertir en minuscula
    console.log('dato convertido en minuscula', key);
    // console.log(lowercaseKey);
    if ( lowercaseKey.length > 0) {
      // console.log('sede', this.sede);
      console.log('lowercase> 0');
      // tslint:disable-next-line:max-line-length
      // tslint:disable-next-line:max-line-length
      // this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos', res => res.where('categoria', '==', this.categoria).orderBy('nombre').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')).snapshotChanges()
      // .pipe(map(changes => {
      //    return changes.map(action => {
      //     const data = action.payload.doc.data();
      //     data.id = action.payload.doc.id;
      //     console.log(data);
      //     return data;
      //   });
      // }
      // )).subscribe(res => {
      //   if (res.length === 0 ) {
      //     console.log('no hay datos');
      //     this.productos = null;
      //     this.buscando = false;
      //     this.sinResultados = 'No se encontró el producto';
      //   } else {
      //     console.log(res );
      //     this.productos = res;
      //     this.buscando = false;
      //   }
      // }, error => { alert('error de subscribe'  + error); }
      // );
     } else  {
      console.log('lowercase 0');
      // this.productos = null;
      this.buscando = null;
     }
  }
  listaCajaChicaSede(sede: string){
    this.dataApi.ObtenerListaCajaChica(sede).subscribe(data => {
      this.listaCajaChica = data;
      this.convertirFecha(this.listaCajaChica);
      console.log('lista de caja chica', this.listaCajaChica);
    });
  }
  convertirFecha(lista) {
    lista.forEach(element => {
      // element.fecha = moment.unix(element.fecha).format('DD/MM/yyyy');
      element.FechaApertura = new Date(moment.unix(element.FechaApertura.seconds).format('D MMM YYYY H:mm'));
      element.FechaApertura = this.datePipe.transform(element.FechaApertura, 'short');
      if (element.FechaCierre ) {
        element.FechaCierre = new Date(moment.unix(element.FechaCierre.seconds).format('D MMM YYYY H:mm'));
        element.FechaCierre = this.datePipe.transform(element.FechaCierre, 'short');
      }
    });
  }
  async confirmarBorrarCaja(id) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Borrar Caja Chica POS',
      message: '¿Está seguro de borrar caja?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.EliminarCaja( id);
          }
        }
      ]
    });
    await alert.present();
  }
  EliminarCaja(id: string) {
    console.log(id);
    this.dataApi.EliminarCajaChica(id).then(res => {
      this.presentToast('Eliminado Correctamente', 'success', 'checkmark-circle-outline');
    }
    ).catch(() => {
      this.presentToast('No se pudo eliminar', 'danger', 'alert-circle-outline');
    });
  }
  limpiar() {
    this.buscando = null;
  }
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
  exportarExel(): void {
    this.excelService.exportAsExcelFile(this.listaCajaChica, 'exelTooby');
  }
  exportArPDF() {
    const imgData = '../../../assets/img/TOOBY LOGO.png';
    const doc = new jspdf.jsPDF('portrait', 'px', 'a4') as jsPDFWithPlugin;
    // this.data.forEach(element => {
    // });
    // doc.addHTML()

    doc.setFontSize(16);
    doc.setFont('bold');
    doc.text('Resúmen de ingresos por métodos de pago', 100, 30);
    doc.addImage(imgData, 'JPEG', 370, 20, 30, 15);
    doc.setLineWidth(0.5);
    doc.line(100, 35, 305, 35);
    doc.rect(30, 50, 387, 50); // empty square
    doc.setFontSize(12);

    doc.text( 'Empresa:', 40, 60);
    doc.text( 'RUC:', 40, 70);
    doc.text( 'Vendedor:', 40, 80);
    doc.text( 'Estado de Caja:', 40, 90);

    doc.setFontSize(11);
    // doc.setFont('default');
    doc.text( 'Veterinarias Tooby', 75, 60);
    doc.text( '10232323235', 64, 70);
    doc.text( this.storage.datosAdmi.nombre, 81, 80);
    doc.text( 'Cerrado', 98, 90);

    doc.setFontSize(12);
    doc.text( 'Fecha reporte:', 185, 60);
    doc.text( 'Establecimiento:', 185, 70);
    doc.text( 'Fecha y hora apertura:', 185, 80);
    doc.text( 'Fecha y hora cierre:', 185, 90);

    doc.setFontSize(11);
    doc.text( '24-12-2020', 240, 60);
    doc.text( this.storage.datosAdmi.sede, 247, 70);
    doc.text( '24-12-2020 08:00', 267, 80);
    doc.text( '24-12-2020 08:50', 258, 90);




    // doc.rect(40, 20, 10, 10, 'F'); // filled square
    // doc.setDrawColor(255,0,0);
    // doc.rect(60, 20, 10, 10); // empty red square
    doc.autoTable({
      head: [['#', 'Fecha y hora emisión', 'Tipo documento', 'Documento', 'Método de pago', 'Moneda', 'Importe', 'Vuelto', 'Monto']],
      body: this.dataPdf,
      startY: 110,
      theme: 'grid',
      // foot:  [['ID', 'Name', 'Country']],
    });
    // tslint:disable-next-line:prefer-const
    // for (let data1 of this.data) {
    //   console.log('dato', data1.eid);
    //   console.log('dato', data1.ename);
    //   console.log('dato', data1.esal);
    //   console.log('dato', data1.nombre);

    //   doc.autoTable( {
    //     body: [[data1.eid, data1.ename, data1.esal, data1.nombre]]
    //   });
    // }
    doc.save('table.pdf');

  }
  async ReporteProductos(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: PoppoverEditarComponent,
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        exportar: true
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      switch (data.action) {
        case 'pdf': this.exportArPDF(); break;
        case 'excel': this.exportarExel(); break;
      }
    }
  }


}

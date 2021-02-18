import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController, LoadingController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-ingreso-egreso',
  templateUrl: './ingreso-egreso.page.html',
  styleUrls: ['./ingreso-egreso.page.scss'],
})
export class IngresoEgresoPage implements OnInit {

  ingresoEgresoForm: FormGroup;
  public saldoInsuficiente = false;

  @Input() eventoInvoker: string;
  @Input() tagInvoker: string;
  @Input() buttonTagInvoer: string;
  @Input() saldoInvoker: number;


  loading;
  constructor(
    private modalCtlr: ModalController,
    private toastCtrl: ToastController,
    private dataApi: DbDataService,
    private storage: StorageService,
    private loadingController: LoadingController
  ) {
    this.ingresoEgresoForm = this.createFormIngresoEgreso();
  }

  ngOnInit() {
  }

  createFormIngresoEgreso() {
    return new FormGroup({
      monto: new FormControl('', [Validators.required,  Validators.pattern('[0-9]*[\.]?[0-9]+$')]),
      detalles: new FormControl('', [Validators.required]),
      tipo: new FormControl('')
    });
  }
  // ^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$

  get monto() { return this.ingresoEgresoForm.get('monto'); }
  get detalles() { return this.ingresoEgresoForm.get('detalles'); }



  execTransaction(){
    console.log(this.eventoInvoker);

    if (this.eventoInvoker === 'Ingreso') {
      this.IngresarMonto();

    } else if (this.eventoInvoker === 'Egreso') {
      this.EgresarMonto();

    } else {
      console.log('La fución no es valida');
    }
  }

  async IngresarMonto() {
    await this.presentLoading('guardando datos');
    this.ingresoEgresoForm.value.tipo = 'ingreso';
    this.dataApi.guardarIngresoEgreso(this.ingresoEgresoForm.value, this.storage.datosAdmi.sede).then(() => {
      const monto: number = parseFloat(this.ingresoEgresoForm.value.monto);
      // console.log(this.ingresoEgresoForm.value);
      // console.log(monto, this.saldoInvoker);
      this.modalCtlr.dismiss({
        newMonto: this.saldoInvoker + monto
      });
      this.presentToast('Ingreso de monto exitoso.');
      this.loading.dismiss();
    });
  }

  async EgresarMonto(){
    await this.presentLoading('guardando datos');
    this.ingresoEgresoForm.value.tipo = 'egreso';
    this.dataApi.guardarIngresoEgreso(this.ingresoEgresoForm.value, this.storage.datosAdmi.sede).then(() => {
      const monto: number = parseFloat(this.ingresoEgresoForm.value.monto);
      // if (this.saldoInvoker >= monto) {
      this.modalCtlr.dismiss({
        newMonto: this.saldoInvoker - monto
      });
      this.presentToast('Retiro exitoso.');
      this.loading.dismiss();
      // } else {
      //   this.saldoInsuficiente = true;
      // }
    });
  }


  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
  }

  cerrarModal(){
    this.modalCtlr.dismiss();
  }


  numberOnlyValidation(event: any) {
    const pattern = /[0-9.]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      // duration: 2000
    });
    await this.loading.present();
  }



}

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, LoadingController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { GlobalService } from '../../global/global.service';

@Component({
  selector: 'app-ingreso-egreso',
  templateUrl: './ingreso-egreso.page.html',
  styleUrls: ['./ingreso-egreso.page.scss'],
})
export class IngresoEgresoPage implements OnInit {

  ingresoEgresoForm: FormGroup;
  public saldoInsuficiente = false;

  @Input() dataModal: {
    evento: 'ingreso' | 'egreso',
  };


  loading;
  constructor(
    private modalCtlr: ModalController,
    private dataApi: DbDataService,
    private storage: StorageService,
    private loadingController: LoadingController,
    private servGlobal: GlobalService
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

  get monto() { return this.ingresoEgresoForm.get('monto'); }
  get detalles() { return this.ingresoEgresoForm.get('detalles'); }



  execTransaction(){
    if (this.dataModal.evento === 'ingreso') {
      this.IngresarMonto();

    } else if (this.dataModal.evento === 'egreso') {
      this.EgresarMonto();
    } else {
      console.log('La fución no es valida');
    }
  }

  async IngresarMonto() {
    await this.presentLoading('Guardando datos...');
    this.ingresoEgresoForm.value.tipo = 'ingreso';
    this.dataApi.guardarIngresoEgreso(this.ingresoEgresoForm.value, this.storage.datosAdmi.sede).then(() => {
      const monto: number = parseFloat(this.ingresoEgresoForm.value.monto);
      this.modalCtlr.dismiss();
      this.servGlobal.presentToast('Ingreso exitoso.', {color: 'success'});
      this.loading.dismiss();
    });
  }

  async EgresarMonto(){
    await this.presentLoading('Guardando datos...');
    this.ingresoEgresoForm.value.tipo = 'egreso';
    this.dataApi.guardarIngresoEgreso(this.ingresoEgresoForm.value, this.storage.datosAdmi.sede).then(() => {
      const monto: number = parseFloat(this.ingresoEgresoForm.value.monto);
      this.modalCtlr.dismiss();
      this.servGlobal.presentToast('Retiro exitoso.', {color: 'success'});
      this.loading.dismiss();
    });
  }

  cerrarModal(){
    this.modalCtlr.dismiss();
  }


  numberOnlyValidation(event: any) {
    const pattern = /[0-9.]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
    });
    await this.loading.present();
  }



}

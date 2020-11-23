import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ingreso-egreso-modal',
  templateUrl: './ingreso-egreso-modal.page.html',
  styleUrls: ['./ingreso-egreso-modal.page.scss'],
})
export class IngresoEgresoModalPage implements OnInit {

  ingresoEgresoForm : FormGroup;
  private saldoInsuficiente: boolean = false;

  @Input() eventoInvoker : string;
  @Input() tagInvoker : string;
  @Input() saldoInvoker : number;



  constructor(
    private modalCtlr: ModalController,
    private toastCtrl: ToastController
  ) {
    this.ingresoEgresoForm = this.createFormIngresoEgreso();
  }

  ngOnInit() {
  }

  createFormIngresoEgreso() {
    return new FormGroup({
      monto: new FormControl('', [Validators.required,  Validators.pattern('[0-9]*[\.]?[0-9]+$')])
    });
  }
  //^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$

  get monto() { return this.ingresoEgresoForm.get('monto'); }


  numberOnlyValidation(event: any) {
    const pattern = /[0-9.]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  salirDeModal(){
    this.modalCtlr.dismiss();
  }

  execTransaction(){
    console.log(this.eventoInvoker);

    if (this.eventoInvoker == 'Ingreso') {
      this.IngresarMonto();

    } else if (this.eventoInvoker == 'Egreso') {
      this.EgresarMonto();

    } else {
      console.log('La fución no es valida');

    }
  }

  IngresarMonto () {

    const monto : number = parseFloat(this.ingresoEgresoForm.value.monto);
    console.log(this.ingresoEgresoForm.value);
    console.log(monto, this.saldoInvoker);
    this.modalCtlr.dismiss({
      newMonto: this.saldoInvoker + monto
    });

    this.presentToast('Ingreso de monto exitoso.')
  }

  EgresarMonto(){
    const monto : number = parseFloat(this.ingresoEgresoForm.value.monto);

    if (this.saldoInvoker >= monto) {
      this.modalCtlr.dismiss({
        newMonto: this.saldoInvoker - monto
      });
      this.presentToast('Retiro exitoso.')

    } else {
      this.saldoInsuficiente = true;
    }
  }

  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
  }


}

import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { DbDataService } from 'src/app/services/db-data.service';

@Component({
  selector: 'app-agregar-editar-cliente',
  templateUrl: './agregar-editar-cliente.page.html',
  styleUrls: ['./agregar-editar-cliente.page.scss'],
})
export class AgregarEditarClientePage implements OnInit {

  clienteModalForm: FormGroup;
  // passwordTypeInput  =  'password';

  @Input() eventoInvoker: string;
  @Input() titleInvoker: string;
  @Input() tagInvoker: string;
  @Input() dataInvoker: ClienteInterface;

  constructor(
    private dataApi: DbDataService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController
  ) {

    this.clienteModalForm = this.createFormCliente();
    console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }

  ngOnInit() {
    if ( this.eventoInvoker === 'actualizarCliente' ){
      this.clienteModalForm = this.formForUpdate();
    }
    console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }


  createFormCliente(){
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      celular: new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  get nombre() { return this.clienteModalForm.get('nombre'); }
  get apellidos() { return this.clienteModalForm.get('apellidos'); }
  get dni() { return this.clienteModalForm.get('dni'); }
  get celular() { return this.clienteModalForm.get('celular'); }
  get direccion() { return this.clienteModalForm.get('direccion'); }
  get email() { return this.clienteModalForm.get('email'); }

  formForUpdate() {
    return new FormGroup({
      nombre: new FormControl(this.dataInvoker.nombre, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl(this.dataInvoker.apellidos, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl(this.dataInvoker.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      celular: new FormControl(this.dataInvoker.celular, [Validators.required, Validators.minLength(9), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataInvoker.direccion, [Validators.required, Validators.minLength(3)]),
      email: new FormControl(this.dataInvoker.email, [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }



  execFun(){
    if (this.eventoInvoker === 'guardarCliente'){
      this.guardarCliente();

    }
    else if (this.eventoInvoker === 'actualizarCliente'){
      this.actualizarCliente();

    } else {
      console.log('La función no existe');

    }
  }

  guardarCliente(){
    this.clienteModalForm.value.nombre = this.nombre.value.toLowerCase();
    this.clienteModalForm.value.apellidos = this.apellidos.value.toLowerCase();

    this.dataApi.guardarCliente(this.clienteModalForm.value).then(
      () => {
        console.log('Se ingreso Correctamente');
        this.presentToast('Se ingreso correctamente');
        this.clienteModalForm.reset();
        this.modalCtlr.dismiss();
      }
    );

  }


  actualizarCliente(){

    this.clienteModalForm.value.nombre = this.nombre.value.toLowerCase();
    this.clienteModalForm.value.apellidos = this.apellidos.value.toLowerCase();

    this.dataApi.actualizarCliente(this.dataInvoker.id, this.clienteModalForm.value).then(
      () => {
        console.log('Se ingreso Correctamente');
        this.presentToast('Datos actualizados correctamente');
        this.modalCtlr.dismiss();
      }
    );

  }

  cerrarModal(){
    this.modalCtlr.dismiss();
  }


  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  stringOnlyValidation(event: any) {
    const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
    const inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }


}

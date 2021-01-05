import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { DbDataService } from 'src/app/services/db-data.service';
import { AdmiInterface } from '../../models/AdmiInterface';

@Component({
  selector: 'app-agregar-editar-usuario',
  templateUrl: './agregar-editar-usuario.page.html',
  styleUrls: ['./agregar-editar-usuario.page.scss'],
})
export class AgregarEditarUsuarioPage implements OnInit {

  usuarioModalForm: FormGroup;

  passwordTypeInput  =  'password';

  @Input() eventoInvoker: string;
  @Input() titleInvoker: string;
  @Input() tagInvoker: string;
  @Input() dataInvoker: AdmiInterface;

  emailPattern: any = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor(
    private dataApi: DbDataService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController
  ) {

    this.usuarioModalForm = this.createFormGroupUsuario();
  }


  ngOnInit() {
    if ( this.eventoInvoker === 'actualizarUsuario' ){
      this.usuarioModalForm = this.formForUpdate();
    }
  }

  createFormGroupUsuario() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      correo: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(this.emailPattern)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rol: new FormControl('', Validators.required)
    });
  }

  formForUpdate() {
    return new FormGroup({
      // tslint:disable-next-line:max-line-length
      nombre: new FormControl(this.dataInvoker.nombre, [Validators.required, Validators.minLength(3), Validators.maxLength(40), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      // tslint:disable-next-line:max-line-length
      apellidos: new FormControl(this.dataInvoker.apellidos, [Validators.required, Validators.minLength(3), Validators.maxLength(60), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl(this.dataInvoker.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      // tslint:disable-next-line:max-line-length
      correo: new FormControl(this.dataInvoker.correo, [Validators.required, Validators.minLength(8), Validators.pattern(this.emailPattern)]),
      password: new FormControl(this.dataInvoker.password, [Validators.required, Validators.minLength(6)]),
      rol: new FormControl(this.dataInvoker.rol, Validators.required)
    });
  }

  get nombre() { return this.usuarioModalForm.get('nombre'); }
  get apellidos() { return this.usuarioModalForm.get('apellidos'); }
  get dni() { return this.usuarioModalForm.get('dni'); }
  get correo() { return this.usuarioModalForm.get('correo'); }
  get password() { return this.usuarioModalForm.get('password'); }
  get rol() { return this.usuarioModalForm.get('rol'); }

  execFun(){
    if (this.eventoInvoker === 'guardarUsuario'){
      this.guardarUsuario();

    }
    else if (this.eventoInvoker === 'actualizarUsuario'){
      this.actualizarUsuario();

    } else {
      console.log('La función no existe');
    }
  }

  guardarUsuario(){
    this.usuarioModalForm.value.nombre = this.nombre.value.toLowerCase();
    this.usuarioModalForm.value.apellidos = this.apellidos.value.toLowerCase();

    this.dataApi.guardarUsuario(this.usuarioModalForm.value).then(() => {
      console.log('Se ingreso Correctamente');
      this.presentToast('Se ingreso correctamente');
      this.usuarioModalForm.reset();
      this.salirDeModal();
    }
    );

  }


  actualizarUsuario(){

    this.usuarioModalForm.value.nombre = this.nombre.value.toLowerCase();
    this.usuarioModalForm.value.apellidos = this.apellidos.value.toLowerCase();

    this.dataApi.actualizarUsuario(this.dataInvoker.correo, this.usuarioModalForm.value).then(
      () => {
        console.log('Se ingreso Correctamente');
        this.presentToast('Datos actualizados correctamente');
        this.modalCtlr.dismiss();
      }
    );

  }

  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
  }


  salirDeModal(){
    this.modalCtlr.dismiss();
  }

  togglePasswordMode() {
    this.passwordTypeInput = this.passwordTypeInput === 'text' ? 'password' : 'text';
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

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserRegistroService } from 'src/app/services/user-registro.service';

import { Directive, ElementRef, Input } from '@angular/core';

import {UpperCaseDirective} from 'src/app/directive/upper-case.directive';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  usuarioForm: FormGroup;

  constructor(private registroService: UserRegistroService, private alertController: AlertController) {
    this.usuarioForm = this.createFormGroupUsuario();
  }

  createFormGroupUsuario() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      usuario: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  get nombre() { return this.usuarioForm.get('nombre'); }
  get apellidos() { return this.usuarioForm.get('apellidos'); }
  get dni() { return this.usuarioForm.get('dni'); }
  get usuario() { return this.usuarioForm.get('usuario'); }
  get password() { return this.usuarioForm.get('password'); }

  ngOnInit() {
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirme!',
      message: `Son los datos Correctos !!!`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Okay',
          handler: () => {
            console.log('Confirm Okay');
            this.guardarUsuario();
          }
        }
      ]
    });

    await alert.present();
  }

  guardarUsuario(){
    console.log("Formulario", this.usuarioForm.value);
    console.log("SE GUARDARÁ UN USUARIO");

    this.registroService.guardarNuevoUsuario(this.usuarioForm.value).then(()=>console.log("Se ingreso Correctamente"));

  }


  numberOnlyValidation(event: any) {
    const pattern = /[0-9.,]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }



  public cambiaUpper(event: any) {
    let inputChar = String.fromCharCode(event.charCode);
    event.target.value = event.target.value.toUpperCase() + inputChar.toUpperCase();

    event.preventDefault();
    console.log("Onchange", event);
  }

  public changeLower(event:any){
    let inputChar = String.fromCharCode(event.charCode);
    event.target.value = event.target.value.toLowerCase() + inputChar.toLowerCase();
    event.preventDefault();
    console.log(this.usuarioForm.value);
  }


  public pruebaForm(event:any){
    console.log(this.usuarioForm.get('usuario').value);
  }


}

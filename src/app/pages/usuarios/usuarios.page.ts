import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {

  usuarioForm: FormGroup;


  @ViewChild('passwordEyeRegister', { read: ElementRef }) passwordEye: ElementRef;
  passwordTypeInput  =  'password';
  constructor(private dataApi: DbDataService,
              private menuCtrl: MenuController) {
                this.menuCtrl.enable(true);
                this.usuarioForm = this.createFormGroupUsuario();
  }

  ngOnInit() {
  }

  createFormGroupUsuario() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      usuario: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rol: new FormControl('', Validators.required)
    });
  }

  get nombre() { return this.usuarioForm.get('nombre'); }
  get apellidos() { return this.usuarioForm.get('apellidos'); }
  get dni() { return this.usuarioForm.get('dni'); }
  get usuario() { return this.usuarioForm.get('usuario'); }
  get password() { return this.usuarioForm.get('password'); }
  get rol() { return this.usuarioForm.get('rol'); }


  guardarUsuario(){
    // const usuarioAux = {
    //   nombre: '',
    //   apellidos: '',
    //   dni: '',
    //   usuario: '',
    //   password: '',
    //   rol: ''
    // };

    // usuarioAux.nombre =  usuarioAux.nombre.toLocaleLowerCase();
    // usuarioAux.apellidos = this.capitalize(this.usuarioForm.get('apellidos').value);
    // usuarioAux.dni = this.usuarioForm.get('dni').value;
    // usuarioAux.usuario = this.usuarioForm.get('usuario').value;
    // usuarioAux.password = this.usuarioForm.get('password').value;
    // usuarioAux.rol = this.usuarioForm.get('rol').value;
    this.usuarioForm.value.nombre = this.usuarioForm.value.nombre.toLocaleLowerCase();
    this.usuarioForm.value.apellidos = this.usuarioForm.value.apellidos.toLocaleLowerCase();
    this.dataApi.guardarNuevoUsuario(this.usuarioForm.value).then(() => console.log('Se ingreso Correctamente'));
  }

  togglePasswordMode() {
    this.passwordTypeInput = this.passwordTypeInput === 'text' ? 'password' : 'text';
    const nativeEl = this.passwordEye.nativeElement.querySelector('input');
    const inputSelection = nativeEl.selectionStart;
    nativeEl.focus();
    setTimeout(() => {
        nativeEl.setSelectionRange(inputSelection, inputSelection);
    }, 1);
  }


  capitalize(text: string) {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i][0].toUpperCase() + words[i].substr(1);
    }
    return '' + words.join(' ');
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

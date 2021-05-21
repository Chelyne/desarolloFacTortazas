import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AdmiInterface } from '../../models/AdmiInterface';
import { StorageService } from '../../services/storage.service';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from '../../global/global.service';
import { EMAIL_REGEXP_PATTERN, StringOnlyValidation, NumberOnlyValidation} from 'src/app/global/validadores';


@Component({
  selector: 'app-agregar-editar-usuario',
  templateUrl: './agregar-editar-usuario.page.html',
  styleUrls: ['./agregar-editar-usuario.page.scss'],
})
export class AgregarEditarUsuarioPage implements OnInit {

  /** AFI */
  numberOnlyValidation = NumberOnlyValidation;
  stringOnlyValidation = StringOnlyValidation;

  usuarioModalForm: FormGroup;

  passwordTypeInput  =  'password';

  @Input() dataModal: {
    evento: 'actualizar' | 'agregar',
    usuario?: AdmiInterface
  };

  constructor(
    private dataApi: DataBaseService,
    private modalCtlr: ModalController,
    private storage: StorageService,
    private servGlobal: GlobalService
  ) {

    this.usuarioModalForm = this.createFormGroupUsuario();
  }


  ngOnInit() {
    if ( this.dataModal.evento === 'actualizar' ){
      this.usuarioModalForm = this.formForUpdate();
    }
  }

  createFormGroupUsuario() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]),
      dni: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      correo: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern(EMAIL_REGEXP_PATTERN)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rol: new FormControl('', Validators.required),
      sede: new FormControl('')
    });
  }

  formForUpdate() {
    return new FormGroup({
      nombre: new FormControl(this.dataModal.usuario.nombre, [Validators.required, Validators.minLength(3), Validators.maxLength(40)]),
      // tslint:disable-next-line:max-line-length
      apellidos: new FormControl(this.dataModal.usuario.apellidos, [Validators.required, Validators.minLength(3), Validators.maxLength(60)]),
      dni: new FormControl(this.dataModal.usuario.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      // tslint:disable-next-line:max-line-length
      correo: new FormControl(this.dataModal.usuario.correo, [Validators.required, Validators.minLength(3), Validators.pattern(EMAIL_REGEXP_PATTERN)]),
      password: new FormControl(this.dataModal.usuario.password, [Validators.required, Validators.minLength(6)]),
      rol: new FormControl(this.dataModal.usuario.rol, Validators.required),
      sede: new FormControl(this.dataModal.usuario.sede)
    });
  }

  get nombre() { return this.usuarioModalForm.get('nombre'); }
  get apellidos() { return this.usuarioModalForm.get('apellidos'); }
  get dni() { return this.usuarioModalForm.get('dni'); }
  get correo() { return this.usuarioModalForm.get('correo'); }
  get password() { return this.usuarioModalForm.get('password'); }
  get rol() { return this.usuarioModalForm.get('rol'); }

  execFun(){
    if (this.dataModal.evento === 'agregar'){
      this.guardarUsuario();

    }
    else if (this.dataModal.evento === 'actualizar'){
      this.actualizarUsuario();

    } else {
      console.log('La función no existe');
    }
  }

  guardarUsuario(){
    this.usuarioModalForm.value.nombre = this.nombre.value.toLowerCase();
    this.usuarioModalForm.value.apellidos = this.apellidos.value.toLowerCase();
    this.usuarioModalForm.value.sede = this.storage.datosAdmi.sede;

    this.dataApi.guardarUsuario(this.usuarioModalForm.value).then(() => {
      // console.log('Se ingreso Correctamente');
      this.servGlobal.presentToast('Se ingreso correctamente');
      this.usuarioModalForm.reset();
      this.salirDeModal();
    }
    );

  }


  actualizarUsuario(){
    this.usuarioModalForm.value.nombre = this.nombre.value.toLowerCase();
    this.usuarioModalForm.value.apellidos = this.apellidos.value.toLowerCase();
    this.dataApi.actualizarUsuario(this.dataModal.usuario.correo, this.usuarioModalForm.value).then(
      () => {
        this.servGlobal.presentToast('Datos actualizados correctamente');
        this.modalCtlr.dismiss();
      }
    );
  }


  salirDeModal(){
    this.modalCtlr.dismiss();
  }

  togglePasswordMode() {
    this.passwordTypeInput = this.passwordTypeInput === 'text' ? 'password' : 'text';
  }


  // numberOnlyValidation(event: any) {
  //   const pattern = /[0-9]/;
  //   const inputChar = String.fromCharCode(event.charCode);

  //   if (!pattern.test(inputChar)) {
  //     // invalid character, prevent input
  //     event.preventDefault();
  //   }
  // }

  // stringOnlyValidation(event: any) {
  //   const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
  //   const inputChar = String.fromCharCode(event.charCode);

  //   if (!pattern.test(inputChar)) {
  //     // invalid character, prevent input
  //     event.preventDefault();
  //   }
  // }



}

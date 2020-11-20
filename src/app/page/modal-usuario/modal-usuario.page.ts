import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Usuario } from 'src/app/interfaces/usuario';
import { UserRegistroService } from 'src/app/services/user-registro.service';

@Component({
  selector: 'app-modal-usuario',
templateUrl: './modal-usuario.page.html',
  styleUrls: ['./modal-usuario.page.scss'],
})
export class ModalUsuarioPage implements OnInit {

  // //constructor(private modalCtlr: ModalController){}

  // ngOnInit() {
  // }

  usuarioModalForm: FormGroup;
  passwordTypeInput  =  'password';

  @Input() eventoInvoker: string;
  @Input() tagInvoker: string;
  @Input() dataFromInvoker: Usuario;

  constructor(private registroService: UserRegistroService, private modalCtlr: ModalController,
    private toastCtrl: ToastController
    ) {
    this.usuarioModalForm = this.createFormGroupUsuario();

    console.log(this.eventoInvoker, this.tagInvoker, this.dataFromInvoker);


  }

  ngOnInit() {
    if(this.eventoInvoker === 'actualizarUsuario'){
      this.usuarioModalForm = this.getForUpdate();
    }
  }


  // formaterForm(){
  //   this.usuarioModalForm.value.nombre_modal = this.dataFromInvoker.nombre;
  //   this.usuarioModalForm.value.apellidos_modal = this.dataFromInvoker.apellidos;
  //   this.usuarioModalForm.value.dni_modal = this.dataFromInvoker.dni;
  //   this.usuarioModalForm.value.usuario_modal = this.dataFromInvoker.usuario;
  //   this.usuarioModalForm.value.password_modal = this.dataFromInvoker.password;
  //   this.usuarioModalForm.value.rol_moda = this.dataFromInvoker.rol;
  // }

  getForUpdate() {
    return new FormGroup({
      nombre_modal: new FormControl(this.dataFromInvoker.nombre, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos_modal: new FormControl(this.dataFromInvoker.apellidos, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni_modal: new FormControl(this.dataFromInvoker.dni,[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      usuario_modal: new FormControl(this.dataFromInvoker.usuario, [Validators.required, Validators.minLength(6)]),
      password_modal: new FormControl(this.dataFromInvoker.password, [Validators.required, Validators.minLength(6)]),
      rol_modal: new FormControl(this.dataFromInvoker.rol, Validators.required)
      //rol: new FormControl('')
    });
  }

  createFormGroupUsuario() {
    return new FormGroup({
      nombre_modal: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos_modal: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni_modal: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      usuario_modal: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password_modal: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rol_modal: new FormControl('', Validators.required)
      //rol: new FormControl('')
    });
  }

  get nombre_modal() { return this.usuarioModalForm.get('nombre_modal'); }
  get apellidos_modal() { return this.usuarioModalForm.get('apellidos_modal'); }
  get dni_modal() { return this.usuarioModalForm.get('dni_modal'); }
  get usuario_modal() { return this.usuarioModalForm.get('usuario_modal'); }
  get password_modal() { return this.usuarioModalForm.get('password_modal'); }
  get rol_modal() { return this.usuarioModalForm.get('rol_modal'); }

  guardarUsuario(){
    console.log("sssssssssssGUARDA EL USUARIO");
    const auxUser = {
      nombre : this.usuarioModalForm.value.nombre_modal.toLocaleLowerCase(),
      apellidos : this.usuarioModalForm.value.apellidos_modal.toLocaleLowerCase(),
      dni :this.usuarioModalForm.value.dni_modal,
      usuario :this.usuarioModalForm.value.usuario_modal,
      password :this.usuarioModalForm.value.password_modal,
      rol :this.usuarioModalForm.value.rol_modal
    };

    // this.usuarioModalForm.value.nombre_modal = this.usuarioModalForm.value.nombre_modal.toLocaleLowerCase();
    // this.usuarioModalForm.value.apellidos_modal = this.usuarioModalForm.value.apellidos_modal.toLocaleLowerCase();

    console.log("cccccccccccccccccccccccccccccc", auxUser);

    this.registroService.guardarNuevoUsuario(auxUser).then(
      () => {console.log('Se ingreso Correctamente');
      this.presentToast("Se ingreso correctamente");
      this.modalCtlr.dismiss();
      }
    );

  }

  actualizarUsuario(){
    console.log("dddddddddddddddddd ActualizarUsuario");


    console.log("sssssssssssGUARDA EL USUARIO");
    const auxUser = {
      nombre : this.usuarioModalForm.value.nombre_modal.toLocaleLowerCase(),
      apellidos : this.usuarioModalForm.value.apellidos_modal.toLocaleLowerCase(),
      dni :this.usuarioModalForm.value.dni_modal,
      usuario :this.usuarioModalForm.value.usuario_modal,
      password :this.usuarioModalForm.value.password_modal,
      rol :this.usuarioModalForm.value.rol_modal
    };

    // this.usuarioModalForm.value.nombre_modal = this.usuarioModalForm.value.nombre_modal.toLocaleLowerCase();
    // this.usuarioModalForm.value.apellidos_modal = this.usuarioModalForm.value.apellidos_modal.toLocaleLowerCase();

    console.log("cccccccccccccccccccccccccccccc", auxUser);

    this.registroService.actualizarUsuario(this.dataFromInvoker.id, auxUser).then(
      () => {console.log('Se ingreso Correctamente');
      this.presentToast("Se ingreso correctamente");
      this.modalCtlr.dismiss();
      }
    );

    // this.usuarioModalForm.value.nombre = this.usuarioModalForm.value.nombre.toLocaleLowerCase();
    // this.usuarioModalForm.value.apellidos = this.usuarioModalForm.value.apellidos.toLocaleLowerCase();
    // this.registroService.guardarNuevoUsuario(this.usuarioModalForm.value).then(() => console.log('Se ingreso Correctamente'));


    // this.registroService.collection('usuario')
    // .doc('claveDelItem')
    // .update({
    //   activo: true
    // });
  }


  // passwordTypeInput  =  'password';
  // togglePasswordMode() {
  //   this.passwordTypeInput = this.passwordTypeInput === 'text' ? 'password' : 'text';
  // }



  salirDeModal(){
    this.modalCtlr.dismiss();
  }


  // numberOnlyValidation(event: any) {
  //   const pattern = /[0-9]/;
  //   let inputChar = String.fromCharCode(event.charCode);

  //   if (!pattern.test(inputChar)) {
  //     // invalid character, prevent input
  //     event.preventDefault();
  //   }
  // }

  // stringOnlyValidation(event: any) {
  //   const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
  //   let inputChar = String.fromCharCode(event.charCode);

  //   if (!pattern.test(inputChar)) {
  //     // invalid character, prevent input
  //     event.preventDefault();
  //   }
  // }


  numberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  stringOnlyValidation(event: any) {
    const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  togglePasswordMode() {
    this.passwordTypeInput = this.passwordTypeInput === 'text' ? 'password' : 'text';
  }

  execFun(){
    if(this.eventoInvoker === 'guardarUsuario'){
      this.guardarUsuario();
    }
    else if(this.eventoInvoker === 'actualizarUsuario'){
      console.log("ActualizarUsuario");
      console.log("dataInvooooooooooooker", this.dataFromInvoker);
      this.actualizarUsuario();
    } else {
      console.log("La función no existe");
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

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

  usuarioModalForm: FormGroup;
  passwordTypeInput  =  'password';

  @Input() eventoInvoker: string;
  @Input() tagInvoker: string;
  @Input() dataInvoker: Usuario;


  constructor( 
    private registroService: UserRegistroService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController
  ) {

    this.usuarioModalForm = this.createFormGroupUsuario();
    //console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }


  ngOnInit() {
    if( this.eventoInvoker === 'actualizarUsuario' ){
      this.usuarioModalForm = this.formForUpdate();
    }
  }

  formForUpdate() {
    return new FormGroup({
      nombre: new FormControl(this.dataInvoker.nombre, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl(this.dataInvoker.apellidos, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl(this.dataInvoker.dni,[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      usuario: new FormControl(this.dataInvoker.usuario, [Validators.required, Validators.minLength(6)]),
      password: new FormControl(this.dataInvoker.password, [Validators.required, Validators.minLength(6)]),
      rol: new FormControl(this.dataInvoker.rol, Validators.required)
      //rol: new FormControl('')
    });
  }

  createFormGroupUsuario() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      usuario: new FormControl('', [Validators.required, Validators.minLength(6)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      rol: new FormControl('', Validators.required)
      //rol: new FormControl('')
    });
  }

  get nombre() { return this.usuarioModalForm.get('nombre'); }
  get apellidos() { return this.usuarioModalForm.get('apellidos'); }
  get dni() { return this.usuarioModalForm.get('dni'); }
  get usuario() { return this.usuarioModalForm.get('usuario'); }
  get password() { return this.usuarioModalForm.get('password'); }
  get rol() { return this.usuarioModalForm.get('rol'); }


  guardarUsuario(){
    //console.log("sssssssssssGUARDA EL USUARIO");
    const auxUser = {
      nombre : this.usuarioModalForm.value.nombre.toLocaleLowerCase(),
      apellidos : this.usuarioModalForm.value.apellidos.toLocaleLowerCase(),
      dni :this.usuarioModalForm.value.dni,
      usuario :this.usuarioModalForm.value.usuario,
      password :this.usuarioModalForm.value.password,
      rol :this.usuarioModalForm.value.rol
    };


    this.registroService.guardarUsuario(auxUser).then(
      () => {console.log('Se ingreso Correctamente');
        this.presentToast("Se ingreso correctamente");
        this.usuarioModalForm.reset()
        //this.modalCtlr.dismiss();
      }
    );

  }


  actualizarUsuario(){

    const auxUser = {
      nombre : this.usuarioModalForm.value.nombre.toLocaleLowerCase(),
      apellidos : this.usuarioModalForm.value.apellidos.toLocaleLowerCase(),
      dni :this.usuarioModalForm.value.dni,
      usuario :this.usuarioModalForm.value.usuario,
      password :this.usuarioModalForm.value.password,
      rol :this.usuarioModalForm.value.rol
    };

    //console.log("cccccccccccccccccccccccccccccc", auxUser);

    this.registroService.actualizarUsuario(this.dataInvoker.id, auxUser).then(
      () => {console.log('Se ingreso Correctamente');
      this.presentToast("Datos actualizados correctamente");
      this.modalCtlr.dismiss();
      }
    );

  }


  salirDeModal(){
    this.modalCtlr.dismiss();
  }


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


  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
  }


  execFun(){
    if(this.eventoInvoker === 'guardarUsuario'){
      this.guardarUsuario();

    }
    else if(this.eventoInvoker === 'actualizarUsuario'){
      this.actualizarUsuario();

    } else {
      console.log("La función no existe");

    }
  }


}

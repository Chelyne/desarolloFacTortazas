import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {  ModalController } from '@ionic/angular';
import { UserRegistroService } from 'src/app/services/user-registro.service';

import { Usuario } from 'src/app/interfaces/usuario';
import { ModalUsuarioPage } from '../modal-usuario/modal-usuario.page';

@Component({
  selector: 'app-registrar-usuario',
  templateUrl: './registrar-usuario.page.html',
  styleUrls: ['./registrar-usuario.page.scss'],
})
export class RegistrarUsuarioPage implements OnInit {

  // usuarioForm: FormGroup;
  usuariosList: Usuario[];
  usuario: Usuario;

  codid: string = '';

  eventToSendModel: string;
  tagToSendModel: string;
  dataToModel: Usuario;


  constructor(private dataApi: UserRegistroService, private modalCtlr: ModalController) {
    //this.usuarioForm = this.createFormGroupUsuario();
    this.getUsuarios();
  }

  ngOnInit() {
  }

  // createFormGroupUsuario() {
  //   return new FormGroup({
  //     nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
  //     apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
  //     dni: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
  //     usuario: new FormControl('', [Validators.required, Validators.minLength(6)]),
  //     password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  //     rol: new FormControl('', Validators.required)
  //     //rol: new FormControl('')
  //   });
  // }

  // get nombre() { return this.usuarioForm.get('nombre'); }
  // get apellidos() { return this.usuarioForm.get('apellidos'); }
  // get dni() { return this.usuarioForm.get('dni'); }
  // get usuario() { return this.usuarioForm.get('usuario'); }
  // get password() { return this.usuarioForm.get('password'); }
  // get rol() { return this.usuarioForm.get('rol'); }


  // guardarUsuario(){
  //   // console.log("Formulario", this.usuarioForm.value);
  //   // console.log("SE GUARDARÁ UN USUARIO");
  //   let usuarioAux = {
  //     nombre: "",
  //     apellidos: "",
  //     dni: "",
  //     usuario: "",
  //     password: "",
  //     rol: ""
  //   }

  //   usuarioAux.nombre = this.capitalize(this.usuarioForm.get('nombre').value);
  //   usuarioAux.apellidos = this.capitalize(this.usuarioForm.get('apellidos').value);
  //   usuarioAux.dni = this.usuarioForm.get('dni').value;
  //   usuarioAux.usuario = this.usuarioForm.get('usuario').value;
  //   usuarioAux.password = this.usuarioForm.get('password').value;
  //   usuarioAux.rol= this.usuarioForm.get('rol').value;

  //   //console.log(usuarioAux);
  //   //this.dataApi.guardarNuevoUsuario(this.usuarioForm.value).then(()=>console.log("Se ingreso Correctamente"));
  //   this.dataApi.guardarNuevoUsuario(usuarioAux).then(()=>console.log("Se ingreso Correctamente"));
  // }


  // // // @ViewChild('passwordEyeRegister', { read: ElementRef }) passwordEye: ElementRef;
  // // // Seleccionamos el elemento con el nombre que le pusimos con el #
  // // passwordTypeInput  =  'password';
  // // // Variable para cambiar dinamicamente el tipo de Input que por defecto sera 'password'

  // // Esta función verifica si el tipo de campo es texto lo cambia a password y viceversa, además verificara el icono si es 'eye-off' lo cambiara a 'eye' y viceversa
  // togglePasswordMode() {
  //   //cambiar tipo input
  //   this.passwordTypeInput = this.passwordTypeInput === 'text' ? 'password' : 'text';
  //   //obtener el input
  //   // const nativeEl = this.passwordEye.nativeElement.querySelector('input');
  //   // //obtener el indice de la posición del texto actual en el input
  //   // const inputSelection = nativeEl.selectionStart;
  //   // //ejecuto el focus al input
  //   // nativeEl.focus();
  //   // //espero un milisegundo y actualizo la posición del indice del texto
  //   // setTimeout(() => {
  //   //     nativeEl.setSelectionRange(inputSelection, inputSelection);
  //   // }, 1);
  // }


  // capitalize(text: String) {
  //   let words = text.split(" ");
  //   for (let i = 0; i < words.length; i++) {
  //     words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  //   }
  //   return ""+words.join(" ");
  // }

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




  getUsuarios(){
    console.log("getUsuarios");

     this.dataApi.ObtenerListaUsuarios().subscribe(data => {
       console.log(data);
       this.usuariosList = data;
       console.log(this.usuariosList.length);

     })

    //console.log(this.dataApi.ObtenerListaUsuarios());
  }

  async abrirModal(){

    const modal =  await this.modalCtlr.create({
      component: ModalUsuarioPage,
      componentProps: {
        eventoInvoker: this.eventToSendModel,
        tagInvoker: this.tagToSendModel,
        dataFromInvoker: this.dataToModel
      }
    });
    await modal.present()
  }

  newUserModal(){
    this.eventToSendModel = 'guardarUsuario';
    this.tagToSendModel = 'Guardar';
    this.abrirModal();
  }

  //TODO - como conseguir el dni del campo
  updateUserData(usuario: Usuario){

    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log(usuario);
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    const idUser = usuario.id;

    // this.dataApi.ObtenerUnUsuario(idUser).subscribe(data => {
    //   this.usuario = data[0];
    //   console.log(this.usuario);
    // });

    this.eventToSendModel = 'actualizarUsuario';
    this.tagToSendModel = 'Actualizar';
    this.dataToModel = usuario;
    // this.dat
    setTimeout(() => {
      this.abrirModal();
    }, 1000);

  }



}

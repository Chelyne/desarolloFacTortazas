import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { ClienteInterface } from 'src/app/interfaces/cliente-interface';

import { RegistrarClienteService } from 'src/app/services/registrar-cliente.service';


@Component({
  selector: 'app-modal-cliente',
  templateUrl: './modal-cliente.page.html',
  styleUrls: ['./modal-cliente.page.scss'],
})
export class ModalClientePage implements OnInit {

  clienteModalForm: FormGroup;
  passwordTypeInput  =  'password';

  @Input() eventoInvoker: string;
  @Input() tagInvoker: string;
  @Input() dataInvoker: ClienteInterface;

  constructor(
    private registroService: RegistrarClienteService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController
  ) {

    this.clienteModalForm = this.createFormCliente();
    console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }

  ngOnInit() {
    if( this.eventoInvoker === 'actualizarCliente' ){
      this.clienteModalForm = this.formForUpdate();
    }
    console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }



  createFormCliente(){
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      telefono: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  get nombre() { return this.clienteModalForm.get('nombre'); }
  get apellidos() { return this.clienteModalForm.get('apellidos'); }
  get dni() { return this.clienteModalForm.get('dni'); }
  get telefono() { return this.clienteModalForm.get('telefono'); }
  get direccion() { return this.clienteModalForm.get('direccion'); }
  get email() { return this.clienteModalForm.get('email'); }

  formForUpdate() {
    return new FormGroup({
      nombre: new FormControl(this.dataInvoker.nombre, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      apellidos: new FormControl(this.dataInvoker.apellidos, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      dni: new FormControl(this.dataInvoker.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
      telefono: new FormControl(this.dataInvoker.telefono, [Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataInvoker.direccion, [Validators.required, Validators.minLength(3)]),
      email: new FormControl(this.dataInvoker.email, [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    })
  }

  guardarCliente(){
    //console.log("sssssssssssGUARDA EL USUARIO");
    const auxCliente = {
      nombre : this.clienteModalForm.value.nombre.toLocaleLowerCase(),
      apellidos : this.clienteModalForm.value.apellidos.toLocaleLowerCase(),
      dni :this.clienteModalForm.value.dni,
      telefono :this.clienteModalForm.value.telefono,
      direccion :this.clienteModalForm.value.direccion,
      email :this.clienteModalForm.value.email
    };


    this.registroService.guardarCliente(auxCliente).then(
      () => {console.log('Se ingreso Correctamente');
        this.presentToast("Se ingreso correctamente");
        this.clienteModalForm.reset()
        //this.modalCtlr.dismiss();
      }
    );

  }


  actualizarUsuario(){

    const auxCliente = {
      nombre : this.clienteModalForm.value.nombre.toLocaleLowerCase(),
      apellidos : this.clienteModalForm.value.apellidos.toLocaleLowerCase(),
      dni :this.clienteModalForm.value.dni,
      telefono :this.clienteModalForm.value.telefono,
      direccion :this.clienteModalForm.value.direccion,
      email :this.clienteModalForm.value.email
    };

    //console.log("cccccccccccccccccccccccccccccc", auxUser);

    this.registroService.actualizarCliente(this.dataInvoker.id, auxCliente).then(
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


  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
  }


  execFun(){
    if(this.eventoInvoker === 'guardarCliente'){
      this.guardarCliente();

    }
    else if(this.eventoInvoker === 'actualizarCliente'){
      this.actualizarUsuario();

    } else {
      console.log("La función no existe");

    }
  }

}

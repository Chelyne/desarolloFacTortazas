import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegistrarClienteService } from 'src/app/services/registrar-cliente.service';

import { ClienteInterface } from 'src/app/interfaces/cliente-interface';
import { ModalController } from '@ionic/angular';
import { ModalClientePage } from '../modals/cliente/modal-cliente/modal-cliente.page';

@Component({
  selector: 'app-registrar-cliente',
  templateUrl: './registrar-cliente.page.html',
  styleUrls: ['./registrar-cliente.page.scss'],
})
export class RegistrarClientePage implements OnInit {

  clientesList: ClienteInterface[];
  clienteItem: ClienteInterface;

  eventToSendModel: string;
  tagToSendModel: string;
  dataToModel: ClienteInterface;

  constructor(private dataApi: RegistrarClienteService, private modalCtlr: ModalController) {
    //this.usuarioForm = this.createFormGroupUsuario();
    this.ObtenerClientes();
  }

  ngOnInit() {
  }

  // createFormCliente(){
  //   return new FormGroup({
  //     nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
  //     apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
  //     dni: new FormControl('',[Validators.required, Validators.minLength(8), Validators.maxLength(8)]),
  //     telefono: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
  //     direccion: new FormControl('', [Validators.required, Validators.minLength(3)]),
  //     email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
  //   });
  // }

  // get nombre() { return this.clienteForm.get('nombre'); }
  // get apellidos() { return this.clienteForm.get('apellidos'); }
  // get dni() { return this.clienteForm.get('dni'); }
  // get telefono() { return this.clienteForm.get('telefono'); }
  // get direccion() { return this.clienteForm.get('direccion'); }
  // get email() { return this.clienteForm.get('email'); }


  // guardarCliente(){
  //   //console.log(this.clienteForm.value);
  //   this.clienteForm.value.nombre = this.clienteForm.value.nombre.toLocaleLowerCase();
  //   this.clienteForm.value.apellidos = this.clienteForm.value.apellidos.toLocaleLowerCase();
  //   this.registroService.guardarCliente(this.clienteForm.value).then(()=>console.log("Se ingreso Correctamente el cliente"));
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


  ObtenerClientes(){
    console.log("getUsuarios");

    this.dataApi.ObtenerListaClientes().subscribe(data => {
      console.log(data);
      this.clientesList = data;
      //console.log(this.usuariosList.length);
    });

  }

  async abrirModal(){

    const modal =  await this.modalCtlr.create({
      component: ModalClientePage,
      componentProps: {
        eventoInvoker: this.eventToSendModel,
        tagInvoker: this.tagToSendModel,
        dataInvoker: this.dataToModel
      }
    });

    await modal.present()
  }

  //Modal for new user
  newClienteModal(){
    this.eventToSendModel = 'guardarCliente';
    this.tagToSendModel = 'Guardar';
    this.abrirModal();
  }

  updateClienteData(cliente: ClienteInterface){

    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log(cliente);
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

    // this.dataApi.ObtenerUnUsuario(idUser).subscribe(data => {
    //   this.cliente = data[0];
    //   console.log(this.cliente);
    // });

    this.eventToSendModel = 'actualizarCliente';
    this.tagToSendModel = 'Actualizar';
    this.dataToModel = cliente;

    setTimeout(() => {
      this.abrirModal();
    }, 500);
  }



}

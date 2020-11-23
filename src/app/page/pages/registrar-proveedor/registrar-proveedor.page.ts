import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Proveedor } from 'src/app/interfaces/proveedor';
import { ProveedorRegistroService } from 'src/app/services/proveedor-registro.service';
import { ModalProveedorPage } from '../../modals/proveedor/modal-proveedor/modal-proveedor.page';

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.page.html',
  styleUrls: ['./registrar-proveedor.page.scss'],
})
export class RegistrarProveedorPage implements OnInit {

  proveedoresList: Proveedor[];
  proveedoresItem: Proveedor;

  eventToSendModel: string;
  tagToSendModel: string;
  dataToModel: Proveedor;


  constructor(private dataApi: ProveedorRegistroService, private modalCtlr: ModalController) {
    //this.proveedoresForm = this.createFormGroupProveedor();
    this.ObtenerProveedores();
  }

  ngOnInit() {
  }

  // createFormProveedor() {
  //   return new FormGroup({
  //     nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
  //     ruc: new FormControl('', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
  //     telefono: new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
  //     direccion: new FormControl('', [Validators.required, Validators.minLength(3)]),
  //     email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
  //   });
  // }

  // get nombre() { return this.proveedorForm.get('nombre'); }
  // get ruc() { return this.proveedorForm.get('ruc'); }
  // get telefono() { return this.proveedorForm.get('telefono'); }
  // get direccion() { return this.proveedorForm.get('direccion'); }
  // get email() { return this.proveedorForm.get('email'); }

  // guardarProveedor(){
  //   console.log(this.proveedorForm.value);
  //   this.registroService.guardarProveedor(this.proveedorForm.value).then(()=>console.log("Se ingreso Correctamente"));
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

  ObtenerProveedores(){
    console.log("getProveedores");

    this.dataApi.ObtenerListaProveedors().subscribe(data => {
      console.log(data);
      this.proveedoresList = data;
      //console.log(this.proveedoressList.length);
    });

  }


  async abrirModal(){

    const modal =  await this.modalCtlr.create({
      component: ModalProveedorPage,
      componentProps: {
        eventoInvoker: this.eventToSendModel,
        tagInvoker: this.tagToSendModel,
        dataInvoker: this.dataToModel
      }
    });

    await modal.present()
  }

  //Modal for new user
  newProveedorModal(){
    this.eventToSendModel = 'guardarProveedor';
    this.tagToSendModel = 'Guardar';
    this.abrirModal();
  }


  updateProveedorData(proveedor: Proveedor){

    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log(proveedor);
    console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

    // this.dataApi.ObtenerUnProveedor(idProveedor).subscribe(data => {
    //   this.proveedor = data[0];
    //   console.log(this.proveedor);
    // });

    this.eventToSendModel = 'actualizarProveedor';
    this.tagToSendModel = 'Actualizar';
    this.dataToModel = proveedor;

    setTimeout(() => {
      this.abrirModal();
    }, 500);

  }

}

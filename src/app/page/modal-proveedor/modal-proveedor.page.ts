import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { Proveedor } from 'src/app/interfaces/proveedor';
import { ProveedorRegistroService } from 'src/app/services/proveedor-registro.service';

@Component({
  selector: 'app-modal-proveedor',
  templateUrl: './modal-proveedor.page.html',
  styleUrls: ['./modal-proveedor.page.scss'],
})
export class ModalProveedorPage implements OnInit {

  proveedorModalForm: FormGroup;

  @Input() eventoInvoker: string;
  @Input() tagInvoker: string;
  @Input() dataInvoker: Proveedor;


  constructor(
    private registroService: ProveedorRegistroService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController
  ) {

    this.proveedorModalForm = this.createFormProveedor();
    //console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }


  ngOnInit() {
    if( this.eventoInvoker === 'actualizarProveedor' ){
      this.proveedorModalForm = this.formForUpdate();
    }
  }

  createFormProveedor() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      ruc: new FormControl('', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
      telefono: new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  get nombre() { return this.proveedorModalForm.get('nombre'); }
  get ruc() { return this.proveedorModalForm.get('ruc'); }
  get telefono() { return this.proveedorModalForm.get('telefono'); }
  get direccion() { return this.proveedorModalForm.get('direccion'); }
  get email() { return this.proveedorModalForm.get('email'); }

  formForUpdate(){
    return new FormGroup({
      nombre: new FormControl(this.dataInvoker.nombre, [Validators.required, Validators.minLength(3)]),
      ruc: new FormControl(this.dataInvoker.ruc, [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
      telefono: new FormControl(this.dataInvoker.telefono, [Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataInvoker.direccion, [Validators.required, Validators.minLength(3)]),
      email: new FormControl(this.dataInvoker.email, [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }


  guardarProveedor(){
    console.log(this.proveedorModalForm.value);
    this.registroService.guardarProveedor(this.proveedorModalForm.value).then(()=>{
      console.log("Se ingreso Correctamente")
      this.presentToast("Datos guardados correctamente");
      //this.modalCtlr.dismiss();
    });
  }

  actualizarProveedor(){

    // const auxUser = {
    //   nombre : this.usuarioModalForm.value.nombre.toLocaleLowerCase(),
    //   apellidos : this.usuarioModalForm.value.apellidos.toLocaleLowerCase(),
    //   dni :this.usuarioModalForm.value.dni,
    //   usuario :this.usuarioModalForm.value.usuario,
    //   password :this.usuarioModalForm.value.password,
    //   rol :this.usuarioModalForm.value.rol
    // };

    //console.log("cccccccccccccccccccccccccccccc", auxUser);

    this.registroService.actualizarProveedor(this.dataInvoker.id, this.proveedorModalForm.value).then(
      () => {console.log('Se ingreso Correctamente');
      this.presentToast("Datos actualizados correctamente");
      this.modalCtlr.dismiss();
      }
    );

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
    if(this.eventoInvoker === 'guardarProveedor'){
      this.guardarProveedor();

    }
    else if(this.eventoInvoker === 'actualizarProveedor'){
      this.actualizarProveedor();

    } else {
      console.log("La función no existe");

    }


  
  }

  salirDeModal(){
    this.modalCtlr.dismiss();
  }






}

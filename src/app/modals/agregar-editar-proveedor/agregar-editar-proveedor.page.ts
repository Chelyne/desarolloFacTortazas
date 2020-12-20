import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { DbDataService } from 'src/app/services/db-data.service';

@Component({
  selector: 'app-agregar-editar-proveedor',
  templateUrl: './agregar-editar-proveedor.page.html',
  styleUrls: ['./agregar-editar-proveedor.page.scss'],
})
export class AgregarEditarProveedorPage implements OnInit {

  proveedorModalForm: FormGroup;

  @Input() eventoInvoker: string;
  @Input() tagInvoker: string;
  @Input() titleInvoker: string;
  @Input() dataInvoker: ProveedorInterface;


  constructor(
    private dataApi: DbDataService,
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
      ruc: new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
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
      ruc: new FormControl(this.dataInvoker.ruc, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      telefono: new FormControl(this.dataInvoker.telefono, [Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataInvoker.direccion, [Validators.required, Validators.minLength(3)]),
      email: new FormControl(this.dataInvoker.email, [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
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

  guardarProveedor(){
    // console.log(this.proveedorModalForm.value);
    this.dataApi.guardarProveedor(this.proveedorModalForm.value).then(()=>{
      //console.log("Se ingreso Correctamente")
      this.presentToast("Datos guardados correctamente");
      //this.modalCtlr.dismiss();
    });
  }

  actualizarProveedor(){

    this.dataApi.actualizarProveedor(this.dataInvoker.id, this.proveedorModalForm.value).then(
      () => {console.log('Se ingreso Correctamente');
      this.presentToast("Datos actualizados correctamente");
      this.modalCtlr.dismiss();
      }
    );

  }


  salirDeModal(){
    this.modalCtlr.dismiss();
  }


  async presentToast(message: string){
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });

    toast.present();
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

}

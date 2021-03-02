import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

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

  typoDocumento = 'ruc';
  consultando: boolean;
  encontrado: boolean;
  constructor(
    private dataApi: DbDataService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController,
    private storage: StorageService,
    private http: HttpClient
  ) {
    this.proveedorModalForm = this.createFormProveedor();
    // console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }


  ngOnInit() {
    if ( this.eventoInvoker === 'actualizarProveedor' ){
      this.proveedorModalForm = this.formForUpdate();
    }

    console.log('datainvoker', this.dataInvoker);
  }

  createFormProveedor() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      // ruc: new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      tipoDocumento: new FormControl('ruc', [Validators.required]),
      numeroDocumento: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
      telefono: new FormControl('', [Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.minLength(3)]),
      email: new FormControl('', [Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  get nombre() { return this.proveedorModalForm.get('nombre'); }
  // get ruc() { return this.proveedorModalForm.get('ruc'); }
  get tipoDocumento() { return this.proveedorModalForm.get('tipoDocumento'); }
  get numeroDocumento() { return this.proveedorModalForm.get('numeroDocumento'); }
  get telefono() { return this.proveedorModalForm.get('telefono'); }
  get direccion() { return this.proveedorModalForm.get('direccion'); }
  get email() { return this.proveedorModalForm.get('email'); }

  formForUpdate(){
    return new FormGroup({
      nombre: new FormControl(this.dataInvoker.nombre, [Validators.required, Validators.minLength(3)]),
      // ruc: new FormControl(this.dataInvoker.ruc, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      tipoDocumento: new FormControl(this.dataInvoker.tipoDocumento, [Validators.required]),
      numeroDocumento: new FormControl(this.dataInvoker.numeroDocumento, [Validators.required]),
      telefono: new FormControl(this.dataInvoker.telefono, [Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataInvoker.direccion, [Validators.minLength(3)]),
      email: new FormControl(this.dataInvoker.email, [Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  siRucoDni(){
    const typeDoc = this.proveedorModalForm.value.tipoDocumento;
    if (typeDoc === 'ruc'){
      this.proveedorModalForm.setControl(
        'numeroDocumento',
        new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)])
      );

      this.typoDocumento = 'ruc';
    } else if (typeDoc === 'dni'){
      this.proveedorModalForm.setControl(
        'numeroDocumento',
        new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)])
      );

      this.typoDocumento = 'dni';
    } else {
      console.log('Documento no valido');
    }
  }


  execFun(){
    if (this.eventoInvoker === 'guardarProveedor'){
      this.guardarProveedor();

    }
    else if (this.eventoInvoker === 'actualizarProveedor'){
      this.actualizarProveedor();

    } else {
      console.log('La función no existe');
    }

  }

  guardarProveedor(){
    // console.log(this.proveedorModalForm.value);
    this.dataApi.guardarProveedor(this.proveedorModalForm.value).then(() => {
      // console.log("Se ingreso Correctamente")
      this.presentToast('Datos guardados correctamente');
      this.modalCtlr.dismiss();
      this.proveedorModalForm.reset();

    });
  }

  actualizarProveedor(){

    this.dataApi.actualizarProveedor(this.dataInvoker.id, this.proveedorModalForm.value).then(
        () => {
          console.log('Se ingreso Correctamente');
          this.presentToast('Datos actualizados correctamente');
          this.modalCtlr.dismiss();
      }
    );

  }


  cerrarModal(){
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

  // consulta sunat

  consultaSunat(event) {
    console.log(event.detail.value);
    if (this.typoDocumento === 'dni') {
      if (event.detail.value.length === 8) {
        this.consultando = true;
        const httpOptions = {
          headers: new HttpHeaders({
            // 'Content-Type':  'application/json',
            // tslint:disable-next-line:object-literal-key-quotes
            'Authorization': 'token k4d2956bd531ab61d44f4fa07304b20e13913815'
          })
        };
        this.http.get('https://dni.optimizeperu.com/api/persons/' + event.detail.value).subscribe((data: any) => {
          console.log(data);
          if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas' && data.name) {
            this.encontrado = true;
            this.proveedorModalForm.value.nombre = data.name + ' ' + data.first_name + ' ' + data.last_name;
            this.consultando = false;
          } else {
            this.encontrado = false;
          }
        }, err => {
          this.consultando = false;
          this.encontrado = false;
        });
      }
    } else {
      if (event.detail.value.length === 11) {
        this.consultando = true;
        const httpOptions = {
          headers: new HttpHeaders({
            // 'Content-Type':  'application/json',
            // tslint:disable-next-line:object-literal-key-quotes
            'Authorization': 'token k4d2956bd531ab61d44f4fa07304b20e13913815'
          })
        };
        const url = 'https://dni.optimizeperu.com/api/company/';
        this.http.get('https://dniruc.apisperu.com/api/v1/ruc/' + event.detail.value + '?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFpaXp4Ym92c2dxcnRpZ2J3cEBuaXdnaHguY29tIn0.BwArIEbkSUE_GuXwPjETGTLvl88rhANKTsVcA7NY-WE').subscribe((data: any) => {
          if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas' && data.razonSocial && data.direccion) {
            this.encontrado = true;
            console.log(data);
            this.proveedorModalForm.setControl('nombre', new FormControl(data.razonSocial, [Validators.minLength(3)]));
            this.proveedorModalForm.setControl('direccion', new FormControl(data.direccion, [Validators.minLength(3)]));
            console.log(this.proveedorModalForm.value.direccion);
            this.consultando = false;
          } else {
            this.encontrado = false;
          }
        }, err => {
          this.consultando = false;
          this.encontrado = false;
        });
      }
    }
  }

}

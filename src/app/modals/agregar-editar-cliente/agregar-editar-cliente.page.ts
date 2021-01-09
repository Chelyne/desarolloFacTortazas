import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-agregar-editar-cliente',
  templateUrl: './agregar-editar-cliente.page.html',
  styleUrls: ['./agregar-editar-cliente.page.scss'],
})
export class AgregarEditarClientePage implements OnInit {

  clienteModalForm: FormGroup;
  // passwordTypeInput  =  'password';

  @Input() eventoInvoker: string;
  @Input() titleInvoker: string;
  @Input() tagInvoker: string;
  @Input() dataInvoker: ClienteInterface;
  typoDocumento = 'dni';

  constructor(
    private dataApi: DbDataService,
    private modalCtlr: ModalController,
    private toastCtrl: ToastController,
    private storage: StorageService,
    private http: HttpClient
  ) {

    this.clienteModalForm = this.createFormCliente();
    console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }

  ngOnInit() {
    if ( this.eventoInvoker === 'actualizarCliente' ){
      this.clienteModalForm = this.formForUpdate();
    }
    console.log(this.eventoInvoker, this.tagInvoker, this.dataInvoker);
  }


  createFormCliente(){
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      tipoDoc: new FormControl('dni', [Validators.required]),
      // apellidos: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      numDoc: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
      celular: new FormControl('', [Validators.minLength(9), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.minLength(3)]),
      email: new FormControl('', [Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  get nombre() { return this.clienteModalForm.get('nombre'); }
  get apellidos() { return this.clienteModalForm.get('apellidos'); }
  get numDoc() { return this.clienteModalForm.get('numDoc'); }
  get celular() { return this.clienteModalForm.get('celular'); }
  get direccion() { return this.clienteModalForm.get('direccion'); }
  get email() { return this.clienteModalForm.get('email'); }

  formForUpdate() {
    return new FormGroup({
      nombre: new FormControl(this.dataInvoker.nombre, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      tipoDoc: new FormControl(this.dataInvoker.tipoDoc, [Validators.required]),
      // tslint:disable-next-line:max-line-length
      // apellidos: new FormControl(this.dataInvoker.apellidos, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      numDoc: new FormControl(this.dataInvoker.numDoc, [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
      celular: new FormControl(this.dataInvoker.celular, [Validators.minLength(9), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataInvoker.direccion, [Validators.minLength(3)]),
      email: new FormControl(this.dataInvoker.email, [Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  siRucoDni(){
    const typeDoc = this.clienteModalForm.value.tipoDoc;
    if (typeDoc === 'ruc'){
      this.clienteModalForm.setControl(
        'numDoc',
        new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)])
      );

      this.typoDocumento = 'ruc';
    } else if (typeDoc === 'dni'){
      this.clienteModalForm.setControl(
        'numDoc',
        new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)])
      );

      this.typoDocumento = 'dni';
    } else {
      console.log('Documento no valido');
    }
  }

  execFun(){
    if (this.eventoInvoker === 'guardarCliente'){
      this.guardarCliente();

    }
    else if (this.eventoInvoker === 'actualizarCliente'){
      this.actualizarCliente();

    } else {
      console.log('La función no existe');

    }
  }

  guardarCliente(){
    this.clienteModalForm.value.nombre = this.nombre.value.toLowerCase();
    // this.clienteModalForm.value.apellidos = this.apellidos.value.toLowerCase();

    this.dataApi.guardarCliente(this.clienteModalForm.value).then(
      () => {
        console.log('Se ingreso Correctamente');
        this.presentToast('Se ingreso correctamente');
        this.clienteModalForm.reset();
        this.modalCtlr.dismiss();
      }
    );

  }


  actualizarCliente(){
    this.clienteModalForm.value.nombre = this.nombre.value.toLowerCase();
    // this.clienteModalForm.value.apellidos = this.apellidos.value.toLowerCase();

    this.dataApi.actualizarCliente(this.dataInvoker.id, this.clienteModalForm.value).then(
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

  // CONSULTA DATOS SUNAT

  consultaSunat(event) {
    console.log(event.detail.value);
    if (this.typoDocumento === 'dni') {
      if (event.detail.value.length === 8) {
        const httpOptions = {
          headers: new HttpHeaders({
            // 'Content-Type':  'application/json',
            // tslint:disable-next-line:object-literal-key-quotes
            'Authorization': 'token k4d2956bd531ab61d44f4fa07304b20e13913815'
          })
        };
        this.http.get('https://dni.optimizeperu.com/api/persons/' + event.detail.value).subscribe((data: any) => {
          console.log(data);
          if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas') {
            this.clienteModalForm.value.nombre = data.name + ' ' + data.first_name + ' ' + data.last_name;
          }
        });
      }
    } else {
      if (event.detail.value.length === 11) {
        const httpOptions = {
          headers: new HttpHeaders({
            // 'Content-Type':  'application/json',
            // tslint:disable-next-line:object-literal-key-quotes
            'Authorization': 'token k4d2956bd531ab61d44f4fa07304b20e13913815'
          })
        };
        this.http.get('https://dni.optimizeperu.com/api/company/' + event.detail.value).subscribe((data: any) => {
          if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas') {
            console.log(data);
            this.clienteModalForm.value.direccion = data.domicilio_fiscal;
            this.clienteModalForm.value.nombre = data.razon_social;
            console.log(this.clienteModalForm.value);
          }
        });
      }
    }
  }


}

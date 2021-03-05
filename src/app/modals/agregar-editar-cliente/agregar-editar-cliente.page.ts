import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-agregar-editar-cliente',
  templateUrl: './agregar-editar-cliente.page.html',
  styleUrls: ['./agregar-editar-cliente.page.scss'],
})
export class AgregarEditarClientePage implements OnInit {

  clienteModalForm: FormGroup;
  typoDocumento = 'dni';

  @Input() dataModal: {
    evento: 'actualizar' | 'agregar',
    cliente?: ClienteInterface
  };

  consultando: boolean;
  encontrado: boolean;

  constructor(
    private modalCtlr: ModalController,
    private http: HttpClient
  ) {

    this.clienteModalForm = this.createFormCliente();
  }

  ngOnInit() {
    if ( this.dataModal.evento === 'actualizar' ){
      this.clienteModalForm = this.formForUpdate();
    }
  }

  createFormCliente(){
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      tipoDoc: new FormControl('dni', [Validators.required]),
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
      nombre: new FormControl(this.dataModal.cliente.nombre, [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$')]),
      tipoDoc: new FormControl(this.dataModal.cliente.tipoDoc, [Validators.required]),
      numDoc: new FormControl(this.dataModal.cliente.numDoc, [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
      celular: new FormControl(this.dataModal.cliente.celular, [Validators.minLength(9), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataModal.cliente.direccion, [Validators.minLength(3)]),
      email: new FormControl(this.dataModal.cliente.email, [Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
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
    if (this.dataModal.evento === 'agregar'){
      this.clienteModalForm.value.nombre = this.nombre.value.toLowerCase();
      this.modalCtlr.dismiss({
        data: this.clienteModalForm.value,
        evento: this.dataModal.evento
      }).then(() => {
        this.clienteModalForm.reset();
      });
    }
    else if (this.dataModal.evento === 'actualizar'){
      this.clienteModalForm.value.nombre = this.nombre.value.toLowerCase();
      this.modalCtlr.dismiss({
        data: this.clienteModalForm.value,
        evento: this.dataModal.evento,
        id: this.dataModal.cliente.id
      }).then(() => {
        this.clienteModalForm.reset();
      });
    } else {
      console.log('La función no existe');
    }
  }

  cerrarModal(){
    this.modalCtlr.dismiss();
  }

  numberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  stringOnlyValidation(event: any) {
    const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  // CONSULTA DATOS SUNAT
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
            this.clienteModalForm.value.nombre = data.name + ' ' + data.first_name + ' ' + data.last_name;
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
          if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas' && data.razonSocial) {
            this.encontrado = true;
            console.log(data);
            this.clienteModalForm.value.direccion = data.direccion;
            this.clienteModalForm.value.nombre = data.razonSocial;
            console.log(this.clienteModalForm.value);
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

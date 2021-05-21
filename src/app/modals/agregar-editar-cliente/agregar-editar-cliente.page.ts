import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isNullOrUndefined } from 'util';
import {NumberOnlyValidation, StringOnlyValidation, EMAIL_REGEXP_PATTERN} from 'src/app/global/validadores';
import { ConsultarRUC_DNI } from 'src/app/global/consultaRucDni';
import { DataBaseService } from 'src/app/services/data-base.service';
import { GlobalService } from 'src/app/global/global.service';

@Component({
  selector: 'app-agregar-editar-cliente',
  templateUrl: './agregar-editar-cliente.page.html',
  styleUrls: ['./agregar-editar-cliente.page.scss'],
})
export class AgregarEditarClientePage implements OnInit {

  /** Adaptacion de funciones importadas */
  numberOnlyValidation = NumberOnlyValidation;
  stringOnlyValidation = StringOnlyValidation;

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
    private http: HttpClient,
    private dataApi: DataBaseService,
    private globalService: GlobalService
  ) {

    this.clienteModalForm = this.createFormCliente();
  }

  ngOnInit() {
    if ( this.dataModal.evento === 'actualizar' ){
      this.clienteModalForm = this.formForUpdate();
    }
  }

  ionViewWillEnter(){
  }

  createFormCliente(){
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      tipoDoc: new FormControl('dni', [Validators.required]),
      numDoc: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
      celular: new FormControl('', [Validators.minLength(9), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.minLength(3)]),
      email: new FormControl('', [Validators.minLength(3), Validators.pattern(EMAIL_REGEXP_PATTERN)])
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
      nombre: new FormControl(this.dataModal.cliente.nombre, [Validators.required, Validators.minLength(3)]),
      tipoDoc: new FormControl(this.dataModal.cliente.tipoDoc, [Validators.required]),
      numDoc: new FormControl(this.dataModal.cliente.numDoc, [Validators.required, Validators.minLength(8), Validators.maxLength(11)]),
      celular: new FormControl(this.dataModal.cliente.celular, [Validators.minLength(9), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataModal.cliente.direccion, [Validators.minLength(3)]),
      email: new FormControl(this.dataModal.cliente.email, [Validators.minLength(3), Validators.pattern(EMAIL_REGEXP_PATTERN)])
    });
  }

  resetearTypoDocumento() {
    const typeDoc = this.clienteModalForm.value.tipoDoc;
    if (typeDoc === 'ruc') {
      this.clienteModalForm.setControl(
        'numDoc',
        new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)])
      );

      this.typoDocumento = 'ruc';
    } else if (typeDoc === 'dni') {
      this.clienteModalForm.setControl(
        'numDoc',
        new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)])
      );

      this.typoDocumento = 'dni';
    } else {
      console.log('Documento no valido');
    }
  }

  // TODO - data es un cliente, por lo tanto debería regresar CLIENTE
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

  /** CONSULTA RUC O DNI A SUNAT APIS */
  async consultaApiDniRuc(event) {
    if (event.detail.value.length === 8 || event.detail.value.length === 11){
      this.consultando = true;
      await ConsultarRUC_DNI(event.detail.value, this.typoDocumento).then( (data: any) => {
        this.encontrado = true;
        this.clienteModalForm.setControl('nombre', new FormControl(data.nombre, [Validators.required, Validators.minLength(3)]));
        this.clienteModalForm.setControl('direccion', new FormControl(data.direccion, [Validators.minLength(3)]));
        this.consultando = false;
      }).catch(() => {
        this.encontrado = false;
        this.consultando = false;
      });
    }
  }

  async execFun2(){
    const loadController = await this.globalService.presentLoading(`${this.dataModal.evento} datos...`);

    const clienteFormat  = this.formatearCliente();
    if (this.dataModal.evento === 'agregar'){
      await this.agregar(clienteFormat);
    }
    else if (this.dataModal.evento === 'actualizar'){
      await this.actualizar(this.dataModal.cliente.id, clienteFormat);
    } else {
      console.log('La función no existe');
    }

    this.cerrarModal();

    loadController.dismiss();

  }



  formatearCliente(): ClienteInterface{
    const cliente: ClienteInterface = this.clienteModalForm.value;
    cliente.nombre = this.nombre.value.toLowerCase();

    // if (this.dataModal.evento === 'actualizar') {
    //   cliente.id = this.dataModal.cliente.id;
    // }
    return cliente;
  }


  async agregar(cliente: ClienteInterface){
    await this.dataApi.guardarCliente(cliente).then(() => {
      this.globalService.presentToast('Cliente guardado correctamente', {color: 'success'});
    }).catch(err => {
      this.globalService.presentToast('No se pudo guardar el cliente', {color: 'danger'});
    });
  }

  async actualizar(idCliente: string, cliente: ClienteInterface){
    await this.dataApi.actualizarCliente(idCliente, cliente).then(() => {
      this.globalService.presentToast('Cliente actualizado correctamente', {color: 'success'});
    }).catch(err => {
      this.globalService.presentToast('No se pudo actualizar los datos', {color: 'danger'});
    });
  }




  // consultaSunat(event) {

  //   if (this.typoDocumento === 'dni') {
  //     if (event.detail.value.length === 8) {
  //       this.consultando = true;

  //       this.http.get('https://dni.optimizeperu.com/api/persons/' + event.detail.value).subscribe((data: any) => {
  //         console.log('DATA', data);
  //         if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas' && data.name) {
  //           this.encontrado = true;
  //           this.clienteModalForm.value.nombre = data.name + ' ' + data.first_name + ' ' + data.last_name;
  //           this.consultando = false;
  //         } else {
  //           this.encontrado = false;
  //         }
  //       }, err => {
  //         this.consultando = false;
  //         this.encontrado = false;
  //       });
  //     }
  //   } else {
  //     if (event.detail.value.length === 11) {
  //       this.consultando = true;

  // tslint:disable-next-line: max-line-length
  //       this.http.get('https://dniruc.apisperu.com/api/v1/ruc/' + event.detail.value + '?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFpaXp4Ym92c2dxcnRpZ2J3cEBuaXdnaHguY29tIn0.BwArIEbkSUE_GuXwPjETGTLvl88rhANKTsVcA7NY-WE').subscribe((data: any) => {
  //         if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas' && data.razonSocial) {
  //           this.encontrado = true;
  //           // this.clienteModalForm.value.nombre = data.razonSocial || '';

  //           // setTimeout(() => this.clienteModalForm.value.direccion = data.direccion || '', 10);
  // tslint:disable-next-line: max-line-length
  //           this.clienteModalForm.setControl('nombre', new FormControl(data.razonSocial, [Validators.required, Validators.minLength(3)]));
  //           this.clienteModalForm.setControl('direccion', new FormControl(data.direccion, [Validators.minLength(3)]));
  //           this.consultando = false;
  //         } else {
  //           this.encontrado = false;
  //         }
  //       }, err => {
  //         this.consultando = false;
  //         this.encontrado = false;
  //       });

  //     }
  //   }
  // }


  // CLEAN- este codigo ya no se usa
  // numberOnlyValidation(event: any) {
  //   const pattern = /[0-9]/;
  //   const inputChar = String.fromCharCode(event.charCode);
  //   if (!pattern.test(inputChar)) {
  //     event.preventDefault();
  //   }
  // }
  // numberOnlyValidation(event: any) {
  //   if (!NumberOnlyValidation(event)) {
  //     event.preventDefault();
  //   }
  // }

  // stringOnlyValidation(event: any) {
  //   const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
  //   const inputChar = String.fromCharCode(event.charCode);
  //   if (!pattern.test(inputChar)) {
    //     event.preventDefault();
    //   }
    // }

  // stringOnlyValidation(event: any) {
  //   StringOnlyValidation(event);
  // }
  // consultaSunat(event) {
    //   if (this.typoDocumento === 'dni') {
  //     if (event.detail.value.length === 8) {
  //       this.consultando = true;
  //       const httpOptions = {
  //         headers: new HttpHeaders({
  //           // 'Content-Type':  'application/json',
  //           // tslint:disable-next-line:object-literal-key-quotes
  //           'Authorization': 'token k4d2956bd531ab61d44f4fa07304b20e13913815'
  //         })
  //       };
  //       this.http.get('https://dni.optimizeperu.com/api/persons/' + event.detail.value).subscribe((data: any) => {
  //         console.log(data);
  //         if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas' && data.name) {
  //           this.encontrado = true;
  //           this.clienteModalForm.value.nombre = data.name + ' ' + data.first_name + ' ' + data.last_name;
  //           this.consultando = false;
  //         } else {
  //           this.encontrado = false;
  //         }
  //       }, err => {
  //         this.consultando = false;
  //         this.encontrado = false;
  //       });
  //     }
  //   } else {
  //     if (event.detail.value.length === 11) {
  //       this.consultando = true;
  //       const httpOptions = {
  //         headers: new HttpHeaders({
  //           // 'Content-Type':  'application/json',
  //           // tslint:disable-next-line:object-literal-key-quotes
  //           'Authorization': 'token k4d2956bd531ab61d44f4fa07304b20e13913815'
  //         })
  //       };
  //       const url = 'https://dni.optimizeperu.com/api/company/';
  //       this.http.get('https://dniruc.apisperu.com/api/v1/ruc/' + event.detail.value
  // tslint:disable-next-line: max-line-length
  //  + '?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFpaXp4Ym92c2dxcnRpZ2J3cEBuaXdnaHguY29tIn0.BwArIEbkSUE_GuXwPjETGTLvl88rhANKTsVcA7NY-WE').subscribe((data: any) => {
  //         if (!isNullOrUndefined(data) && data !== 'Peticiones diarias excedidas' && data.razonSocial) {
  //           this.encontrado = true;
  //           console.log(data);
  //           this.clienteModalForm.value.direccion = data.direccion;
  //           this.clienteModalForm.value.nombre = data.razonSocial;
  //           console.log(this.clienteModalForm.value);
  //           this.consultando = false;
  //         } else {
  //           this.encontrado = false;
  //         }
  //       }, err => {
  //         this.consultando = false;
  //         this.encontrado = false;
  //       });
  //     }
  //   }
  // }



}

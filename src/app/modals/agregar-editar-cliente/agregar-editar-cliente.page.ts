import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ClienteInterface } from 'src/app/models/cliente-interface';
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
    private dataApi: DataBaseService,
    private globalService: GlobalService
  ) {



    this.clienteModalForm = this.createFormCliente();
  }

  ngOnInit() {


    console.log('%c%s', 'color: #00ff88', this.dataModal );
    console.log('%c⧭', 'color: #00258c',  this.dataModal);

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

  cerrarModal(data){
    this.modalCtlr.dismiss({
      data: data
    });
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

  async execFun(){
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
    if(this.dataModal.evento === 'agregar') {
      this.cerrarModal(clienteFormat);
    }
    this.cerrarModal(null);

    loadController.dismiss();

  }



  formatearCliente(): ClienteInterface{
    const cliente: ClienteInterface = this.clienteModalForm.value;
    cliente.nombre = this.nombre.value.toLowerCase();
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


}

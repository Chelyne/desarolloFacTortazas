import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController} from '@ionic/angular';
import { ProveedorInterface } from 'src/app/models/proveedor';
import { DataBaseService } from '../../services/data-base.service';
import { ConsultarRUC_DNI } from 'src/app/global/consultaRucDni';
import { EMAIL_REGEXP_PATTERN, NumberOnlyValidation } from 'src/app/global/validadores';
import { GlobalService } from 'src/app/global/global.service';

@Component({
  selector: 'app-agregar-editar-proveedor',
  templateUrl: './agregar-editar-proveedor.page.html',
  styleUrls: ['./agregar-editar-proveedor.page.scss'],
})
export class AgregarEditarProveedorPage implements OnInit {

  /** Adaptacion de funciones importadas */
  numberOnlyValidation = NumberOnlyValidation;

  proveedorModalForm: FormGroup;

  @Input() dataModal: {
    evento: 'actualizar' | 'agregar',
    proveedor?: ProveedorInterface
  };


  typoDocumento = 'ruc';
  consultando: boolean;
  encontrado: boolean;
  constructor(
    private dataApi: DataBaseService,
    private modalCtlr: ModalController,
    private globalService: GlobalService,
  ) {
    this.proveedorModalForm = this.createFormProveedor();
  }


  ngOnInit() {
    if ( this.dataModal.evento === 'actualizar' ){
      this.proveedorModalForm = this.formForUpdate();
    }
  }

  ionViewWillEnter(){
  }

  createFormProveedor() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      tipoDocumento: new FormControl('ruc', [Validators.required]),
      numeroDocumento: new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]),
      telefono: new FormControl('', [Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.minLength(3)]),
      email: new FormControl('', [Validators.minLength(3), Validators.pattern(EMAIL_REGEXP_PATTERN)])
    });
  }

  get nombre() { return this.proveedorModalForm.get('nombre'); }
  get tipoDocumento() { return this.proveedorModalForm.get('tipoDocumento'); }
  get numeroDocumento() { return this.proveedorModalForm.get('numeroDocumento'); }
  get telefono() { return this.proveedorModalForm.get('telefono'); }
  get direccion() { return this.proveedorModalForm.get('direccion'); }
  get email() { return this.proveedorModalForm.get('email'); }

  formForUpdate(){
    return new FormGroup({
      nombre: new FormControl(this.dataModal.proveedor.nombre, [Validators.required, Validators.minLength(3)]),
      tipoDocumento: new FormControl(this.dataModal.proveedor.tipoDocumento, [Validators.required]),
      numeroDocumento: new FormControl(this.dataModal.proveedor.numeroDocumento, [Validators.required]),
      telefono: new FormControl(this.dataModal.proveedor.telefono, [Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl(this.dataModal.proveedor.direccion, [Validators.minLength(3)]),
      email: new FormControl(this.dataModal.proveedor.email, [Validators.minLength(3), Validators.pattern(EMAIL_REGEXP_PATTERN)])
    });
  }

  resetearTypoDocumento() {
    const typeDoc = this.proveedorModalForm.value.tipoDocumento;

    console.log(this.proveedorModalForm.value.tipoDoc);
    if (typeDoc === 'ruc') {
      this.proveedorModalForm.setControl(
        'numeroDocumento',
        new FormControl('', [Validators.required, Validators.minLength(11), Validators.maxLength(11)])
      );

      this.typoDocumento = 'ruc';
    } else if (typeDoc === 'dni') {
      this.proveedorModalForm.setControl(
        'numeroDocumento',
        new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(8)])
      );

      this.typoDocumento = 'dni';
    } else {
      console.log('Documento no valido');
    }
  }


  async  execFun(){
    const loadController = await this.globalService.presentLoading('Guardando datos...');
    if (this.dataModal.evento === 'agregar'){
      await this.guardarProveedor();
    }
    else if (this.dataModal.evento === 'actualizar'){
      await this.actualizarProveedor();

    } else {
      console.log('La función no existe');
    }

    loadController.dismiss();
  }

  async guardarProveedor() {
    await this.dataApi.guardarProveedor(this.proveedorModalForm.value).then(() => {
      this.globalService.presentToast('Datos guardados correctamente', {color: 'success'});
      this.modalCtlr.dismiss();
      this.proveedorModalForm.reset();

    });
  }

  async actualizarProveedor() {

    await this.dataApi.actualizarProveedor(this.dataModal.proveedor.id, this.proveedorModalForm.value)
    .then(() => {
      console.log('Se ingreso Correctamente');
      this.globalService.presentToast('Datos actualizados correctamente', {color: 'success'});

      this.modalCtlr.dismiss();
    });

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
        this.proveedorModalForm.setControl('nombre', new FormControl(data.nombre, [Validators.required, Validators.minLength(3)]));
        this.proveedorModalForm.setControl('direccion', new FormControl(data.direccion, [Validators.minLength(3)]));
        this.consultando = false;
      }).catch(() => {
        this.encontrado = false;
        this.consultando = false;
      });
    }
  }


}

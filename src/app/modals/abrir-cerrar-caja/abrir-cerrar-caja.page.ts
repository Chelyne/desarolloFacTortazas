import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CajaChicaInterface } from '../../models/CajaChica';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-abrir-cerrar-caja',
  templateUrl: './abrir-cerrar-caja.page.html',
  styleUrls: ['./abrir-cerrar-caja.page.scss'],
})
export class AbrirCerrarCajaPage implements OnInit {
  @Input() modo: string;
  @Input() datosCaja: CajaChicaInterface;
  cajaChicaForm: FormGroup;
  CerrarCajaChicaForm: FormGroup;
  cajaChicaEditForm: FormGroup;
  listaUsuarios;
  sede;

  constructor(
              private modalCrl: ModalController,
              private storage: StorageService,
              private dataApi: DbDataService,
              private toastController: ToastController
              ) {
                this.sede = this.storage.datosAdmi.sede;
                this.cajaChicaForm = this.createFormGroupCajaChica();
                this.CerrarCajaChicaForm =  this.createFormGroupCerrarCajaChica();
  }

  ngOnInit() {
    console.log('modo:', this.modo);
    console.log('datos caja:', this.datosCaja);

    if ( this.modo === 'abrir' ) {
      if (this.storage.datosAdmi.rol === 'Administrador') {
        this.ObtenerUsuarios(this.sede);
        console.log('datos devuetos:', [this.storage.datosAdmi] );
      }else {
        this.listaUsuarios = [this.storage.datosAdmi];
        this.cajaChicaForm.addControl('nombreUsuario' , new FormControl( this.listaUsuarios[0].nombre, [Validators.required]));
      }
      console.log('abrir caja');
    }else if (this.modo === 'editar') {
      this.cajaChicaEditForm = this.createFormGroupCajaChicaEdit();
      this.ObtenerUsuarios(this.sede);

    }
  }
  createFormGroupCajaChicaEdit() {
    return new FormGroup({
      montoInicialEdit: new FormControl(this.datosCaja ? this.datosCaja.saldoInicial : '', [Validators.required]),
      nombreUsuarioEdit: new FormControl(  this.datosCaja ? this.datosCaja.nombreVendedor : '', [Validators.required]),
    });
  }
  get montoInicialEdit() { return this.cajaChicaForm.get('montoInicialEdit'); }
  get nombreUsuarioEdit() { return this.cajaChicaForm.get('nombreUsuarioEdit'); }

  createFormGroupCerrarCajaChica() {
    return new FormGroup({
      montoFinal: new FormControl('', [Validators.required]),
      // nombreUsuario: new FormControl( this.listaUsuarios ? this.listaUsuarios[0].nombre : '', [Validators.required]),
    });
  }
  get montoFinal() { return this.CerrarCajaChicaForm.get('montoFinal'); }

  createFormGroupCajaChica() {
    return new FormGroup({
      montoInicial: new FormControl(isNullOrUndefined(this.datosCaja) ? '' : this.datosCaja.saldoInicial , [Validators.required]),
      // nombreUsuario: new FormControl( this.listaUsuarios ? this.listaUsuarios[0].nombre : '', [Validators.required]),
    });
  }
  get montoInicial() { return this.cajaChicaForm.get('montoInicial'); }
  get nombreUsuario() { return this.cajaChicaForm.get('nombreUsuario'); }

  ObtenerUsuarios(sede: string){
    this.dataApi.ObtenerListaDeUsuariosSede(sede).subscribe(data => {
      this.listaUsuarios = data;
      console.log('lista', this.listaUsuarios);
      this.cajaChicaForm.addControl('nombreUsuario' , new FormControl( this.listaUsuarios[0].nombre, [Validators.required]));
    });
  }
  GuardarCaja(){
    console.log('guardar caja', this.cajaChicaForm.value);
    const cajaApertura = {
      nombreVendedor: this.cajaChicaForm.value.nombreUsuario.toLocaleLowerCase(),
      saldoInicial: this.cajaChicaForm.value.montoInicial,
      saldoFinal: 0,
      FechaApertura: new Date(),
      estado: 'Aperturado',
      sede: this.sede
    };
    console.log('datos a guardar', cajaApertura);
    this.dataApi.VerificarCajaChicaVendedor('Aperturado', this.cajaChicaForm.value.nombreUsuario).then(snapshot => {
      if (snapshot.empty) {
        // si esta vacio
        console.log('deja ingresar');
        this.GuardarDatosCajaChica(cajaApertura);

      } else {
        console.log('no deja entrar', snapshot);
        // tslint:disable-next-line:max-line-length
        this.presentToast('No se pudo crear Caja Chica.Por favor cierre Caja Chica para el usuario: ' + this.cajaChicaForm.value.nombreUsuario, 'warning', 'alert-circle-outline');

      }
    });
  }
  GuardarDatosCajaChica(caja: any){
    this.dataApi.guardarCajaChica(caja).then( () => {
      this.cerrarModal();
      this.presentToast('Caja Chica guardado correctamente.', 'success', 'checkmark-circle-outline');
      console.log('se ingreso correctamente a la base de datos');
    }).catch(err => console.log(err));
  }
  async presentToast(mensaje: string, colors?: string, icono?: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      color: colors,
      buttons: [
        {
          side: 'start',
          icon: icono,
          // text: 'Favorite',
        }
      ]
    });
    toast.present();
  }
  CerrarCaja(){
    const cajaCierre = {
      // nombreVendedor: this.cajaChicaForm.value.nombreUsuario.toLocaleLowerCase(),
      // saldoInicial: this.cajaChicaForm.value.montoInicial,
      saldoFinal: this.CerrarCajaChicaForm.value.montoFinal,
      FechaCierre: new Date(),
      // estado: 'Aperturado',
      // sede: this.sede
    };
    if (this.CerrarCajaChicaForm.value.montoFinal >= this.datosCaja.saldoInicial) {
      console.log('cerrar caja', cajaCierre);
      this.dataApi.CerrarCajaChica(this.datosCaja.id, cajaCierre).then(res => {
      this.presentToast('Cerraste la caja correctamente', 'success', 'checkmark-circle-outline');
      this.cerrarModal();
    });
    } else {
      this.presentToast('Ingrese un monto mayor o igual al Monto de Apertura: ' + this.datosCaja.saldoInicial + ' Soles.', 'danger', 'alert-circle-outline');
    }

    console.log('cerramos caja', this.CerrarCajaChicaForm.value.montoFinal, new Date());
  }
  EditarCajaChica(){
    const datos = {
      nombreVendedor: this.cajaChicaEditForm.value.nombreUsuarioEdit.toLocaleLowerCase(),
      saldoInicial: this.cajaChicaEditForm.value.montoInicialEdit,
    };
    console.log('Editar', this.cajaChicaEditForm.value);
    this.dataApi.EditarCajaChica(this.datosCaja.id, datos).then(res => {
      this.presentToast('Guardaste los cambios exitosamente', 'success', 'checkmark-circle-outline');
      this.cerrarModal();
    });
  }
  cerrarModal() {
    console.log('cerrado modal.....');
    this.modalCrl.dismiss();
  }

}

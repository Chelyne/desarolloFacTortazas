import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CajaChicaInterface } from '../../models/CajaChica';
import { isNullOrUndefined } from 'util';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from 'src/app/global/global.service';

@Component({
  selector: 'app-abrir-cerrar-caja',
  templateUrl: './abrir-cerrar-caja.page.html',
  styleUrls: ['./abrir-cerrar-caja.page.scss'],
})
export class AbrirCerrarCajaPage implements OnInit {
  @Input() modo: string;
  @Input() datosCaja: CajaChicaInterface;
  abrirCajaChicaForm: FormGroup;
  CerrarCajaChicaForm: FormGroup;
  cajaChicaEditForm: FormGroup;
  listaUsuarios;
  sede = this.storage.datosAdmi.sede;
  loading;

  constructor(
              private dataApi: DataBaseService,
              private globalSrv: GlobalService,
              private modalCrl: ModalController,
              private storage: StorageService,
              private loadingController: LoadingController
              ) {
                this.abrirCajaChicaForm = this.guardarCajaChicaFormGroup();
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
        this.abrirCajaChicaForm.addControl('dniUsuario' , new FormControl( this.listaUsuarios[0].dni, [Validators.required]));
      }
      console.log('abrir caja');
    }else if (this.modo === 'editar') {
      this.cajaChicaEditForm = this.createFormGroupCajaChicaEdit();
      this.ObtenerUsuarios(this.sede);

    }
  }
  ObtenerUsuarios(sede: string){
    this.dataApi.obtenerUsuariosPorSede(sede).subscribe(data => {
      this.listaUsuarios = data;
      console.log('lista', this.listaUsuarios);
      this.abrirCajaChicaForm.addControl('dniUsuario' , new FormControl( this.listaUsuarios[0].dni, [Validators.required]));
    });
  }
  abrirCajachica(){
    this.presentLoading('Guardando datos...');
    let nombreVend ;
    console.log('guardar caja', this.abrirCajaChicaForm.value);
    for (const datos of this.listaUsuarios) {
      if (datos.dni === this.abrirCajaChicaForm.value.dniUsuario) {
        nombreVend = datos.nombre;
        break;
      }
    }
    const cajaApertura = {
      dniVendedor: this.abrirCajaChicaForm.value.dniUsuario,
      nombreVendedor: nombreVend.toLocaleLowerCase(),
      saldoInicial: this.abrirCajaChicaForm.value.montoInicial,
      saldoFinal: 0,
      FechaApertura: new Date(),
      estado: 'Aperturado',
      sede: this.sede
    };
    console.log('datos a guardar', cajaApertura);
    this.dataApi.validarCajaChicaVendedor('Aperturado', this.abrirCajaChicaForm.value.dniUsuario).then(snapshot => {
      if (!snapshot) {
        console.log('deja ingresar');
        this.GuardarDatosCajaChica(cajaApertura).then(() =>  this.loading.dismiss());


      } else {
        this.loading.dismiss();
        console.log('no deja entrar', snapshot);
        // tslint:disable-next-line:max-line-length
        this.globalSrv.presentToast('No se pudo crear Caja Chica.Por favor cierre Caja Chica para el usuario: ' + cajaApertura.nombreVendedor, {color: 'warning', position: 'top', icon: 'alert-circle-outline'});

      }
    });
  }

  GuardarDatosCajaChica(caja: any){
    return this.dataApi.guardarCajaChica(caja).then( () => {
      this.cerrarModal();
      this.globalSrv.presentToast('Caja Chica guardado correctamente.',
                                  {color: 'success', icon: 'checkmark-circle-outline', position: 'top'});
      console.log('se ingreso correctamente a la base de datos');
    }).catch(err => {
      this.globalSrv.presentToast('No se pudo crear Caja Chica.',
                                  {color: 'danger', icon: 'alert-circle-outline', position: 'top'});
    });
  }

  guardarCajaChicaFormGroup() {
    return new FormGroup({
      montoInicial: new FormControl(isNullOrUndefined(this.datosCaja) ? '' : this.datosCaja.saldoInicial , [Validators.required]),
    });
  }

  get montoInicial() { return this.abrirCajaChicaForm.get('montoInicial'); }
  get dniUsuario() { return this.abrirCajaChicaForm.get('dniUsuario'); }

  EditarCajaChica(){
    let  nombreVendEditado;
    for (const data of this.listaUsuarios) {
      if (data.dni === this.cajaChicaEditForm.value.dniUsuarioEdit) {
        nombreVendEditado = data.nombre;
        break;
      }
    }
    const datos = {
      dniVendedor: this.cajaChicaEditForm.value.dniUsuarioEdit,
      nombreVendedor: nombreVendEditado.toLocaleLowerCase(),
      saldoInicial: this.cajaChicaEditForm.value.montoInicialEdit,
    };
    this.dataApi.actualizarCajaChica(this.datosCaja.id, datos).then(() => {
      this.globalSrv.presentToast('Guardaste los cambios exitosamente',
                                  {color: 'success', icon: 'checkmark-circle-outline', position: 'top'});
      this.cerrarModal();
    }).catch(() => {
      this.globalSrv.presentToast('No se actualizar Caja Chica.', {color: 'danger', icon: 'alert-circle-outline', position: 'top'});
    });
  }

  createFormGroupCajaChicaEdit() {
    return new FormGroup({
      montoInicialEdit: new FormControl(this.datosCaja ? this.datosCaja.saldoInicial : '', [Validators.required]),
      dniUsuarioEdit: new FormControl(  this.datosCaja ? this.datosCaja.dniVendedor : '', [Validators.required]),
    });
  }

  get montoInicialEdit() { return this.cajaChicaEditForm.get('montoInicialEdit'); }
  get dniUsuarioEdit() { return this.cajaChicaEditForm.get('dniUsuarioEdit'); }

  CerrarCaja(){
    const cajaCierre = {
      saldoFinal: this.CerrarCajaChicaForm.value.montoFinal,
      FechaCierre: new Date(),
    };
    if (this.CerrarCajaChicaForm.value.montoFinal >= this.datosCaja.saldoInicial) {
      console.log('cerrar caja', cajaCierre);
      this.dataApi.cerrarCajaChica(this.datosCaja.id, cajaCierre).then(res => {
        this.globalSrv.presentToast('Cerraste la caja correctamente',
                                    {color: 'success', icon: 'checkmark-circle-outline', position: 'top'});
        this.cerrarModal();
      });
    } else {
      this.globalSrv.presentToast('Ingrese un monto mayor o igual al Monto de Apertura: ' + this.datosCaja.saldoInicial + ' Soles.', {color: 'danger', icon: 'alert-circle-outline', position: 'top'});
    }

    console.log('cerramos caja', this.CerrarCajaChicaForm.value.montoFinal, new Date());
  }

  createFormGroupCerrarCajaChica() {
    return new FormGroup({
      montoFinal: new FormControl('', [Validators.required]),
    });
  }

  get montoFinal() { return this.CerrarCajaChicaForm.get('montoFinal'); }

  cerrarModal() {
    console.log('cerrado modal.....');
    this.modalCrl.dismiss();
  }
  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      // duration: 5000
    });
    await this.loading.present();
  }

}

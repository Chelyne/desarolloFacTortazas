import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CajaChicaInterface } from '../../models/CajaChica';
import { isNullOrUndefined } from 'util';
import { formatDate } from '@angular/common';
import { ApiPeruService } from '../../services/api/api-peru.service';
import { time } from 'console';
import { timer } from 'rxjs';

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
              private toastController: ToastController,
              private apiPeru: ApiPeruService
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
        this.cajaChicaForm.addControl('dniUsuario' , new FormControl( this.listaUsuarios[0].dni, [Validators.required]));
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
      dniUsuarioEdit: new FormControl(  this.datosCaja ? this.datosCaja.dniVendedor : '', [Validators.required]),
    });
  }
  get montoInicialEdit() { return this.cajaChicaForm.get('montoInicialEdit'); }
  get dniUsuarioEdit() { return this.cajaChicaForm.get('dniUsuarioEdit'); }

  createFormGroupCerrarCajaChica() {
    return new FormGroup({
      montoFinal: new FormControl('', [Validators.required]),
    });
  }
  get montoFinal() { return this.CerrarCajaChicaForm.get('montoFinal'); }

  createFormGroupCajaChica() {
    return new FormGroup({
      montoInicial: new FormControl(isNullOrUndefined(this.datosCaja) ? '' : this.datosCaja.saldoInicial , [Validators.required]),
    });
  }
  get montoInicial() { return this.cajaChicaForm.get('montoInicial'); }
  get dniUsuario() { return this.cajaChicaForm.get('dniUsuario'); }

  ObtenerUsuarios(sede: string){
    this.dataApi.ObtenerListaDeUsuariosSede(sede).subscribe(data => {
      this.listaUsuarios = data;
      console.log('lista', this.listaUsuarios);
      this.cajaChicaForm.addControl('dniUsuario' , new FormControl( this.listaUsuarios[0].dni, [Validators.required]));
    });
  }
  GuardarCaja(){
    let nombreVend ;
    console.log('guardar caja', this.cajaChicaForm.value);
    for (const datos of this.listaUsuarios) {
      if (datos.dni === this.cajaChicaForm.value.dniUsuario) {
        nombreVend = datos.nombre;
        break;
      }
    }
    const cajaApertura = {
      dniVendedor: this.cajaChicaForm.value.dniUsuario,
      nombreVendedor: nombreVend.toLocaleLowerCase(),
      saldoInicial: this.cajaChicaForm.value.montoInicial,
      saldoFinal: 0,
      FechaApertura: new Date(),
      estado: 'Aperturado',
      sede: this.sede
    };
    console.log('datos a guardar', cajaApertura);
    this.dataApi.VerificarCajaChicaVendedor('Aperturado', this.cajaChicaForm.value.dniUsuario).then(snapshot => {
      if (snapshot.empty) {
        // si esta vacio
        console.log('deja ingresar');
        this.GuardarDatosCajaChica(cajaApertura);

      } else {
        console.log('no deja entrar', snapshot);
        // tslint:disable-next-line:max-line-length
        this.presentToast('No se pudo crear Caja Chica.Por favor cierre Caja Chica para el usuario: ' + cajaApertura.nombreVendedor, 'warning', 'alert-circle-outline');

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

  async enviaruno() {
    const lista = await this.obtenerListaVentas().then((listaventas: []) => listaventas);
    // console.log(lista);
    for (const venta of lista) {
      console.log(venta);
      await this.apiPeru.enviarASunatAdaptador(venta).then(cdr => {
        console.log(cdr);
      });
    }
  }

  async obtenerListaVentas() {
    const dia =  formatDate(new Date(), 'dd-MM-yyyy', 'en');
    console.log(dia);
    const promesa = new Promise((resolve, reject) => {
      this.dataApi.listaVentasVendedorDia(this.sede, dia, this.datosCaja.dniVendedor).subscribe((datos => {
        console.log('no imprimir', datos);
        resolve(datos);
        // let cont = 0;
        // for (const venta of datos) {
        //   console.log(venta);
        //   if (venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura') {
        //     await this.enviaruno(venta).then(() => {
        //       cont++;
        //       console.log('ENVIADO ', cont , venta);
        //     });
        //   }
        // }
      }));
    });
    return promesa;
    // await this.dataApi.ObtenerReporteVentaDiaVendedor(this.sede, dia, this.datosCaja.dniVendedor).then(data => {
    //   if (data.empty) {
    //     this.presentToast('No hay datos para enviar');
    //   } else {
    //     let cont = 0;
    //     data.forEach(element => {
    //       const venta = element.data();
    //       venta.idVenta = element.id;
    //       console.log(venta);
    //       setTimeout(() => {
    //         if (venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura') {
    //           this.enviaruno(venta).then(() => {
    //             cont++;
    //             console.log('ENVIADO ', cont , venta);
    //           });
    //           // this.apiPeru.enviarASunatAdaptador(venta).then(cdr => {
    //           //   console.log(cdr);
    //           // });
    //         }
    //       }, 2000);
    //     });
    //   }
    // });
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
        // this.enviarComprobantes();
        this.presentToast('Cerraste la caja correctamente', 'success', 'checkmark-circle-outline');
        this.cerrarModal();
      });
    } else {
      this.presentToast('Ingrese un monto mayor o igual al Monto de Apertura: ' + this.datosCaja.saldoInicial + ' Soles.', 'danger', 'alert-circle-outline');
    }

    console.log('cerramos caja', this.CerrarCajaChicaForm.value.montoFinal, new Date());
  }
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

import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { DbDataService } from 'src/app/services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-abrir-cerrar-caja',
  templateUrl: './abrir-cerrar-caja.page.html',
  styleUrls: ['./abrir-cerrar-caja.page.scss'],
})
export class AbrirCerrarCajaPage implements OnInit {
  cajaChicaForm: FormGroup;
  listaUsuarios;
  sede;

  constructor(
              private modalCrl: ModalController,
              private storage: StorageService,
              private dataApi: DbDataService,
              private toastController: ToastController
              ) {
                this.sede = this.storage.datosAdmi.sede;
                this.ObtenerUsuarios(this.sede);
                this.cajaChicaForm = this.createFormGroupCajaChica();

  }

  ngOnInit() {
  }
  createFormGroupCajaChica() {
    return new FormGroup({
      montoInicial: new FormControl('', [Validators.required]),
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
    this.dataApi.guardarCajaChica(cajaApertura).then( () => {
      this.presentToast();
      console.log('se ingreso correctamente a la base de datos');
    }).catch(err => console.log(err));
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Ingresado correctamente.',
      duration: 2000,
    });
    toast.present();
  }
  cerrarModal() {
    console.log('cerrado modal.....');
    this.modalCrl.dismiss();
  }

}

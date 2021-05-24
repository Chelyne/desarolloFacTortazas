import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController, LoadingController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';
import { GlobalService } from '../../global/global.service';
import { DataBaseService } from '../../services/data-base.service';
import { DecimalOnlyValidation, DECIMAL_REGEXP_PATTERN, DECIMAL_STRING_PATTERN } from 'src/app/global/validadores';

@Component({
  selector: 'app-modal-ingresos-egresos',
  templateUrl: './modal-ingresos-egresos.page.html',
  styleUrls: ['./modal-ingresos-egresos.page.scss'],
})
export class ModalIngresosEgresosPage implements OnInit {

  /** AFI */
  decimalOnlyValidation = DecimalOnlyValidation;



  ingresoEgresoForm: FormGroup;
  public saldoInsuficiente = false;
  nombreVendedor = this.storage.datosAdmi.nombre;
  dniVendedor = this.storage.datosAdmi.dni;

  @Input() dataModal: {
    evento: 'ingreso' | 'egreso',
  };


  // loading;
  constructor(
    private modalCtlr: ModalController,
    private dataApi: DataBaseService,
    private storage: StorageService,
    private globalService: GlobalService
  ) {
    this.ingresoEgresoForm = this.createFormIngresoEgreso();
  }

  ngOnInit() {
  }

  createFormIngresoEgreso() {
    return new FormGroup({
      monto: new FormControl('', [Validators.required,  Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      detalles: new FormControl('', [Validators.required]),
      tipo: new FormControl('')
    });
  }

  get monto() { return this.ingresoEgresoForm.get('monto'); }
  get detalles() { return this.ingresoEgresoForm.get('detalles'); }



  execTransaction(){
    if (this.dataModal.evento === 'ingreso') {
      this.IngresarMonto();

    } else if (this.dataModal.evento === 'egreso') {
      this.EgresarMonto();
    } else {
      console.log('La fución no es valida');
    }
  }

  async IngresarMonto() {
    const loadController = await this.globalService.presentLoading('Guardando Ingreso...');

    this.ingresoEgresoForm.value.tipo = 'ingreso';

    const ingresoEgreso = {
      monto: parseFloat(this.ingresoEgresoForm.value.monto),
      detalles: this.ingresoEgresoForm.value.detalles,
      tipo: this.ingresoEgresoForm.value.tipo,
      nombreVendedor: this.nombreVendedor,
      dniVendedor: this.dniVendedor,
    };

    await this.dataApi.guardarIngresoEgreso(ingresoEgreso, this.storage.datosAdmi.sede).then(() => {
      const monto: number = parseFloat(this.ingresoEgresoForm.value.monto);
      this.modalCtlr.dismiss();
      this.globalService.presentToast('Ingreso exitoso.', {color: 'success'});
    });

    loadController.dismiss();
  }

  async EgresarMonto(){
    const loadController = await this.globalService.presentLoading('Guardando Egreso...');

    this.ingresoEgresoForm.value.tipo = 'egreso';

    const ingresoEgreso = {
      monto: parseFloat(this.ingresoEgresoForm.value.monto),
      detalles: this.ingresoEgresoForm.value.detalles,
      tipo: this.ingresoEgresoForm.value.tipo,
      nombreVendedor: this.nombreVendedor,
      dniVendedor: this.dniVendedor,
    };

    await this.dataApi.guardarIngresoEgreso(ingresoEgreso, this.storage.datosAdmi.sede).then(() => {
      const monto: number = parseFloat(this.ingresoEgresoForm.value.monto);
      this.modalCtlr.dismiss();
      this.globalService.presentToast('Retiro exitoso.', {color: 'success'});
    });

    loadController.dismiss();
  }

  cerrarModal(){
    this.modalCtlr.dismiss();
  }

}

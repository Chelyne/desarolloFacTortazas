import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VentaInterface } from 'src/app/models/venta/venta';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
// import { TestServiceService } from 'src/app/services/test-service.service';
import { MenuController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';
import { ComprobantePage } from '../../modals/comprobante/comprobante.page';

@Component({
  selector: 'app-confirmar-venta',
  templateUrl: './confirmar-venta.page.html',
  styleUrls: ['./confirmar-venta.page.scss'],
})
export class ConfirmarVentaPage implements OnInit {

  formPago: FormGroup;

  // subTotalDeVenta
  subTotalDeVenta: number;
  IGVdeVenta: number;

  // totalAPagar
  // NOTE - Total a pagar debería ser un constante
  totalAPagar: number;
  totalconDescuento: number;


  // tslint:disable-next-line: no-inferrable-types
  tipoComprobante: string = 'factura';
  serieComprobante = 'F002';


  // tslint:disable-next-line: no-inferrable-types
  vuelto: number = 0;
  // tslint:disable-next-line: no-inferrable-types
  montoEntrante: number = 0;
  descuentoDeVentaMonto = 0;
  descuentoDeVentaPorcentaje = 0;

  venta: VentaInterface;
  loading;
  bolsa = false;
  tipoPago = 'efectivo';
  constructor(
    private testServ: ConfirmarVentaService,
    private menuCtrl: MenuController,
    private router: Router,
    private dataApi: DbDataService,
    private storage: StorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    this.formPago = this.createFormPago();
   }

  ionViewWillEnter() {
    this.venta = this.testServ.getVentaService();
    if (isNullOrUndefined(this.venta)) {
      this.router.navigate(['/punto-venta']);
    } else {
      if (Object.entries(this.venta).length !== 0){
        this.subTotalDeVenta = this.venta.total;
        this.IGVdeVenta = this.subTotalDeVenta * 18 / 100;
        this.totalAPagar = this.subTotalDeVenta;
        this.montoEntrante = this.totalAPagar;
        this.totalconDescuento = this.totalAPagar;
      } else {
        this.subTotalDeVenta = 0;
        this.IGVdeVenta = 0;
        this.totalAPagar = 0;
        this.totalconDescuento = 0;
      }
      console.log('venta', this.venta);
    }
  }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // REFACTOR

    this.formPago.setControl('montoIngreso',
      new FormControl(this.totalAPagar, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    this.formPago.setControl('descuentoMonto',
      new FormControl(this.descuentoDeVentaMonto, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    this.formPago.setControl('descuentoPorcentaje',
      new FormControl(this.descuentoDeVentaPorcentaje, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    // console.log('sssssssssssss', this.venta);
  }


  createFormPago(){
    return new FormGroup({
      montoIngreso: new FormControl(0, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuentoMonto: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuentoPorcentaje: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  get montoIngreso() { return this.formPago.get('montoIngreso'); }
  get descuentoMonto() { return this.formPago.get('descuentoMonto'); }
  get descuentoPorcentaje() { return this.formPago.get('descuentoPorcentaje'); }

  resetFormPago() {
    this.formPago.reset();
  }
  realizarDescuentoMonto(){
    this.descuentoDeVentaPorcentaje = null;
    console.log('Realizar descuento');
    this.descuentoDeVentaMonto =  parseFloat(this.formPago.value.descuentoMonto);

    if (isNaN(this.descuentoDeVentaMonto)) {
      this.descuentoDeVentaMonto = 0;
    }
    this.totalconDescuento = this.totalAPagar - this.descuentoDeVentaMonto;
    console.log(this.totalconDescuento, this.totalAPagar, this.descuentoDeVentaMonto);

    // tslint:disable-next-line:max-line-length
    // this.formPago.setControl('descuento', new FormControl(this.totalconDescuento, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    // this.modificarMontoEntrante(this.totalconDescuento);
    // this.calcularVuelto();

    // modificar el campo: montoEntrante
    this.modificarMontoEntrante(this.totalconDescuento);
    this.calcularVuelto();
    //
  }

  realizarDescuentoPorcentaje(){
    this.descuentoDeVentaMonto = null;
    console.log('Realizar descuento %');
    this.descuentoDeVentaPorcentaje =  parseFloat(this.formPago.value.descuentoPorcentaje);

    if (isNaN(this.descuentoDeVentaPorcentaje)) {
      this.descuentoDeVentaPorcentaje = 0;
    }
    this.totalconDescuento = this.totalAPagar - (this.totalAPagar * this.descuentoDeVentaPorcentaje / 100);
    console.log(this.totalconDescuento, this.totalAPagar, this.descuentoDeVentaPorcentaje);

    // tslint:disable-next-line:max-line-length
    // this.formPago.setControl('descuento', new FormControl(this.totalconDescuento, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    // this.modificarMontoEntrante(this.totalconDescuento);
    // this.calcularVuelto();

    // modificar el campo: montoEntrante
    this.modificarMontoEntrante(this.totalconDescuento);
    this.calcularVuelto();
    //
  }

  modificarMontoEntrante(monto: number){
    console.log(monto);
    this.montoEntrante = monto;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    // this.calcularVuelto();
  }



  calcularVuelto(){
    this.montoEntrante = parseFloat(this.formPago.value.montoIngreso);
    if (isNaN(this.montoEntrante)){
      this.montoEntrante = 0;
    }

    // console.log('total con descuento', this.totalconDescuento);
    this.vuelto =  this.montoEntrante - this.totalconDescuento;

    // console.log(this.totalconDescuento, this.montoEntrante, this.vuelto);
  }


  sumarAMontoEntrante(montoAdd: number){
    console.log(montoAdd);
    this.montoEntrante =  montoAdd;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    this.calcularVuelto();
  }

  ponerMontoExacto(){
    this.montoEntrante = this.totalconDescuento;
    this.formPago.setControl('montoIngreso', new FormControl(this.montoEntrante, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]));
    this.calcularVuelto();
  }



  cancelarVenta(){
    console.log('cancelar venta');
    this.testServ.cleanData();
    this.resetFormPago();
    this.bolsa = false;
    this.router.navigate(['/punto-venta', 'true']);
  }

  SeleccionarComprobante(comprobante: string){
    this.tipoComprobante = comprobante;

    if (comprobante === 'factura'){
      this.serieComprobante = 'F002';
    } else if (comprobante === 'boleta'){
      this.serieComprobante = 'B002';

    }else if (comprobante === 'n. venta'){
      this.serieComprobante = 'NV01';
    }
  }

  generarPago(){
    this.presentLoading('Generando Venta');
    this.venta.tipoComprobante = this.tipoComprobante;
    this.venta.serieComprobante = this.serieComprobante;
    this.venta.vendedor = this.storage.datosAdmi;
    this.venta.bolsa = this.bolsa;
    this.venta.tipoPago = this.tipoPago;
    console.log('Se generó el pago');
    this.dataApi.confirmarVenta(this.venta, this.storage.datosAdmi.sede).then(data => {
      this.resetFormPago();
      this.router.navigate(['/punto-venta', 'true']);
      console.log('guardado', data);
      this.loading.dismiss();
      this.presentToast('Venta exitosa');

    });


  }


  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: 5000
    });
    await this.loading.present();
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 1000
    });
    toast.present();
  }

  changeBolsa() {
    // this.bolsa = !this.bolsa;
    console.log('bolsa', this.bolsa);
    if (this.bolsa === true) {
      this.presentToast('Bolsa agregada');
      this.totalAPagar = this.totalAPagar + 0.3;
      this.totalconDescuento = this.totalconDescuento + 0.3;
      this.calcularVuelto();
    } else {
      this.presentToast('Bolsa quitada');
      this.totalAPagar = this.totalAPagar - 0.3;
      this.totalconDescuento = this.totalconDescuento - 0.3;
      this.calcularVuelto();
    }
  }
  seleccionTipoPago(tipo: string) {
    this.tipoPago = tipo;
  }

  volver() {
    this.router.navigate(['/punto-venta', 'false']);
  }

  async presentModalComprobante() {
    const modal = await this.modalController.create({
      component: ComprobantePage,
      cssClass: 'modalComprobante',
      componentProps: {
        data: this.venta
      }
    });
    return await modal.present();
  }
}

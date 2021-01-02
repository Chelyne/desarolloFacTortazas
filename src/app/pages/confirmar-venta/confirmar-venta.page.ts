import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VentaInterface } from 'src/app/models/venta/venta';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
// import { TestServiceService } from 'src/app/services/test-service.service';
import { MenuController, LoadingController, ToastController } from '@ionic/angular';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { DbDataService } from '../../services/db-data.service';
import { StorageService } from '../../services/storage.service';

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
  descuentoDeVenta: number;

  venta: VentaInterface;
  loading;
  constructor(
    private testServ: ConfirmarVentaService,
    private menuCtrl: MenuController,
    private router: Router,
    private dataApi: DbDataService,
    private storage: StorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    // private apiPeru: d
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
        this.totalAPagar = this.subTotalDeVenta + this.IGVdeVenta;
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

    this.formPago.setControl('descuento',
      new FormControl(this.descuentoDeVenta, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    // console.log('sssssssssssss', this.venta);
  }


  createFormPago(){
    return new FormGroup({
      montoIngreso: new FormControl(0, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')]),
      descuento: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  get montoIngreso() { return this.formPago.get('montoIngreso'); }
  get descuento() { return this.formPago.get('descuento'); }


  realizarDescuento(){
    console.log('Realizar descuento');
    this.descuentoDeVenta =  parseFloat(this.formPago.value.descuento);

    if (isNaN(this.descuentoDeVenta)) {
      this.descuentoDeVenta = 0;
    }
    this.totalconDescuento = this.totalAPagar - this.descuentoDeVenta;
    console.log(this.totalconDescuento, this.totalAPagar, this.descuentoDeVenta);

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
    this.montoEntrante = this.montoEntrante + montoAdd;
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
    console.log('Se generó el pago');
    this.dataApi.confirmarVenta(this.venta, this.storage.datosAdmi.sede).then(data => {

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
}

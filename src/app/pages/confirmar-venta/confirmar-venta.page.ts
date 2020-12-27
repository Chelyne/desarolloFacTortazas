import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VentaInterface } from 'src/app/models/venta/venta';
import { ConfirmarVentaService } from 'src/app/services/confirmar-venta.service';
// import { TestServiceService } from 'src/app/services/test-service.service';
import { MenuController } from '@ionic/angular';

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

  // tslint:disable-next-line: no-inferrable-types
  textService: string = 'Nothing';
  venta: VentaInterface = {} ;
  constructor(
    private testServ: ConfirmarVentaService,
    private menuCtrl: MenuController
  ) {
    this.formPago = this.createFormPago();
   }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // REFACTOR
    console.log('ssssssssssssssssollo una vez');
    this.ObtenerTextService();
    this.ObtenerVentaService();
    console.log('venta');
    if (Object.entries(this.venta).length !== 0){
      this.subTotalDeVenta = this.venta.totalaPagar;
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

    this.formPago.setControl('montoIngreso',
      new FormControl(this.totalAPagar, [Validators.required, Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    this.formPago.setControl('descuento',
      new FormControl(this.descuentoDeVenta, [ Validators.pattern('^[0-9]*\.?[0-9]*$')])
    );

    // console.log('sssssssssssss', this.venta);
  }

  // CLEAN - quitar
  ObtenerTextService(){
    this.textService = this.testServ.getTextService();
  }

  ObtenerVentaService(){
    this.venta = this.testServ.getVentaService();
    console.log(this.venta);
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
    console.log('Se generó el pago');
  }

}

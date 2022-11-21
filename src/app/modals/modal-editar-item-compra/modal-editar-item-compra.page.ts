import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DecimalOnlyValidation, DECIMAL_REGEXP_PATTERN } from 'src/app/global/validadores';
import { ItemDeCompraInterface } from 'src/app/models/Compra';

@Component({
  selector: 'app-modal-editar-item-compra',
  templateUrl: './modal-editar-item-compra.page.html',
  styleUrls: ['./modal-editar-item-compra.page.scss'],
})
export class ModalEditarItemCompraPage implements OnInit {

  /** AFI */
  decimalOnlyValidation = DecimalOnlyValidation;

  @Input() dataModal: {
    itemCompra: ItemDeCompraInterface
  };

  formItemDeCompras: FormGroup;

  constructor(private modalCtlr: ModalController) {
    console.log('DATA MODAL CONSTRUCTOR', this.dataModal);
    this.formItemDeCompras = this.createFormCompras();
   }

  ngOnInit() {
    console.log('DATA MODAL ONINIT', this.dataModal);

  }

  ionViewWillEnter() {
    console.log('DATA MODAL', this.dataModal);

    this.formItemDeCompras = this.updateFormCompras();

  }

  createFormCompras(){
    return new FormGroup({
      nombre: new FormControl('', [Validators.required]),
      descripcion: new FormControl('', []),
      cantidad: new FormControl('', [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      pu_compra: new FormControl('', [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      pu_venta: new FormControl('', [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      descuento: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  updateFormCompras(){
    return new FormGroup({
      nombre: new FormControl(this.dataModal.itemCompra.producto.nombre, [Validators.required]),
      descripcion: new FormControl('', []),
      cantidad: new FormControl(this.dataModal.itemCompra.cantidad, [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      pu_compra: new FormControl(this.dataModal.itemCompra.pu_compra || this.dataModal.itemCompra.producto.precioCompra , [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      pu_venta: new FormControl(this.dataModal.itemCompra.pu_venta || this.dataModal.itemCompra.producto.precio , [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      descuento: new FormControl('', [Validators.pattern('^[0-9]*\.?[0-9]*$')])
    });
  }

  get nombre() { return this.formItemDeCompras.get('nombre'); }
  get descripcion() { return this.formItemDeCompras.get('descripcion'); }
  get pu_compra() { return this.formItemDeCompras.get('pu_compra'); }
  get pu_venta() { return this.formItemDeCompras.get('pu_venta'); }
  get cantidad() { return this.formItemDeCompras.get('cantidad'); }
  get descuento() { return this.formItemDeCompras.get('descuento'); }



  cerrarModal(){
    this.modalCtlr.dismiss();
  }

  modificarItemDeCompra(){
      this.modalCtlr.dismiss({
        itemCompraModicado: this.crearItemDeCompra()
      }).then(() => {
        this.formItemDeCompras.reset();
      });
  }

  crearItemDeCompra(): ItemDeCompraInterface{

    const puCompraEntrante = parseFloat(this.formItemDeCompras.value.pu_compra);
    const puVentaEntrante = parseFloat(this.formItemDeCompras.value.pu_venta);

    const cantidadEntrante = parseInt(this.formItemDeCompras.value.cantidad, 10);
    let descuentoEntrante = parseFloat(this.formItemDeCompras.value.descuento);

    if (isNaN(descuentoEntrante)) {
      descuentoEntrante = 0;
    }

    const itemDeCompra = {
      id: this.dataModal.itemCompra.id,
      producto: this.dataModal.itemCompra.producto,
      pu_compra: puCompraEntrante,
      pu_venta: puVentaEntrante,
      cantidad: cantidadEntrante,
      descuento: descuentoEntrante,
      totalCompraxProducto: puCompraEntrante * cantidadEntrante - descuentoEntrante
    };

    return itemDeCompra;
  }


}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
})
export class BuscarPage implements OnInit {
  buscarForm: FormGroup;

  constructor() {
    this.buscarForm = this.createFormGroup();

  }

  ngOnInit() {
  }

  createFormGroup() {
    return new FormGroup({
      tipoComprobante: new FormControl('', [Validators.required]),
      fechaEmision: new FormControl('', [Validators.required]),
      serieComprobante: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
      numeroComprobante: new FormControl('', [Validators.required]),
      numDoc: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
      totalPagarVenta: new FormControl('', [Validators.required]),
    });
  }

  get tipoComprobante() {return this.buscarForm.get('tipoComprobante'); }
  get fechaEmision() {return this.buscarForm.get('fechaEmision'); }
  get serieComprobante() {return this.buscarForm.get('serieComprobante'); }
  get numeroComprobante() {return this.buscarForm.get('numeroComprobante'); }
  get numDoc() {return this.buscarForm.get('numDoc'); }
  get totalPagarVenta() {return this.buscarForm.get('totalPagarVenta'); }


  guardarProducto() {
    console.log(this.buscarForm.value);
  }
}

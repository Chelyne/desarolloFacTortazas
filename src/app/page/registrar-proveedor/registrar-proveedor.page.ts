import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProveedorRegistroService } from 'src/app/services/proveedor-registro.service';

@Component({
  selector: 'app-registrar-proveedor',
  templateUrl: './registrar-proveedor.page.html',
  styleUrls: ['./registrar-proveedor.page.scss'],
})
export class RegistrarProveedorPage implements OnInit {

  proveedorForm: FormGroup;

  constructor( private registroService: ProveedorRegistroService ) {
    this.proveedorForm = this.createFormProveedor();
  }

  ngOnInit() {
  }

  createFormProveedor() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3)]),
      ruc: new FormControl('', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]),
      telefono: new FormControl('',[Validators.required, Validators.minLength(6), Validators.maxLength(9)]),
      direccion: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.minLength(3), Validators.pattern('^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[_a-z0-9]+)*\.([a-z]{2,4})$')])
    });
  }

  get nombre() { return this.proveedorForm.get('nombre'); }
  get ruc() { return this.proveedorForm.get('ruc'); }
  get telefono() { return this.proveedorForm.get('telefono'); }
  get direccion() { return this.proveedorForm.get('direccion'); }
  get email() { return this.proveedorForm.get('email'); }

  guardarProveedor(){
    console.log(this.proveedorForm.value);
    this.registroService.guardarNuevoProveedor(this.proveedorForm.value).then(()=>console.log("Se ingreso Correctamente"));
  }


  numberOnlyValidation(event: any) {
    const pattern = /[0-9]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

  stringOnlyValidation(event: any) {
    const pattern = /[a-zA-ZÀ-ÿ\u00f1\u00d1 ]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { completarCeros } from '../../global/funciones-globales';
import { BoletasFacturasService } from '../../services/boletas-facturas.service';
import { VentaInterface } from 'src/app/models/venta/venta';
import { DataBaseService } from '../../services/data-base.service';



@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
})
export class BuscarPage implements OnInit {
  buscarForm: FormGroup;
  sede = '';
  serie: string;
  numero: string;
  fechaventas: string;
  mensaje: string;
  numDocu: string;
  total: string;
  comprobante: VentaInterface[] = [];

  sinDatos;
  buscando;

  constructor(
    private dataApi: DataBaseService,
    private comprobanteSrv: BoletasFacturasService
  ) {
    this.buscarForm = this.createFormGroup();

  }

  ngOnInit() {
  }

  createFormGroup() {
    return new FormGroup({
      tipoComprobante: new FormControl('boleta', [Validators.required]),
      fechaEmision: new FormControl('', [Validators.required]),
      serieComprobante: new FormControl('', [Validators.required, Validators.minLength(0), Validators.maxLength(45)]),
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
  getImage() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    const imageData = canvas.toDataURL('image/jpeg').toString();
    return imageData;
    }

    buscarComprobante() {
    this.buscando = true;
    this.comprobante = null;
    const fecha = this.buscarForm.value.fechaEmision;
    this.fechaventas = fecha.split('-').reverse().join('-');

    console.log(this.buscarForm.value);
    this.serie = this.buscarForm.value.serieComprobante.toUpperCase();
    const num = this.buscarForm.value.numeroComprobante;
    // tslint:disable-next-line: radix
    this.numero = '' + parseInt(num);
    this.numDocu = this.buscarForm.value.numDoc;
    this.total = this.buscarForm.value.totalPagarVenta;

    console.log(this.serie);
    console.log(this.numero);
    console.log(this.fechaventas);
    console.log(this.numDocu);
    console.log(this.total);
    this.obtenerComprobante(this.fechaventas, this.numero, this.serie);
  }

  obtenerComprobante(fechaVenta: string, numero: string, serie: string){
    if (this.buscarForm.valid){
      if (this.serie === 'F001' || this.serie === 'B001' ){
        this.sede = 'andahuaylas';
      }else if (this.serie === 'F002' || this.serie === 'B002' ){
        this.sede = 'abancay';
      }else if (this.serie === 'F003' || this.serie === 'B003' ){
        this.sede = 'talavera';
      }
      else{
        this.sede = ' ';
        console.log('no existe sede');
      }
      console.log('sede', this.sede);
      this.dataApi.obtenerComprobante(this.sede, fechaVenta, numero, serie).then((data: any) => {
        this.comprobante = data;
        if (data.length > 0) {
          this.comprobante = data;
          this.comprobante[0].numeroComprobante = completarCeros(data[0].numeroComprobante);
          this.sinDatos = false;
          this.buscando = false;
          this.mensaje = null;
          console.log('datos compr', this.comprobante);

        } else {
          this.sinDatos = true;
          this.buscando = false;
          this.mensaje = null;
        }
        this.buscarForm.reset();


      });
    }else{
      this.mensaje = 'Complete todos los campos';
      this.buscando = false;
    }
  }

  digitosFaltantes(caracter: string, num: number) {
    console.log(num);
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    console.log(final);
    return final;
  }
  descargarComprobante(item: VentaInterface){
    this.comprobanteSrv.generarComprobante(item, this.sede);
  }

}

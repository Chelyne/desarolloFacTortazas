import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-agregar-editar-prod-compuestos',
  templateUrl: './agregar-editar-prod-compuestos.page.html',
  styleUrls: ['./agregar-editar-prod-compuestos.page.scss'],
})
export class AgregarEditarProdCompuestosPage implements OnInit {
  @Input() modo: string;
  @Input() datosProdCompuesto;

  constructor(
              private modalCrl: ModalController
  ) { }

  ngOnInit() {
  }
  cerrarModal() {
    console.log('cerrado modal.....');
    this.modalCrl.dismiss();
  }

}

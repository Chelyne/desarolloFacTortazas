import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-detalles-servicios',
  templateUrl: './modal-detalles-servicios.page.html',
  styleUrls: ['./modal-detalles-servicios.page.scss'],
})
export class ModalDetallesServiciosPage implements OnInit {
  @Input() datos;
  constructor(private modalController: ModalController) { }
  ngOnInit() {
  }

  salirModal(){
    this.modalController.dismiss();
  }
}

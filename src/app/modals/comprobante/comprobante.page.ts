import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-comprobante',
  templateUrl: './comprobante.page.html',
  styleUrls: ['./comprobante.page.scss'],
})
export class ComprobantePage implements OnInit {
  @Input() comprobante;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    console.log(this.comprobante);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

}

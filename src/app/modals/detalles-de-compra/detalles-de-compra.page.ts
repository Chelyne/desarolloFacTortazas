import { Component, Input, OnInit } from '@angular/core';
import { CompraInterface } from 'src/app/models/Compra';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detalles-de-compra',
  templateUrl: './detalles-de-compra.page.html',
  styleUrls: ['./detalles-de-compra.page.scss'],
})
export class DetallesDeCompraPage implements OnInit {

  @Input() compra: CompraInterface;


  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    // console.log('aaaaaaaa', this.compra);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

}

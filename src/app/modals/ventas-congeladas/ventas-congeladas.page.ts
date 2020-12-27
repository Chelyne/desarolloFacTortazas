import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-ventas-congeladas',
  templateUrl: './ventas-congeladas.page.html',
  styleUrls: ['./ventas-congeladas.page.scss'],
})
export class VentasCongeladasPage implements OnInit {

  constructor(private modalCtrl: ModalController,
              private storage: StorageService) { }

  ngOnInit() {
    console.log(this.storage.listaVenta);
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  seleccionarVenta(venta) {
    this.modalCtrl.dismiss({
      dataVenta: venta
    });
  }

}

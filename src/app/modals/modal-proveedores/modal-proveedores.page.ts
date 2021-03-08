import { Component, OnInit } from '@angular/core';
import { ProveedorInterface } from '../../models/proveedor';
import { ModalController } from '@ionic/angular';
import { DataBaseService } from 'src/app/services/data-base.service';

@Component({
  selector: 'app-modal-proveedores',
  templateUrl: './modal-proveedores.page.html',
  styleUrls: ['./modal-proveedores.page.scss'],
})
export class ModalProveedoresPage implements OnInit {
  listaDeProveedores: ProveedorInterface[];
  hayDatos = false;

  constructor(
    private dataApi: DataBaseService,
    private modalCtlr: ModalController,
  ){

  }

  ngOnInit() {
    this.ObtenerProveedores();
  }

  ObtenerProveedores(){
    this.dataApi.obtenerProveedores().subscribe(data => {
      if (data.length) {
        this.listaDeProveedores = data;
        this.hayDatos = true;
      } else {
        this.hayDatos = false;
      }
    });
  }

  SeleccionarProveedor(proveedorSelect: ProveedorInterface){
    this.modalCtlr.dismiss({
      proveedor: proveedorSelect
    });
  }

  cerrarModal() {
    this.modalCtlr.dismiss();
  }
}

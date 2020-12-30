import { Component, OnInit } from '@angular/core';
import { DbDataService } from '../../services/db-data.service';
import { ProveedorInterface } from '../../models/proveedor';
import { ModalController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-modal-proveedores',
  templateUrl: './modal-proveedores.page.html',
  styleUrls: ['./modal-proveedores.page.scss'],
})
export class ModalProveedoresPage implements OnInit {
  listaDeProveedores: ProveedorInterface[];
  sinDatos;
  constructor(private dataApi: DbDataService,
              private modalCtlr: ModalController,
              private storage: StorageService) { }

  ngOnInit() {
    this.ObtenerProveedores();
  }

  ObtenerProveedores(){
    this.dataApi.ObtenerListaDeProveedores().subscribe(data => {
      if (data.length > 0) {
        this.listaDeProveedores = data;
        this.sinDatos = false;
      } else {
        this.sinDatos = true;
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

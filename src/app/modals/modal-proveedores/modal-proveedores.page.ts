import { Component, OnInit, ViewChild } from '@angular/core';
import { ProveedorInterface } from '../../models/proveedor';
import { IonSearchbar, ModalController } from '@ionic/angular';
import { DataBaseService } from 'src/app/services/data-base.service';

@Component({
  selector: 'app-modal-proveedores',
  templateUrl: './modal-proveedores.page.html',
  styleUrls: ['./modal-proveedores.page.scss'],
})
export class ModalProveedoresPage implements OnInit {
  @ViewChild('mainSearchbar') searchBar: IonSearchbar;

  listaDeProveedores: ProveedorInterface[];
  hayDatos = false;
  textoBuscar = "";

  constructor(
    private dataApi: DataBaseService,
    private modalCtlr: ModalController,
  ){

  }

  ngOnInit() {
    this.ObtenerProveedores();
  }
  ionViewDidEnter() {
    setTimeout(() => {
      this.searchBar.setFocus();
    }, 150);
  }

  buscarProveedor(event) {
    // console.log(event);
    const texto = event.target.value;
    this.textoBuscar = texto;
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

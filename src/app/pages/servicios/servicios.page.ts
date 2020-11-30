import { Component, OnInit } from '@angular/core';
import { ModalDetallesServiciosPage } from '../../modals/modal-detalles-servicios/modal-detalles-servicios.page';
import { ModalController } from '@ionic/angular';
import { DbDataService } from '../../services/db-data.service';
import { ActivatedRoute } from '@angular/router';
import { CategoriasService } from '../../services/categorias.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
})
export class ServiciosPage implements OnInit {
  tipo: string;
  servicios;
  sinDatos;
  categorias = [];
  constructor(private modalController: ModalController,
              private dataApi: DbDataService,
              private route: ActivatedRoute,
              private categoriasService: CategoriasService) {
                this.tipo = this.route.snapshot.params.tipo;
                console.log(this.tipo);
                this.categorias = this.categoriasService.getcategoriasNegocio(this.tipo);
               }

  ngOnInit() {
    this.getServicios();
  }

  getServicios() {
    this.servicios = [];
    if (this.categorias && this.categorias.length > 0) {
      this.categorias.forEach(element => {
        this.dataApi.ObtenerListaServicios(this.tipo, element.categoria).subscribe(services => {
          if (services.length > 0) {
            element.datos = services;
            console.log(element);
            this.sinDatos =  false;
          } else {
            this.sinDatos =  true;
          }
        });
      });
    } else {
      this.consultar(this.tipo, null);
    }
  }

  consultar(tipo: string, subCategoria: string) {
    this.dataApi.ObtenerListaServicios(tipo, subCategoria).subscribe(services => {
      if (services.length > 0) {
        this.servicios = services;
        console.log(this.servicios);
        this.sinDatos =  false;
      } else {
        this.sinDatos =  true;
      }
    });
  }

  async modalDetallesServicio(item) {
    const modal = await this.modalController.create({
      component: ModalDetallesServiciosPage,
      cssClass: 'my-custom-class',
      componentProps: { datos: item }
    });
    return await modal.present();
  }

}

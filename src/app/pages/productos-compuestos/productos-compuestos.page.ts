import { Component, OnInit } from '@angular/core';
import { MenuController, PopoverController, ModalController } from '@ionic/angular';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { AgregarEditarProdCompuestosPage } from '../../modals/agregar-editar-prod-compuestos/agregar-editar-prod-compuestos.page';

@Component({
  selector: 'app-productos-compuestos',
  templateUrl: './productos-compuestos.page.html',
  styleUrls: ['./productos-compuestos.page.scss'],
})
export class ProductosCompuestosPage implements OnInit {
  descripcion = 'combo 2 Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae maiores officiis eveniet esse quae veritatis autem doloribus et? Ducimus consequatur ad omnis deserunt alias commodi qui quos sint dicta molestias!';
  constructor(
              private menuCtrl: MenuController,
              private popoverCtrl: PopoverController,
              private modalController: ModalController
  ) { }

  ngOnInit() {
    this.menuCtrl.enable(true);
  }
  async modalAperturaCajaChica(modoCaja: string, datos: any) {
    const modal = await this.modalController.create({
      component: AgregarEditarProdCompuestosPage,
      cssClass: 'modal-fullscreen',
      backdropDismiss: false,
      componentProps: {
        modo: modoCaja,
        datosProdCompuesto: datos
      }
    });
    return await modal.present();
  }

  async ImportarProductos(ev: any) {
    const popover = await this.popoverCtrl.create({
      component: PoppoverEditarComponent,
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        importarProductosCompuestos: true
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      switch (data.action) {
        case 'ProdCompuesto': console.log('ProdCompuesto'); break;
        case 'DetalleProdCompuesto': console.log('DetalleProdCompuesto'); break;
      }
    }
  }

}

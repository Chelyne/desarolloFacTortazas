import { Component, OnInit, Input } from '@angular/core';
import { ProductoInterface, VariantesInterface } from '../../models/ProductoInterface';
import { PopoverController } from '@ionic/angular';
import { GlobalService } from 'src/app/global/global.service';

@Component({
  selector: 'app-popover-variantes',
  templateUrl: './popover-variantes.component.html',
  styleUrls: ['./popover-variantes.component.scss'],
})
export class PopoverVariantesComponent implements OnInit {
  @Input() producto: ProductoInterface;

  constructor(private popoverCtrl: PopoverController) { }

  ngOnInit() {
  }

  seleccionVariante(varianteSelect: VariantesInterface) {
    console.log('VARIANTE SELECCIONADA EN POPOVER', varianteSelect);
    const varianteValidada: VariantesInterface = {
      medida: varianteSelect.medida,
      factor: parseFloat(`${varianteSelect.factor}`),
      precio: parseFloat(`${varianteSelect.precio}`)
    };
    console.log('VARIANTE SELECCIONADA EN POPOVER', varianteValidada);


    this.popoverCtrl.dismiss({
      variante: varianteValidada
    });
  }
}

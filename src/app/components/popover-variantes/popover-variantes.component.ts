import { Component, OnInit, Input } from '@angular/core';
import { ProductoInterface } from '../../models/ProductoInterface';
import { PopoverController } from '@ionic/angular';
import { VariantesInterface } from '../../models/variantes';

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

  seleccionVariante(seleccion: VariantesInterface) {
    this.popoverCtrl.dismiss({
      data: seleccion
    });
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-popover-meses',
  templateUrl: './popover-meses.component.html',
  styleUrls: ['./popover-meses.component.scss'],
})
export class PopoverMesesComponent implements OnInit {
  @Input() mes;
  mesActual;
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  mesesMostrar = [];
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    console.log(this.mes);
    this.mesActual = moment().month();
    for (let index = 0; index <= this.mesActual; index++) {
      const data = {
        numero: index,
        mes: this.meses[index]
      };
      this.mesesMostrar.push(data);
    }
  }
  popAction(valor: number) {
    this.popoverController.dismiss({
      action: valor
    });
  }

}

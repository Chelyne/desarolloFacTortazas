import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-meses',
  templateUrl: './popover-meses.component.html',
  styleUrls: ['./popover-meses.component.scss'],
})
export class PopoverMesesComponent implements OnInit {
  @Input() mes;

  constructor(private popoverController: PopoverController) { }

  ngOnInit() {
    console.log(this.mes);
  }
  popAction(valor: number) {
    this.popoverController.dismiss({
      action: valor
    });
  }

}

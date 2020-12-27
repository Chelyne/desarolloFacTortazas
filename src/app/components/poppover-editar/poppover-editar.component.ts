import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';


@Component({
  selector: 'app-poppover-editar',
  templateUrl: './poppover-editar.component.html',
  styleUrls: ['./poppover-editar.component.scss'],
})
export class PoppoverEditarComponent implements OnInit {

  @Input() exportar;
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {}

  popAction(valor: string) {
    this.popoverController.dismiss({
      action: valor
    });
  }
}

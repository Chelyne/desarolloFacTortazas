import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-popover-whatsapp',
  templateUrl: './popover-whatsapp.component.html',
  styleUrls: ['./popover-whatsapp.component.scss'],
})
export class PopoverWhatsappComponent implements OnInit {

  numero: string;
  constructor(
    private popoverController: PopoverController
  ) { }

  ngOnInit() {}

  cerrarPopover() {
    this.popoverController.dismiss({
      data: {numero: this.numero}
    });
  }

}

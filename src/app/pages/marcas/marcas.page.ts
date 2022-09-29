import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-marcas',
  templateUrl: './marcas.page.html',
  styleUrls: ['./marcas.page.scss'],
})
export class MarcasPage implements OnInit {

  constructor(
    private menuCtrl: MenuController,
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(true);
  }

}

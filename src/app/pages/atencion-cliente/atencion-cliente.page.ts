import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-atencion-cliente',
  templateUrl: './atencion-cliente.page.html',
  styleUrls: ['./atencion-cliente.page.scss'],
})
export class AtencionClientePage implements OnInit {

  constructor(
    private menuCtrl: MenuController,
  ) {}

  ngOnInit() {
    this.menuCtrl.enable(true);
  }

  toggleMenu() {
    const splitPane = document.querySelector('ion-split-pane');
    const windowWidth = window.innerWidth;
    const splitPaneShownAt = 992;
    const when = `(min-width: ${splitPaneShownAt}px)`;
    if (windowWidth >= splitPaneShownAt) {
      // split pane view is visible
      const open = splitPane.when === when;
      splitPane.when = open ? false : when;
    } else {
      // split pane view is not visible
      // toggle menu open
      const menu = splitPane.querySelector('ion-menu');
      return menu.open();
    }
  }
}

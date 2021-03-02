import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class SpliPaneService {

  splitPaneState: boolean;

  constructor(public platform: Platform) {
    this.splitPaneState = false;
  }

  setSplitPane(state: boolean) {
    if (this.platform.width() > 992) {
      this.splitPaneState = state;
    } else {
      this.splitPaneState = false;
    }
  }

  getSplitPane() {
    return this.splitPaneState;
  }
}

import { Component, OnInit } from '@angular/core';

import { Platform, MenuController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './services/storage.service';
// import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthServiceService } from './services/auth-service.service';
import { MenuService } from './services/menu.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  menuSeleccionado = 'Inicio';
  datosAdmi;
  componentes: Observable<any[]>;
  ocultarMenu = true;
  constructor(
    private menu: MenuService,
    private authService: AuthServiceService,
    private alertController: AlertController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: StorageService,
    private menuCtrl: MenuController,
    // private localNotifications: LocalNotifications,
    private route: Router,
    private fcmSrv: AuthServiceService
  ) {
    this.initializeApp();
    // this.platform.ready().then( () => {
    //   this.localNotifications.on('click').subscribe (res => {
    //     console.log('click', res);
    //     this.route.navigate(['/pedidos']);
    //   });
    // });
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.storage.cargarDatosAdmiStorage().then(() => {
        this.statusBar.styleDefault();
        this.statusBar.backgroundColorByHexString('#ffffff');
        this.splashScreen.hide();
        this.componentes = this.menu.getMenu();
        console.log('menu', this.componentes);
        this.menuCtrl.enable(false);


        // this.fcmSrv.escuchaNotificaciones().pipe(
        //   tap(msg => {
        //     // this.presentToast(msg.body);
        //     this.notificacion(msg.title, msg.body);
        //   })
        // ).subscribe(
        //   // data => {
        //   //     if (data.wasTapped) {alert('recibido por segundo plano' + JSON.stringify(data)); }
        //   //     else {alert('recibido por primer plano' + JSON.stringify(data)); } }
        // );
      });
    });
  }
  // notificacion(titulo, descripcion) {
  //   this.localNotifications.schedule({
  //       id: 1,
  //       title: titulo,
  //       text: descripcion,
  //       // sound: '../assets/ringtones-xperia-notification.mp3',
  //       icon: '../assets/img/TOOBY LOGO.png'
  //     });
  //   }

  menuSelected(page) {
    this.menuSeleccionado = page.name;
  }


  cerrarSesion() {
    this.storage.borrarStorage();
    this.authService.logOut();
  }

  async presentAlertPaway() {
    const alert = await this.alertController.create({
      cssClass: 'paway-alert',
      // header: 'PAWAY TECHNOLOGY',
      // subHeader: 'Aplicación realizada por Paway Perú',
      message: '<img src="../../../../../assets/paway logo.png"><br>www.pawayperu.com<br>+51 910426974',
      mode: 'ios',
      buttons: ['Aceptar']
    });

    await alert.present();
  }
  ver(n) {
    if (this.ocultarMenu === true) {
    document.getElementById('subseccion' + n).style.display = 'block';
    this.ocultarMenu = false;
    }else {
    document.getElementById('subseccion' + n).style.display = 'none';
    this.ocultarMenu = true;
    }
    }
}

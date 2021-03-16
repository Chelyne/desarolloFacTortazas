import { Component, OnInit } from '@angular/core';

import { Platform, MenuController, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './services/storage.service';
import { AuthServiceService } from './services/auth-service.service';
import { MenuService } from './services/menu.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit{
  menuSeleccionado = 'Dashboard';
  datosAdmi;
  componentes: Observable<any[]>;
  constructor(
    private menu: MenuService,
    private authService: AuthServiceService,
    private alertController: AlertController,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public storage: StorageService,
    private menuCtrl: MenuController,
  ) {
    this.initializeApp();
    // this.platform.ready().then( () => {
    //   this.localNotifications.on('click').subscribe (res => {
    //     console.log('click', res);
    //     this.route.navigate(['/pedidos']);
    //   });
    // });
  }

  ngOnInit() {
    this.componentes = this.menu.getMenu();
    console.log('menu', this.componentes);
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.menuCtrl.enable(false);
      this.storage.cargarDatosAdmiStorage().then(() => {
        this.storage.cargarVentsaCongeladas();
        this.statusBar.styleDefault();
        this.statusBar.backgroundColorByHexString('#ffffff');
        this.splashScreen.hide();
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
      message: '<img src="../../../assets/paway_logo.png"><br>www.pawayperu.com<br>+51 910426974',
      mode: 'ios',
      buttons: ['Aceptar']
    });

    await alert.present();
  }
}

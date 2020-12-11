import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { map } from 'rxjs/operators';
// import { FCM } from '@ionic-native/fcm/ngx';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor(private auth: AngularFireAuth,
              private router: Router,
              // private fcm: FCM,
              private menuCtrl: MenuController) { }

  loginEmail(email, password) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logOut() {
    return this.auth.signOut().then(() => {
      // localStorage.removeItem('user');
      this.router.navigate(['/login']);
      this.menuCtrl.enable(false);
    });
  }

  isAuth() {
    return this.auth.authState.pipe(map(auth => auth));
  }
  escuchaNotificaciones() {
    // return this.fcm.onNotification();
  }
}

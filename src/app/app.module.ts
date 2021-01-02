import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFirestoreModule } from '@angular/fire/firestore';
// import { Camera } from '@ionic-native/camera/ngx';
// import { NativeStorage } from '@ionic-native/native-storage/ngx';

import { MenuComponent } from './components/menu/menu.component';

import { HttpClientModule} from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// notificacion.push
// import { FCM } from '@ionic-native/fcm/ngx';
// import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
// import { CallNumber } from '@ionic-native/call-number/ngx';

// fecha en espaniol
import { LOCALE_ID } from '@angular/core';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { ModalDetallesServiciosPage } from './modals/modal-detalles-servicios/modal-detalles-servicios.page';
// import { BuscarClientePipe } from './pipes/buscar-cliente.pipe';
import { PipesModule } from './pipes/pipes.module';

import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent, MenuComponent, ModalDetallesServiciosPage],
  entryComponents: [ModalDetallesServiciosPage],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    HttpClientModule,
    PipesModule,
    NgxQRCodeModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Camera,
    // FCM,
    // LocalNotifications,
    // NativeStorage,
    // CallNumber,
    { provide: LOCALE_ID, useValue: 'es-PE' },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

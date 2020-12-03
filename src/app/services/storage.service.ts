import { Injectable } from '@angular/core';
import { AuthServiceService } from './auth-service.service';
import { DbDataService } from './db-data.service';
import { Platform } from '@ionic/angular';
// import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { AdmiInterface } from '../models/AdmiInterface';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  datosAdmi: AdmiInterface;
  constructor(
    private authService: AuthServiceService,
    private dataApi: DbDataService,
    private platform: Platform,
    // private nativeStorage: NativeStorage
  ) { }

  cargarDatosLogin() {
    const promesa = new Promise( (resolve, reject) => {
      this.consultaDatos();
      resolve();
    });
    return promesa;
  }

  consultaDatos() {
    this.authService.isAuth().subscribe(user => {
      if (user) {
        console.log(user);
        this.dataApi.ObtenerUnAdministrador(user.email).subscribe( data => {
          if (data) {
            if (this.platform.is('cordova')) {
              // celular
              // this.nativeStorage.setItem('datosAdmi', data) // { property: 'value', anotherProperty: 'anotherValue' }
              // .then(
              //   (data1) => {
              //     // window.alert('Se Obtuvo: ' + data1),
              //     this.nativeStorage.getItem('datosAdmi')
              //     .then(
              //       data2 => {
              //         // window.alert('cargado: ' + data1),
              //         this.datosAdmi = data2;
              //       }, // console.log(data),
              //       error => console.error(error)  // window.alert('Error: ' + error),
              //     );
              //   }, // console.log('Stored first item!', data),
              //   error => console.error('Error storing item', error) //  window.alert('Error: ' + error),
              // );
            } else {
              // escritorio
              localStorage.setItem('datosAdmi', JSON.stringify(data));
              this.datosAdmi = JSON.parse(localStorage.getItem('datosAdmi'));
            }
          }
        });
      }
    });
  }

  cargarDatosAdmiStorage() {
    const promesa = new Promise( (resolve, reject) => {
      if (this.platform.is('cordova')) {
        // dispositivo
        // this.nativeStorage.getItem('datosAdmi')
        // .then(
        //   data => {
        //     if (data) {
        //       this.datosAdmi = data;
        //       // window.alert('Negocio: ' + JSON.stringify(this.datosNegocio));
        //     }
        //   }, // console.log(data),
        //   error => console.error(error), //  window.alert('Error: ' + error)
        // );
      } else {
        // escritorio
        if ( localStorage.getItem('datosAdmi') ) {
          this.datosAdmi = JSON.parse(localStorage.getItem('datosAdmi'));
        }
      }
      resolve();
    });
    return promesa;
  }


  borrarStorage() {
    if (this.platform.is('cordova')) {
      // celular
      // this.nativeStorage.clear()
      // .then(
      //   data => {
      //     // console.log(data);
      //     this.datosAdmi =  null;
      //   },
      //   error => console.error(error),
      // );
    } else {
      // escritorio
      localStorage.clear();
      this.datosAdmi = null;
    }
  }
}

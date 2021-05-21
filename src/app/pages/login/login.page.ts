import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController, LoadingController, ToastController, Platform } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthServiceService } from '../../services/auth-service.service';
import { StorageService } from '../../services/storage.service';
import { isNullOrUndefined } from 'util';
import { GENERAL_CONFIG } from '../../../config/generalConfig';
import { DataBaseService } from '../../services/data-base.service';
import { EMAIL_REGEXP_PATTERN } from 'src/app/global/validadores';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  LoginForm: FormGroup;
  logo = GENERAL_CONFIG.datosEmpresa.logo;

  // tslint:disable-next-line:max-line-length
  emailPattern: RegExp = EMAIL_REGEXP_PATTERN;
  loading;
  token: string;
  constructor(private authService: AuthServiceService,
              private dataApi: DataBaseService,
              private router: Router,
              public storage: StorageService,
              private menuCtrl: MenuController,
              private loadingController: LoadingController,
              // private fcm: FCM,
              private Pltform: Platform,
              private toastController: ToastController) {
    // this.obtenerfcm();
    this.LoginForm = this.createFormGroup();
   }

  ngOnInit() {
  }

  createFormGroup() {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(this.emailPattern)]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(16)])
    });
  }

  onResetForm() {
    this.LoginForm.reset();
  }

  get email() { return this.LoginForm.get('email'); }
  get password() { return this.LoginForm.get('password'); }
  // obtenerfcm(){
  //   console.log('entra a funcion de obtener fcm');
  //   if (this.Pltform.is('cordova')) {
  //     //  this.fcm.getToken().then( tok => {this.token = tok; })
  //     //  .catch(err => {});
  //   } else { this.token = 'token laptop'; console.log('token', this.token); }

  // }
  async logIn() {
    if (this.LoginForm.valid) {
      await this.presentLoading('Iniciando Sesión');
      this.authService.loginEmail(this.LoginForm.value.email, this.LoginForm.value.password)
      .then((res) => {
        console.log(res);
        this.storage.cargarDatosLogin().then(user => {
          console.log(user);
          if (user === 'null') {
            this.presentToast('No se encontró los datos del usuario, consulte con el administrador');
            this.loading.dismiss();
            this.authService.logOut();
          } else {
            this.router.navigate(['/home']);
            this.onResetForm();
            this.menuCtrl.enable(true);
            this.loading.dismiss();
          }
        });
      }).catch((error) => {
        console.log(error);
        if (error.code === 'auth/user-not-found') {
          console.log('Usuario no encontrado');
          this.dataApi.obtenerUnAdministrador(this.LoginForm.value.email).subscribe(user => {
            if (isNullOrUndefined(user)) {
              this.presentToast('Usuario no encontrado');
              this.loading.dismiss();
            } else {
              console.log(user);
              if (this.LoginForm.value.password === user.password) {
                // this.authService.
                console.log('crear usuario');
                this.authService.crearUsuario(user.correo, user.password).then(() => {
                  this.presentToast('Usuario creado correctamente');
                  // this.dataApi.actualizarToken(this.token, this.LoginForm.value.email);
                  this.storage.cargarDatosLogin().then(() => {
                    this.router.navigate(['/home']);
                    this.onResetForm();
                    this.menuCtrl.enable(true);
                    this.loading.dismiss();
                  });
                });
              } else {
                this.presentToast('Contraseña incorrecta');
                this.loading.dismiss();
              }
            }
          });
        } else {
          this.presentToast('Error al iniciar sesión, usuario no encontrado');
          this.loading.dismiss();
        }
      });
    } else {
      this.presentToast('Ingrese los datos correctos');
    }
  }
  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }
  async presentLoading(mensaje) {
    this.loading = await this.loadingController.create({
      message: mensaje,
      spinner: 'crescent',
      cssClass: 'loading',
      duration: 5000,
      mode: 'ios'
    });
    await this.loading.present();
  }

  teclaEnter(){
    console.log('se presiono la tecla enter');
  }

}

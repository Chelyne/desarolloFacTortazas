import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class NoVendedorGuard implements CanActivate {

  constructor(private storage: StorageService, private toastController: ToastController) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.storage.datosAdmi.rol === 'Administrador') {
          console.log('ADELANTE');
          return true;
      } else if (this.storage.datosAdmi.rol === 'Vendedor') {
        console.log('NO TIENES PERMISO');
        this.presentToast();
        return false;
      } else {
        console.log('Quien eres?');
        return false;
      }
    }

    async presentToast() {
      const toast = await this.toastController.create({
        header: 'PERMISO DENEGADO',
        message: 'No tienes permiso para acceder a esta página',
        position: 'top',
        duration: 2000,
        buttons: [
          {
            side: 'start',
            icon: 'alert-circle-outline',
            handler: () => {
              console.log('Favorite clicked');
            }
          }, {
            text: 'Ok',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          }
        ]
      });
      toast.present();
    }
  }

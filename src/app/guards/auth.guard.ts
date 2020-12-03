import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { isNullOrUndefined } from 'util';
import { map } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private afAuth: AngularFireAuth, private router: Router, private storage: StorageService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.storage.datosAdmi) {
        return true;
      } else {
        return this.afAuth.authState.pipe(map( auth => {
          if (isNullOrUndefined(auth)) {
            this.router.navigate(['/login']);
            return false;
          } else if (auth) {
            return true;
          }
        }));
      }
    }
}

import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AuthServiceService } from '../../services/auth-service.service';
import { StorageService } from '../../services/storage.service';
import { DataBaseService } from '../../services/data-base.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  datosAdmi;
  constructor(
    private menuCtrl: MenuController,
    private dataApi: DataBaseService,
    private authService: AuthServiceService,
    private storage: StorageService
  ) {
    this.menuCtrl.enable(true);
    this.datosAdmi = this.storage.datosAdmi;
   }

  ngOnInit() {
    // this.consultaDatos();
  }

  consultaDatos() {
    this.authService.isAuth().subscribe(user => {
      if (user) {
        this.dataApi.obtenerUnAdministrador(user.email).subscribe( data => {
          this.datosAdmi = data;
        });
      }
    });
  }

}

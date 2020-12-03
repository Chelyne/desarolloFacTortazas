import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoInterface } from '../../models/ProductoInterface';
import { AngularFirestore } from '@angular/fire/firestore';
import { ModalController } from '@ionic/angular';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.page.html',
  styleUrls: ['./buscador.page.scss'],
})
export class BuscadorPage implements OnInit {
  @ViewChild('search', {static: false}) search: any;
  productos: ProductoInterface[];

  buscando: boolean;

  sinResultados: string;
  sede: string;
  categoria: string;
  constructor(private route: ActivatedRoute, private afs: AngularFirestore, private router: Router) {
    this.route.queryParams.subscribe(params => {
      this.sede = params.sede;
      this.categoria = params.categoria;
      console.log('sede', this.sede, this.categoria);
    });
  }

  ngOnInit() {
  }
  ionViewDidEnter() {
    this.search.setFocus();
  }

  Search(ev) {
    this.sinResultados = null;
    this.buscando = true;
    console.log(ev.detail.value);
    const key = ev.detail.value;
    console.log('dato a buscar', key);
    const lowercaseKey = key.toLowerCase();
    // const lowercaseKey = key; // esto es para buscar sin convertir en minuscula
    console.log('dato convertido en minuscula', key);
    // console.log(lowercaseKey);
    if ( lowercaseKey.length > 0) {
      // console.log('sede', this.sede);
      console.log('lowercase> 0');
      // tslint:disable-next-line:max-line-length
      // tslint:disable-next-line:max-line-length
      this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos', res => res.where('categoria', '==', this.categoria).orderBy('nombre').startAt(lowercaseKey).endAt(lowercaseKey + '\uf8ff')).snapshotChanges()
      .pipe(map(changes => {
         return changes.map(action => {
          const data = action.payload.doc.data();
          data.id = action.payload.doc.id;
          console.log(data);
          return data;
        });
      }
      )).subscribe(res => {
        if (res.length === 0 ) {
          console.log('no hay datos');
          this.productos = null;
          this.buscando = false;
          this.sinResultados = 'No se encontró el producto';
        } else {
          console.log(res );
          this.productos = res;
          this.buscando = false;
        }
      }, error => { console.log('error de subscribe'  + error); }
      );
     } else  {
      console.log('lowercase 0');
      this.productos = null;
      this.buscando = null;
     }
  }

  limpiar() {
    this.buscando = null;
  }

  // async presentModalDetalles(negocio1: string, id1: string) {
  //   this.router.navigate(['/detalles-producto', id, this.cat, this.sede]);
  //   const modal = await this.modalController.create({
  //     component: VerDetallesPage,
  //     componentProps: {
  //       negocio: negocio1,
  //       id: id1
  //     }
  //   });
  //   return await modal.present();
  // }
   Detalles(cat: string, id1: string) {
    this.router.navigate(['/detalles-producto', id1, cat, this.sede]);
    // const modal = await this.modalController.create({
    //   component: VerDetallesPage,
    //   componentProps: {
    //     negocio: negocio1,
    //     id: id1
    //   }
    // });
    // return await modal.present();
  }

}

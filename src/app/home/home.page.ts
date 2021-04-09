import { Component, Input } from '@angular/core';
import { MenuController} from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { map } from 'rxjs/operators';
import { ExportarPDFService } from '../services/exportar-pdf.service';
import { GENERAL_CONFIG } from '../../config/generalConfig';
import { DataBaseService } from '../services/data-base.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  logo = GENERAL_CONFIG.datosEmpresa.logo;
  sede = this.storage.datosAdmi.sede;
  Datos = [
    {titulo: 'Dashboard', icono: 'https://i.pinimg.com/originals/0b/92/c1/0b92c1ba5ae239c314ba2ec1dab936ec.png', categoria: 'dashboard'},
    {titulo: 'POS ', icono: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Card_Terminal_POS_Flat_Icon_Vector.svg/1024px-Card_Terminal_POS_Flat_Icon_Vector.svg.png', categoria: 'punto-venta'},
    {titulo: 'Usuarios', icono: 'https://img.icons8.com/color/452/group.png', categoria: 'usuarios'},
    {titulo: 'Reportes', icono: 'https://www.freeiconspng.com/thumbs/report-icon/call-report-icon-3.png', categoria: 'reporte-ventas'},
  ];

  todosProductos = [];
  listaFallos = [];
  constructor(private menuCtrl: MenuController,
              private router: Router,
              public storage: StorageService,
              private dataApi: DataBaseService,
              private afs: AngularFirestore,
              private firebaseStorage: AngularFireStorage,
              private exportar: ExportarPDFService) {
    this.menuCtrl.enable(true);
  }

  categoriaPage(categoria: string) {
    switch (categoria) {
      case 'dashboard':
        this.router.navigate(['/dashboard']); break;
      case 'punto-venta':
        this.router.navigate(['/punto-venta']); break;
      case 'usuarios':
        this.router.navigate(['/usuarios']); break;
      case 'resporte-ventas':
        this.router.navigate(['/resporte-ventas']); break;
    }
  }

  // FUNCIONES PARA USAR RARAS VECES

  getAll() {
    this.dataApi.obtenerListaProductosTodos('Abancay').subscribe(todos => {
      console.log(todos);
      this.todosProductos = todos;
    });
  }

  SUBIRARRAY() {
    let contador = 0;
    this.todosProductos.forEach(element => {
      const arrayLetras = element.nombre.toLowerCase().split(' ');
      element.arrayLetras = arrayLetras;
      // console.log('datos array' + contador + arrayLetras);
      this.dataApi.actualizarArrayNombre('abancay', element.id, element.arrayLetras).then(() => {
        console.log(contador, 'Actualizado array de ', element.nombre);
        console.log(element.arrayLetras);
        contador++;
      });
    });
  }

  ActualizarUrlProductos() {
    let contador = 0;
    this.todosProductos.forEach(element => {
      console.log(element);
      // tslint:disable-next-line:prefer-const
      let storageRef = this.firebaseStorage.storage.ref();
      // tslint:disable-next-line:prefer-const
      let imageRef = storageRef.child('productos/' + element.id + '.jpg');
      console.log('REF: ', imageRef);
      imageRef.getDownloadURL().then((url) => {
        console.log(url);
        this.dataApi.actualizarUrlFoto('abancay', element.id, url).then(() => {
          console.log(contador, 'Actualizado foto de ', element.nombre);
          contador++;
        });
      }).catch(err => {
        console.log('error: ', err);
      });
    });
  }

  consultar(nombre) {
    const consulta = this.afs.collection('sedes').doc('abancay').collection('productos', ref => ref.where('nombre', '==', nombre)
    .limit(1));
    return consulta.snapshotChanges()
            .pipe(map(changes => {
              return changes.map(action => {
              // tslint:disable-next-line:no-shadowed-variable
              const data = action.payload.doc.data();
              data.id = action.payload.doc.id;
              console.log(data);
              return data;
            });
          }));
  }

  getProductos() {
    const sus = this.dataApi.obtenerListaProductosTodos(this.sede).subscribe(datos => {
      sus.unsubscribe();
      console.log(datos);
      this.todosProductos = datos;
    });
  }

  pasarBarraCodigo() {
    let contador = 0;
    this.todosProductos.forEach(element => {
      if (element.codigoBarra) {
        this.afs.collection('sedes').doc('abancay').collection('productos')
        .doc(element.id).update({codigoBarra: null, codigo: element.codigoBarra.toString()}).then(() => {
          contador++;
          console.log('Actualizado ' + contador + ' ' + element.codigoBarra.toString());
        });
      }
    });
  }

  consultFallos() {
    this.exportar.exportAsExcelFile(this.listaFallos, 'faltantes');
  }

  exelDatosGenerales() {
    this.exportar.exportAsExcelFile(this.todosProductos, 'datosAbancay');
  }

  // subirDatos() {
  //     // tslint:disable-next-line:prefer-const
  //     let data = this.categorias.getData();
  //     // console.log(this.datos);
  //     data.forEach( (obj: []) => {
  //       console.log(obj);
  //       obj.forEach( (res: any[]) => {
  //         let contador = 0;
  //         // let contadorFallos = 0;
  //         this.listaFallos = [];
  //         res.forEach(element => {
  //           element.nombre = element.nombre.toLocaleLowerCase();
  //           element.subCategoria = element.subCategoria.toLocaleLowerCase();
  //           element.codigo = element.codigo.toLocaleLowerCase();
  //           element.precio = parseFloat(element.precio);
  //           element.cantStock = parseInt(element.cantStock, 10);
  //           element.cantidad = parseInt(element.cantidad, 10);
  //           // if (element.codigo) {
  //           // element.codigo = element.codigo.toString();
  //           // }
  //           // if (element.codigoBarra) {
  //           //   element.codigoBarra = element.codigoBarra.toString();
  //           //   }
  //           console.log(element);
  //             // tslint:disable-next-line:no-shadowed-variable
  //           // const sus = this.consultar(element.nombre).subscribe((data: any) => {
  //           //   sus.unsubscribe();
  //           //   if (data.length > 0) {
  //           //     contador++;
  //           //     console.log(contador, data[0].id, element.Producto);
  //           //     this.afs.collection('sedes').doc('abancay').collection('productos')
  //           //     .doc(data[0].id).update({codigo: element.codigo.toString()}).then(() => {
  //           //       contador++;
  //           //       console.log('Actualizado ' + contador + ' ' + element.codigo.toString());
  //           //     });
  //           //   } else {
  //           //     contadorFallos++;
  //           //     console.log('FALLOOOOOOOOOOOOOOOOOOOOOOO', contadorFallos, element);
  //           //     // this.presentToast('FALLOS' + element.nombre + 'Cant:' + contadorFallos);
  //           //     this.listaFallos.push(element);
  //           //   }
  //           // });
  //           // nuevos
  //           this.afs.collection('sedes').doc('albrook').collection('productos').add(element).then( resp => {
  //             console.log(contador, 'Ingresado', resp);
  //             contador++;
  //             }).catch(error => {console.error('No se  pudo ingresar los datos', error); });
  //         });
  //         // contador++;
  //         // console.log(contador, ' ', res.dni);
  //         // const dni = res.dni.toString();
  //         // const dato = {
  //         //   dni: res.dni.toString(),
  //         //   codigo: res.codigo.toString(),
  //         //   nombres: res.nombres.toString(),
  //         //   apellidos: res.apellidos.toString(),
  //         //   carrera : res.carrera.toString(),
  //         //   facultad : res.facultad.toString(),
  //         //   tipo : res.tipo.toString()
  //         // };
  //         // console.log('LISTA FALLOS', this.listaFallos);
  //         console.log(res);
  //       });
  //     } );
  //   }
}

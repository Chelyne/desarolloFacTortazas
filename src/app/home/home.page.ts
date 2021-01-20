import { Component, Input } from '@angular/core';
import { MenuController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { CategoriasService } from '../services/categorias.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Validators } from '@angular/forms';
import { DbDataService } from '../services/db-data.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { map } from 'rxjs/operators';
import { ExportarPDFService } from '../services/exportar-pdf.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  Datos = [
    {titulo: 'Pet Shop', icono: '../../assets/img/pet chop.png', categoria: 'petshop'},
    {titulo: 'Estética ', icono: '../../assets/img/estetica.png', categoria: 'estetica'},
    {titulo: 'Clínica', icono: '../../assets/img/clinica.png', categoria: 'clinica'},
    {titulo: 'Farmacia', icono: '../../assets/img/farmacia.png', categoria: 'farmacia'},
    {titulo: 'Pedidos', icono: '../../assets/img/pedidos.png', categoria: 'pedidos'},
    {titulo: 'Notificar', icono: '../../assets/img/notificacion.png', categoria: null},
  ];

  todosProductos = [];
  listaFallos = [];
  constructor(private menuCtrl: MenuController,
              private router: Router,
              public storage: StorageService,
              private toastController: ToastController,
              private dataSrvc: DbDataService,
              private alertController: AlertController,
              private categorias: CategoriasService,
              private afs: AngularFirestore,
              private firebaseStorage: AngularFireStorage,
              private exportar: ExportarPDFService) {
    this.menuCtrl.enable(true);
  }

  categoriaPage(categoria1: string) {
    if (categoria1) {
      switch (categoria1) {
        case 'petshop':
          this.router.navigate(['/categorias-page'], {queryParams: {
            categoria: categoria1,
            sede: this.storage.datosAdmi.sede
          }, skipLocationChange: true});
          break;
        case 'estetica':
          this.router.navigate(['/servicios', 'estetica']); break;
        case 'clinica':
          this.router.navigate(['/servicios', 'clinica']); break;
        case 'farmacia':
          this.router.navigate(['/categorias-page'], {queryParams: {
            categoria: categoria1,
            sede: this.storage.datosAdmi.sede
          }, skipLocationChange: true});
          break;
        case 'pedidos':
          this.router.navigate(['/pedidos']); break;
      }
    } else {
      // this.router.navigate(['/categorias-page']);
      console.log('Alert notificar');
      this.presentAlertPrompt();
      // this.router.navigate(['/notificar']);
    }
  }

  irLIstaProductos() {
    // console.log(categoria);
    this.router.navigate(['/productos-lista', 'farmacia', this.storage.datosAdmi.sede]);
  }
  async presentAlertPrompt() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      backdropDismiss: false,
      header: 'Crear Notificación',
      mode: 'ios',
      // subHeader : '* Complete todos los campos requeridos',
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          placeholder: 'Título',
          // Validators: {},
          attributes: {
            minlength: 5,
            maxlength: 30,
            required: true,
          },
        },
        // multiline input.
        {
          name: 'descripcion',
          // id: 'descripcion',
          type: 'textarea',
          placeholder: 'Descripción',
          attributes: {
            minlength: 5,
            maxlength: 90,
            required: true,
          }
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'primary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Notificar',
          handler: data => {
            console.log('length', data.titulo.length);
            if (data.titulo.length >= 5 && data.descripcion.length >= 5) {
              const dato = {
                titulo: data.titulo,
                descripcion: data.descripcion,
                sede: this.storage.datosAdmi.sede,
                fechaRegistro: new Date()
              };
              console.log('datos', dato);
              this.dataSrvc.guardarNotificcion(dato);
              this.presentToast('Notificación realizada!!');
            }
            else {
              // console.log('no se puede generar los datos');
              this.presentToastError('Datos incompletos');
            }
            // if(isValid(data.username, data.password)) {}
            // console.log('Confirm Ok,', name);
          }
        }
      ]
    });

    await alert.present();
  }
  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      // cssClass: 'primary'
      color: 'primary'
    });
    toast.present();
  }
  async presentToastError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      // cssClass: 'primary'
      color: 'danger'
    });
    toast.present();
  }

  getAll() {
    this.dataSrvc.ObtenerListaProductosTodos('Andahuaylas').subscribe(todos => {
      console.log(todos);
      this.todosProductos = todos;
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
        this.dataSrvc.actualizarUrlFoto('abancay', element.id, url).then(() => {
          console.log(contador, 'Actualizado foto de ', element.nombre);
          contador++;
        });
      }).catch(err => {
        console.log('error: ', err);
      });
    });
  }

  consultar(nombre) {
    const consulta = this.afs.collection('sedes').doc('andahuaylas').collection('productos', ref => ref.where('nombre', '==', nombre)
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

  // getProductos() {
  //   const sus = this.dataSrvc.ObtenerListaProductosSinCat(this.storage.datosAdmi.sede).subscribe(datos => {
  //     sus.unsubscribe();
  //     console.log(datos);
  //     this.todosProductos = datos;
  //   });
  // }

  // pasarBarraCodigo() {
  //   let contador = 0;
  //   this.todosProductos.forEach(element => {
  //     if (element.codigoBarra) {
  //       this.afs.collection('sedes').doc('andahuaylas').collection('productos')
  //       .doc(element.id).update({codigoBarra: null, codigo: element.codigoBarra.toString()}).then(() => {
  //         contador++;
  //         console.log('Actualizado ' + contador + ' ' + element.codigoBarra.toString());
  //       });
  //     }
  //   });
  // }

  consultFallos() {
    this.exportar.exportAsExcelFile(this.listaFallos, 'faltantes');
  }

  subirDatos() {
      // tslint:disable-next-line:prefer-const
      let data = this.categorias.getData();
      // console.log(this.datos);
      data.forEach( (obj: []) => {
        console.log(obj);
        obj.forEach( (res: any[]) => {
          let contador = 0;
          // let contadorFallos = 0;
          this.listaFallos = [];
          res.forEach(element => {
            element.nombre = element.nombre.toLocaleLowerCase();
            element.codigoBarra = element.codigoBarra.toString();
            console.log(element);
              // tslint:disable-next-line:no-shadowed-variable
            // const sus = this.consultar(element.nombre).subscribe((data: any) => {
            //   sus.unsubscribe();
            //   if (data.length > 0) {
            //     contador++;
            //     console.log(contador, data[0].id, element.Producto);
            //     // this.afs.collection('sedes').doc('abancay').collection('productos')
            //     // .doc(data[0].id).update({codigoBarra: element.codigoBarra.toString()}).then(() => {
            //     //   contador++;
            //     //   console.log('Actualizado ' + contador + ' ' + element.codigoBarra.toString());
            //     // });
            //   } else {
            //     contadorFallos++;
            //     console.log('FALLOOOOOOOOOOOOOOOOOOOOOOO', contadorFallos, element);
            //     // this.presentToast('FALLOS' + element.nombre + 'Cant:' + contadorFallos);
            //     this.listaFallos.push(element);
            //   }
            // });
            this.afs.collection('sedes').doc('andahuaylas').collection('productos').add(element).then( resp => {
              console.log(contador, 'Ingresado', resp);
              contador++;
              }).catch(error => {console.error('No se  pudo ingresar los datos', error); });
          });
          // contador++;
          // console.log(contador, ' ', res.dni);
          // const dni = res.dni.toString();
          // const dato = {
          //   dni: res.dni.toString(),
          //   codigo: res.codigo.toString(),
          //   nombres: res.nombres.toString(),
          //   apellidos: res.apellidos.toString(),
          //   carrera : res.carrera.toString(),
          //   facultad : res.facultad.toString(),
          //   tipo : res.tipo.toString()
          // };
          // console.log('LISTA FALLOS', this.listaFallos);
          console.log(res);
        });
      } );
    }

}

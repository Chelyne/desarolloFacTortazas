import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ActionSheetController, ToastController, LoadingController } from '@ionic/angular';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';


@Component({
  selector: 'app-modal-subir-oferta',
  templateUrl: './modal-subir-oferta.page.html',
  styleUrls: ['./modal-subir-oferta.page.scss'],
  providers: [
    DatePipe
  ]
})
export class ModalSubirOfertaPage implements OnInit {
  @Input()sede;
  @Input()editar;
  @Input()datos;
  image: any;
  progress = 0;
  fechaFinal;
  fecha;

  minDate;
  empieza;
  termina;

  loading;
  constructor(private modalController: ModalController,
              // private camera: Camera,
              private actionSheetController: ActionSheetController,
              private firebaseStorage: AngularFireStorage,
              private datePipe: DatePipe,
              private toastController: ToastController,
              private loadingController: LoadingController
              ) {
              // this.fechaFinal = new Date();
              this.fechaFinal = new Date().toISOString();
              console.log(this.fechaFinal);
               }

  ngOnInit() {
    this.empieza = new Date();
    this.minDate = new Date();
    this.minDate = new Date(this.minDate.getTime() - this.minDate.getTimezoneOffset() * 60000).toISOString();
    this.termina = new Date();
    this.termina.setHours(this.termina.getHours() + 1);
    console.log(this.datos);
    // console.log(this.sede,  this.editar, this.datos, this.datos.fechaFinal);
    if (this.datos) {
      this.fecha = this.datos.fecha;
    }
  }

  agregarOferta() {
    if (isNullOrUndefined(this.image) || isNullOrUndefined(this.fechaFinal)) {
      this.presentToast('Por favor complete los datos');
    } else {
      this.presentLoading('Agregando oferta');
      this.uploadImage(this.image).then( url => {
        if (url) {
          this.loading.dismiss();
          this.modalController.dismiss( {
            img: url,
            fechaFinal: this.fechaFinal,
            sede: this.sede
          });
        } else {
          this.presentToast('Error al subir la foto');
        }
      });
    }
  }

  actualizarOferta() {
    console.log(this.image, this.fechaFinal, this.fecha);
    if (isNullOrUndefined(this.image) && (this.datos.fecha === this.fecha)) {
      this.cerrarModal();
    } else {
      if (this.image) {
        this.presentLoading('Actualizando oferta');
        this.uploadImage(this.image).then( url => {
          if (url) {
            this.loading.dismiss();
            this.modalController.dismiss( {
              id: this.datos.id,
              img: url,
              fechaFinal: this.datos.fecha,
              sede: this.sede,
              actualizar: true
            });
          } else {
            this.presentToast('Error al subir la foto');
          }
        });
      } else {
        this.modalController.dismiss( {
          id: this.datos.id,
          fechaFinal: this.datos.fecha,
          sede: this.sede,
          actualizar: true
        });
      }
    }
  }

  // async SubirFoto() {
  //   const actionSheet = await this.actionSheetController.create({
  //     buttons: [{
  //       text: 'Cargar desde Galería',
  //       icon: 'images',
  //       handler: () => {
  //         this.image = null;
  //         // this.sinFoto = null;
  //         this.Openalbum();
  //       }
  //     },
  //     {
  //       text: 'Usar la Cámara',
  //       icon: 'camera',
  //       handler: () => {
  //         this.image = null;
  //         // this.sinFoto = null;
  //         this.Opencamera();
  //       }
  //     },
  //     {
  //       text: 'Cancelar',
  //       icon: 'close-circle-outline',
  //       role: 'cancel'
  //     }]
  //   });
  //   await actionSheet.present();
  // }

  // Opencamera() {
  //   this.camera.getPicture({
  //     destinationType: this.camera.DestinationType.DATA_URL,
  //     sourceType: this.camera.PictureSourceType.CAMERA,
  //     mediaType: this.camera.MediaType.PICTURE,
  //     allowEdit: false,
  //     encodingType: this.camera.EncodingType.PNG,
  //     targetHeight: 720, // 1024,
  //     targetWidth: 720, // 1024,
  //     correctOrientation: true,
  //     saveToPhotoAlbum: true,
  //     quality: 1,
  //   }).then( resultado => {
  //     this.image = 'data:image/jpeg;base64,' + resultado;
  //   }).catch(error => {
  //     this.presentToast('Error al obtener la foto');
  //   });
  // }

  // Openalbum() {
  //   this.camera.getPicture({
  //     destinationType: this.camera.DestinationType.DATA_URL,
  //     sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  //     mediaType: this.camera.MediaType.PICTURE,
  //     allowEdit: false,
  //     encodingType: this.camera.EncodingType.PNG,
  //     targetHeight: 720, // 1024,
  //     targetWidth: 720, // 1024,
  //     correctOrientation: true,
  //     saveToPhotoAlbum: true,
  //     quality: 1,
  //   }).then( resultado => {
  //     this.image = 'data:image/jpeg;base64,' + resultado;
  //     // this.uploadImage(this.image);
  //   }).catch(error => {
  //     this.presentToast('Error al obtener la foto');
  //   });
  // }

  uploadImage(image) {
    return new Promise<any>((resolve, reject) => {
      // tslint:disable-next-line:prefer-const
      let storageRef = this.firebaseStorage.storage.ref();
      const id = this.sede + this.datePipe.transform(new Date(), 'medium');
      // tslint:disable-next-line:prefer-const
      let imageRef = storageRef.child('ofertas/' + id);
      // tslint:disable-next-line:only-arrow-functions
      imageRef.putString(image, 'data_url')
      .then(snapshot => {
        this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(this.progress);
        console.log('Upload is ' + this.progress + '% done');
        console.log(snapshot);
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          console.log('File available at', downloadURL);
          resolve(downloadURL);
        });
      }, err => {
        reject(err);
      });
    });
  }

  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: 5000
    });
    await this.loading.present();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

}

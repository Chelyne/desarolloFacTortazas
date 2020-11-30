import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { Validators, FormControl, FormGroup } from '@angular/forms';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { DbDataService } from '../../services/db-data.service';

@Component({
  selector: 'app-modal-agregar-ver-tips',
  templateUrl: './modal-agregar-ver-tips.page.html',
  styleUrls: ['./modal-agregar-ver-tips.page.scss'],
  providers: [
    DatePipe
  ]
})
export class ModalAgregarVerTipsPage implements OnInit {
  @Input()data;
  tipForm: FormGroup;

  image: any;
  progress = 0;
  constructor(private modalCtrl: ModalController,
              private toastController: ToastController,
              // private camera: Camera,
              private actionSheetController: ActionSheetController,
              private firebaseStorage: AngularFireStorage,
              private datePipe: DatePipe,
              private alertController: AlertController,
              private dataApi: DbDataService) {
    this.tipForm = this.createFormGroup();
   }

  ngOnInit() {
    console.log(this.data);
  }

  createFormGroup() {
    return new FormGroup({
      // tslint:disable-next-line:max-line-length
      titulo: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
      descripcion: new FormControl('', [Validators.required, Validators.min(10)]),
      link: new FormControl('', [Validators.required]),
    });
  }

  get titulo() { return this.tipForm.get('titulo'); }
  get descripcion() { return this.tipForm.get('descripcion'); }
  get link() { return this.tipForm.get('link'); }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }


  GuardarTip() {
    if (this.tipForm.valid) {
      if (this.image) {
        this.uploadImage(this.image).then(url => {
          this.modalCtrl.dismiss({
            titulo: this.tipForm.value.titulo,
            descripcion: this.tipForm.value.descripcion,
            foto: url,
            link: this.tipForm.value.link,
            fecha: new Date()
          });
        });
      } else {
        this.presentToast('Suba una foto');
      }
    } else {
      this.presentToast('Complete todos los datos');
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
      const id = 'tip' + this.datePipe.transform(new Date(), 'medium');
      // tslint:disable-next-line:prefer-const
      let imageRef = storageRef.child('tips/' + id);
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

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

  async presentAlertEliminarTip(id: string) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Eliminar <strong>Tip</strong>?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.dataApi.EliminarTip(id);
            this.cerrarModal();
          }
        }
      ]
    });

    await alert.present();
  }
}

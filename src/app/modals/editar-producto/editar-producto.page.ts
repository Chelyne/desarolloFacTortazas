import { Component, OnInit, Input } from '@angular/core';
import { ModalController, ActionSheetController, LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { DbDataService } from '../../services/db-data.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.page.html',
  styleUrls: ['./editar-producto.page.scss'],
  providers: [DatePipe]
})
export class EditarProductoPage implements OnInit {
  @Input()dataProducto;

  // ----------------
  processing:boolean;
  uploadImage: string | ArrayBuffer;

// ----------------
  sinFoto: string;
  updateForm: FormGroup;
  image: any;
  mensaje: string;
  progress = 0;

  loading;
  constructor(private modalCtrl: ModalController,
              // private camera: Camera,
              private actionSheetController: ActionSheetController,
              private dataApi: DbDataService,
              private datePipe: DatePipe,
              private firebaseStorage: AngularFireStorage,
              private loadingController: LoadingController
              ) {

              //  this.updateForm = this.createFormGroup();

   }

  ngOnInit() {
    this.updateForm = this.createFormGroup();
    console.log('holaola',this.dataProducto);
  }

    // --------------------------
    presentActionSheet(fileLoader) {
      fileLoader.click();
      var that = this;
      fileLoader.onchange = function () {
        var file = fileLoader.files[0];
        var reader = new FileReader();
  
        reader.addEventListener("load", function () {
          that.processing = true;
          that.uploadImage = reader.result;
  
          that.getOrientation(fileLoader.files[0], function (orientation) {
            if (orientation > 1) {
              that.resetOrientation(reader.result, orientation, function (resetBase64Image) {
                that.uploadImage = resetBase64Image;
              });
            } else {
              that.uploadImage = reader.result;
            }
          });
        }, false);
  
        if (file) {
          reader.readAsDataURL(file);
        }
      };
    }
  imageLoaded(){
    this.processing = false;
  }
  
  
  getOrientation(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e:any) {
  
      var view = new DataView(e.target.result);
      if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
      var length = view.byteLength, offset = 2;
      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
          var little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;
          for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) == 0x0112)
              return callback(view.getUint16(offset + (i * 12) + 8, little));
        }
        else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file);
    console.log("fotobase100", this.uploadImage);
  
    this.image = this.uploadImage;
  }
  resetOrientation(srcBase64, srcOrientation, callback) {
    var img = new Image();

    img.onload = function () {
      var width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");

      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, height, width); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
        default: break;
      }

      // draw image
      ctx.drawImage(img, 0, 0);

      // export base64
      callback(canvas.toDataURL());
    };

    img.src = srcBase64;
  }
    removePic() {
      this.uploadImage   = '../../../assets/fondoImg.jpg';
    }
    // -------------------------

  createFormGroup() {
    return new FormGroup({
      id: new FormControl(this.dataProducto.id),
      sede: new FormControl(this.dataProducto.sede),
      nombre: new FormControl(this.dataProducto.nombre, [Validators.required, Validators.minLength(3), Validators.maxLength(65)]),
      cantidad: new FormControl(this.dataProducto.cantidad, [Validators.required, Validators.min(1)]),
      medida: new FormControl(this.dataProducto.medida, [Validators.required]),
      precio: new FormControl(this.dataProducto.precio, [Validators.required]),
      cantStock: new FormControl(this.dataProducto.cantStock, [Validators.required, Validators.min(0)]),
      tallas: new FormControl(this.dataProducto.tallas),
      categoria: new FormControl(this.dataProducto.categoria),
      img: new FormControl(this.dataProducto.img),
      descripcionProducto: new FormControl(this.dataProducto.descripcionProducto),
    });
  }

  
  get nombre() {return this.updateForm.get('nombre'); }
  get cantidad() {return this.updateForm.get('cantidad'); }
  get medida() {return this.updateForm.get('medida'); }
  get precio() {return this.updateForm.get('precio'); }
  get cantStock() {return this.updateForm.get('cantStock'); }

  actualizarProducto() {
    console.log(this.updateForm.value, this.cantStock);
    if (this.dataProducto.categoria === 'farmacia') {
      this.updateForm.removeControl('precio');
      console.log(this.updateForm.value);
    }
    if (isNullOrUndefined(this.updateForm.value.img)) {
      this.updateForm.removeControl('img');
    }
    if (isNullOrUndefined(this.updateForm.value.tallas)) {
      this.updateForm.removeControl('tallas');
    }
    console.log(this.updateForm.value);
    console.log(this.updateForm.valid);
    if (this.updateForm.valid) {
      console.log(this.updateForm.value);
      this.updateForm.value.nombre = this.updateForm.value.nombre.toLowerCase();
      if (this.image) {
        this.presentLoading();
        this.uploadImages(this.image).then (url => {
          this.updateForm.value.img = url;
          console.log(this.updateForm.value);
          this.modalCtrl.dismiss({
            data: this.updateForm.value
          });
          this.loading.dismiss();
        });
      } else {
        console.log(this.updateForm.value);
        this.modalCtrl.dismiss({
          data: this.updateForm.value
        });
      }
    } else {
      this.mensaje = 'Por favor complete los campos correctamente';
    }
  }

  quitarTalla(talla: number) {
    console.log('TALLA', talla);
    const indice =  this.dataProducto.tallas.indexOf(talla);
    console.log('i: ', indice);
    if (indice !== -1) {
      const arreglo = this.dataProducto.tallas;
      arreglo.splice(indice, 1);
      this.dataProducto.tallas = arreglo;
      console.log('quitado', this.dataProducto.tallas);
    }
  }

  uploadImages(image) {
    return new Promise<any>((resolve, reject) => {
      // tslint:disable-next-line:prefer-const
      let storageRef = this.firebaseStorage.storage.ref();
      const id = this.dataProducto.sede + this.datePipe.transform(new Date(), 'medium');
      // tslint:disable-next-line:prefer-const
      let imageRef = storageRef.child('productos/' + id);
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

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  // async SubirFoto() {
  //   const actionSheet = await this.actionSheetController.create({
  //     buttons: [{
  //       text: 'Cargar desde Galería',
  //       icon: 'images',
  //       handler: () => {
  //         this.image = null;
  //         this.Openalbum();
  //       }
  //     },
  //     {
  //       text: 'Usar la Cámara',
  //       icon: 'camera',
  //       handler: () => {
  //         this.image = null;
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
  //     quality: 0.6,
  //   }).then( resultado => {
  //     this.image = 'data:image/jpeg;base64,' + resultado;
  //   }).catch(error => {
  //     console.log(error);
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
  //     quality: 0.6,
  //   }).then( resultado => {
  //     this.image = 'data:image/jpeg;base64,' + resultado;
  //   }).catch(error => {
  //     // window.alert(error);
  //   });
  // }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Actualizando...',
      duration: 5000
    });
    await this.loading.present();
  }
}

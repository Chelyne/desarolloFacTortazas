import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { DbDataService } from '../../services/db-data.service';

@Component({
  selector: 'app-modal-agregar-categorias',
  templateUrl: './modal-agregar-categorias.page.html',
  styleUrls: ['./modal-agregar-categorias.page.scss'],
  providers: [DatePipe]
})
export class ModalAgregarCategoriasPage implements OnInit {
  @Input() sede: string;

// ----------------
processing: boolean;
uploadImage: string | ArrayBuffer;

image: any;
sinFoto: string;
progress = 0;
// ----------------

categoriaForm: FormGroup;
mensaje: string;

loading;

  constructor(
    private dbData: DbDataService,
    private loadingController: LoadingController,
    private firebaseStorage: AngularFireStorage,
    private datePipe: DatePipe,
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    this.categoriaForm = this.createFormGroup();

   }

  ngOnInit() {
    console.log('sede', this.sede); 
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
      categoria: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
    });
  }

  get categoria() {return this.categoriaForm.get('categoria'); }


  guardarCategotia(){
    this.sinFoto = null;
    this.mensaje = null;
    console.log(this.categoriaForm.value);
    // if (isNullOrUndefined(this.image)) {
    //   this.sinFoto = 'Por favor suba una foto';
    // }

    if (this.categoriaForm.valid) {
      if (this.image){
        this.presentLoading('Agregando Categoria');
        this.uploadImages(this.image).then( url => {
          console.log('La url:', url);
          this.categoriaForm.value.img = url;
          this.categoriaForm.value.categoria = this.categoriaForm.value.categoria.toLowerCase();
          this.categoriaForm.value.sede = this.sede;
          this.categoriaForm.value.fechaRegistro = new Date();
          this.dbData.guardarCategoria(this.categoriaForm.value, this.sede);
          this.cerrarModal();
          this.loading.dismiss();
          this.presentToast('Se agregó correctamente.');
          this.onResetForm();
        }).catch(err => {
          this.presentToast('error al subir imagen');
        });
      }else{
        this.categoriaForm.value.img = null;
        this.categoriaForm.value.categoria = this.categoriaForm.value.categoria.toLowerCase();
        this.categoriaForm.value.sede = this.sede;
        this.categoriaForm.value.fechaRegistro = new Date();
        this.dbData.guardarCategoria(this.categoriaForm.value, this.sede);
        this.cerrarModal();
        // this.loading.dismiss();
        this.presentToast('Se agregó correctamente.');
        this.onResetForm();
      }
    }
    if (this.categoriaForm.invalid) {
      this.mensaje = 'Complete todos los campos';
    }
  }

  uploadImages(image) {
    console.log('subir imagen');
    return new Promise<any>((resolve, reject) => {
      // tslint:disable-next-line:prefer-const
      let storageRef = this.firebaseStorage.storage.ref();
      const id = this.sede + this.datePipe.transform(new Date(), 'medium');
      // tslint:disable-next-line:prefer-const
      let imageRef = storageRef.child('categorias/' + id);
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

  onResetForm() {
    this.categoriaForm.reset();
    this.sinFoto = null;
    this.image = null;
    this.progress = 0;
  }

  async presentLoading(mensaje: string) {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: 10000
    });
    await this.loading.present();
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });
    toast.present();
  }

  cerrarModal() {
    this.modalController.dismiss();
  }
}

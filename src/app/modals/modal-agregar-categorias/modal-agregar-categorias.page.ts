import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { GlobalService } from '../../global/global.service';
import { DataBaseService } from '../../services/data-base.service';

@Component({
  selector: 'app-modal-agregar-categorias',
  templateUrl: './modal-agregar-categorias.page.html',
  styleUrls: ['./modal-agregar-categorias.page.scss'],
  providers: [DatePipe]
})
export class ModalAgregarCategoriasPage implements OnInit {
  @Input() sede: string;

  processing: boolean;
  uploadImage: string | ArrayBuffer;

  image: any;
  sinFoto: string;
  progress = 0;

  categoriaForm: FormGroup;
  mensaje: string;

  loading;

  constructor(
    private dataApi: DataBaseService,
    private loadingController: LoadingController,
    private firebaseStorage: AngularFireStorage,
    private datePipe: DatePipe,
    private modalController: ModalController,
    private servGlobal: GlobalService
  ) {
    this.categoriaForm = this.createFormGroup();
   }

  ngOnInit() {
  }

  subirFoto(fileLoader) {
    fileLoader.click();
    fileLoader.onchange = () => {
      const file = fileLoader.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        this.processing = true;
        this.uploadImage = reader.result;
        this.getOrientation(fileLoader.files[0], (orientation) => {
          if (orientation > 1) {
            this.resetOrientation(reader.result, orientation, (resetBase64Image) => {
              this.uploadImage = resetBase64Image;
            });
          } else {
            this.uploadImage = reader.result;
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
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xFFD8) {
        return callback(-2);
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xFFE1) {
          if (view.getUint32(offset += 2, false) !== 0x45786966) {
            return callback(-1);
          }
          const little = view.getUint16(offset += 6, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
              return callback(view.getUint16(offset + (i * 12) + 8, little));
            }
          }
        }else if ((marker && 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file);

    this.image = this.uploadImage;
  }

  resetOrientation(srcBase64, srcOrientation, callback) {
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }
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
      ctx.drawImage(img, 0, 0);
      callback(canvas.toDataURL());
    };
    img.src = srcBase64;
  }

  removePic() {
    this.uploadImage   = '../../../assets/img/load_image.jpg';
  }

  createFormGroup() {
    return new FormGroup({
      categoria: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
    });
  }

  get categoria() {return this.categoriaForm.get('categoria'); }


  async guardarCategoria(){
    this.sinFoto = null;
    this.mensaje = null;

    if (this.categoriaForm.valid) {
      if (this.image){
        await this.presentLoading('Subiendo imagen...');
        this.uploadImages(this.image).then( url => {
          this.categoriaForm.value.img = url;
          this.categoriaForm.value.categoria = this.categoriaForm.value.categoria.toLowerCase();
          this.categoriaForm.value.sede = this.sede;
          this.categoriaForm.value.fechaRegistro = new Date();
          this.dataApi.guardarCategoria(this.categoriaForm.value, this.sede).then(data => {
            this.cerrarModal();
            this.loading.dismiss();
            this.servGlobal.presentToast('Se agregó correctamente.', {color: 'success'});
            this.onResetForm();
          }).catch(err => {
            this.loading.dismiss();
            this.servGlobal.presentToast('No se pudo agregar la categoria.', {color: 'danger'});
          });
        }).catch(err => {
          this.servGlobal.presentToast('error al subir imagen', {color: 'danger'});
        });
      }else{
        this.categoriaForm.value.img = null;
        this.categoriaForm.value.categoria = this.categoriaForm.value.categoria.toLowerCase();
        this.categoriaForm.value.sede = this.sede;
        this.categoriaForm.value.fechaRegistro = new Date();
        this.dataApi.guardarCategoria(this.categoriaForm.value, this.sede);
        this.cerrarModal();
        this.servGlobal.presentToast('Se agregó correctamente.', {color: 'success'});
        this.onResetForm();
      }
    }
    if (this.categoriaForm.invalid) {
      this.mensaje = 'Complete todos los campos';
    }
  }

  uploadImages(image) {
    return new Promise<any>((resolve, reject) => {
      const storageRef = this.firebaseStorage.storage.ref();
      const id = this.sede + this.datePipe.transform(new Date(), 'medium');
      const imageRef = storageRef.child('categorias/' + id);
      imageRef.putString(image, 'data_url')
      .then(snapshot => {
        this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        snapshot.ref.getDownloadURL().then((downloadURL) => {
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

  cerrarModal() {
    this.modalController.dismiss();
  }
}

import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';

import { MEDIDAS } from 'src/app/configs/medidasConfig';
import { GlobalService } from '../../global/global.service';
import { VariantesInterface } from '../../models/variantes';
import { ProductoInterface } from '../../models/ProductoInterface';


@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.page.html',
  styleUrls: ['./editar-producto.page.scss'],
  providers: [DatePipe]
})
export class EditarProductoPage implements OnInit {
  medidas = MEDIDAS;

  @Input()dataProducto;
  listaDeVariantes: VariantesInterface[] = [];

  // ----------------
  processing: boolean;
  uploadImage: string | ArrayBuffer;

// ----------------
  sinFoto: string;
  updateForm: FormGroup;
  image: any;
  mensaje: string;
  progress = 0;

  loading;
  constructor(
    private modalCtrl: ModalController,
    private datePipe: DatePipe,
    private firebaseStorage: AngularFireStorage,
    private loadingController: LoadingController,
    private globalservice: GlobalService
  ) {
  }

  ngOnInit() {
    this.updateForm = this.createFormGroup();
    console.log(this.dataProducto);
    if (this.dataProducto.variantes && this.dataProducto.variantes.length) {
      this.listaDeVariantes = [...this.dataProducto.variantes];
    } else {
      this.listaDeVariantes = [];
    }
  }

    // --------------------------
  presentActionSheet(fileLoader) {
      fileLoader.click();
      const that = this;
      fileLoader.onchange = () => {
        const file = fileLoader.files[0];
        const reader = new FileReader();

        reader.addEventListener('load', () => {
          that.processing = true;
          that.uploadImage = reader.result;

          that.getOrientation(fileLoader.files[0], (orientation) => {
            if (orientation > 1) {
              that.resetOrientation(reader.result, orientation, (resetBase64Image) => {
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
    const reader = new FileReader();
    reader.onload = (e: any) => {

      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xFFD8) { return callback(-2); }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xFFE1) {
          if (view.getUint32(offset += 2, false) !== 0x45786966) { return callback(-1); }
          const little = view.getUint16(offset += 6, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
              return callback(view.getUint16(offset + (i * 12) + 8, little));
            }
          }
        }
        else if ((marker && 0xFF00) !== 0xFF00) { break; }
        else { offset += view.getUint16(offset, false); }
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file);
    console.log('fotobase100', this.uploadImage);

    this.image = this.uploadImage;
  }

  resetOrientation(srcBase64, srcOrientation, callback) {
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

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
    this.image = this.dataProducto.img;
    console.log('elim', this.uploadImage);
  }
    // -------------------------

  createFormGroup() {
    return new FormGroup({
      id: new FormControl(this.dataProducto.id),
      nombre: new FormControl(this.dataProducto.nombre, [Validators.required, Validators.minLength(2), Validators.maxLength(60)]),
      cantidad: new FormControl(this.dataProducto.cantidad, [Validators.required, Validators.min(1)]),
      medida: new FormControl(this.dataProducto.medida, [Validators.required]),
      marca: new FormControl(this.dataProducto.marca, [Validators.minLength(3), Validators.maxLength(65)]),
      codigo: new FormControl(this.dataProducto.codigo, [Validators.minLength(1), Validators.maxLength(20)]),
      codigoBarra: new FormControl(this.dataProducto.codigoBarra, [Validators.minLength(1), Validators.maxLength(15)]),
      precio: new FormControl(this.dataProducto.precio, [Validators.required]),
      cantStock: new FormControl(this.dataProducto.cantStock, [ Validators.min(0)]),
      fechaDeVencimiento: new FormControl(this.dataProducto.fechaDeVencimiento),
      img: new FormControl(this.dataProducto.img),
      sede: new FormControl(this.dataProducto.sede),
      categoria: new FormControl(this.dataProducto.subCategoria, [Validators.required]),
      descripcionProducto: new FormControl(this.dataProducto.descripcionProducto),
    });
  }

  get nombre() {return this.updateForm.get('nombre'); }
  get cantidad() {return this.updateForm.get('cantidad'); }
  get medida() {return this.updateForm.get('medida'); }
  get marca() {return this.updateForm.get('marca'); }
  get codigo() {return this.updateForm.get('codigo'); }
  get codigoBarra() {return this.updateForm.get('codigoBarra'); }
  get precio() {return this.updateForm.get('precio'); }
  get cantStock() {return this.updateForm.get('cantStock'); }
  get fechaDeVencimiento() {return this.updateForm.get('fechaDeVencimiento'); }

  actualizarProducto() {
    if (isNullOrUndefined(this.updateForm.value.img)) {
      this.updateForm.removeControl('img');
    }
    if (this.updateForm.valid) {
      this.updateForm.value.nombre = this.updateForm.value.nombre.toLowerCase();
      const productoUpdate: ProductoInterface = this.updateForm.value;
      if (this.listaDeVariantes.length) {
        productoUpdate.variantes = this.listaDeVariantes;
      }
      if (this.image) {
        this.presentLoading();
        this.uploadImages(this.image).then (url => {
          productoUpdate.img = url;
          this.modalCtrl.dismiss({
            producto: productoUpdate
          });
          this.loading.dismiss();
        });
      } else {
        this.modalCtrl.dismiss({
          producto: productoUpdate
        });
      }
    } else {
      this.mensaje = 'Por favor complete los campos correctamente';
    }
  }

  uploadImages(image) {
    return new Promise<any>((resolve, reject) => {
      const storageRef = this.firebaseStorage.storage.ref();
      const id = this.dataProducto.sede + this.datePipe.transform(new Date(), 'medium');
      const imageRef = storageRef.child('productos/' + id);
      imageRef.putString(image, 'data_url')
      .then(snapshot => {
        this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        // console.log(this.progress);
        // console.log('Upload is ' + this.progress + '% done');
        // console.log(snapshot);
        snapshot.ref.getDownloadURL().then((downloadURL) => {
          // console.log('File available at', downloadURL);
          resolve(downloadURL);
        });
      }, err => {
        reject(err);
      });
    });
  }

  agregarVariante(medida, factor, precio) {
    console.log(medida);
    if (!medida.value || !factor.value || !precio.value) {
      this.globalservice.presentToast('Completa todos los campos', {position: 'middle'});
    } else {
      const item = {
        medida: medida.value,
        factor: factor.value,
        precio: precio.value
      };
      medida.value = '';
      factor.value = '';
      precio.value = '';
      medida.setFocus();
      console.log(item);
      this.listaDeVariantes.push(item);
    }
  }

  quitarVariante(item) {
    const i = this.listaDeVariantes.indexOf( item );
    if ( i !== -1 ) {
      this.listaDeVariantes.splice( i, 1 );
    }
  }

  cerrarModal() {
    this.modalCtrl.dismiss();
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: 'Actualizando...',
      duration: 5000
    });
    await this.loading.present();
  }
}

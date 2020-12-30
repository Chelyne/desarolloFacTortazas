import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, ActionSheetController, ToastController, LoadingController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
// import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { isNullOrUndefined } from 'util';
// import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { DbDataService } from '../../services/db-data.service';
import { CategoriasService } from '../../services/categorias.service';


@Component({
  selector: 'app-modal-agregar-producto',
  templateUrl: './modal-agregar-producto.page.html',
  styleUrls: ['./modal-agregar-producto.page.scss'],
  providers: [DatePipe]
})
export class ModalAgregarProductoPage implements OnInit {
  @ViewChild('inputTalla', {static: false}) inputTalla;
  @ViewChild('inputInventario', {static: false}) inputInventario;
  @ViewChild('inputPrecio', {static: false}) inputPrecio;

  @ViewChild('inventario', {static: false}) inventario;
  @ViewChild('precioTalla', {static: false}) precioTalla;

  @Input() sede: string;
  @Input() categoria: string;
  @Input() subCategoria: string;
  
// ----------------
  processing:boolean;
  uploadImage: string | ArrayBuffer;

// ----------------
  image: any;
  sinFoto: string;
  progress = 0;

  productoForm: FormGroup;
  mensaje: string;

  tallas;
  descripcion;
  loading;

  variable;
  variante = [];
  // ----------
  categorias = [];
  constructor(
    private modalController: ModalController,
    private dbData: DbDataService,
    private actionSheetController: ActionSheetController,
    // private camera: Camera,
    private toastController: ToastController,
    private firebaseStorage: AngularFireStorage,
    private datePipe: DatePipe,
    private loadingController: LoadingController,
    private categoriaService: CategoriasService
    // private imagePicker: ImagePicker,
  ) {
    this.productoForm = this.createFormGroup();

   }

  ngOnInit() {
    console.log(this.sede, this.categoria, this.subCategoria);
    console.log("foto", this.uploadImage);

    this.categorias = this.categoriaService.getcategoriasNegocio(this.categoria);
    console.log('categorias', this.categorias);
    console.log('sede', this.sede);
    console.log('categoria', this.categoria);
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
      // tslint:disable-next-line:max-line-length
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
      categoriass: new FormControl('', [Validators.required]),
      cantidad: new FormControl('', [Validators.required, Validators.min(1)]),
      medida: new FormControl('', [Validators.required]),
      marca: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
      precio: new FormControl('', [Validators.required]),
      cantStock: new FormControl('', [Validators.required, Validators.min(1)]),
      fechaDeVencimiento: new FormControl('', [Validators.required]),
      img: new FormControl(''),
      fechaRegistro: new FormControl(''),
      sede: new FormControl(''),
      categoria: new FormControl(''),
      subCategoria: new FormControl(),
      descripcionProducto: new FormControl(),
      nombreTalla: new FormControl(),
    });
  }

  get nombre() {return this.productoForm.get('nombre'); }
  get categoriass() {return this.productoForm.get('categoriass'); }
  get cantidad() {return this.productoForm.get('cantidad'); }
  get medida() {return this.productoForm.get('medida'); }
  get marca() {return this.productoForm.get('marca'); }
  get precio() {return this.productoForm.get('precio'); }
  get cantStock() {return this.productoForm.get('cantStock'); }
  get fechaDeVencimiento() {return this.productoForm.get('fechaDeVencimiento'); }


  onResetForm() {
    this.productoForm.reset();
    this.sinFoto = null;
    this.image = null;
    this.progress = 0;
  }

  agregarDescripcion() {
    this.descripcion = true;
  }

  agregarTallas() {
    this.mensaje = null;
    console.log(this.inputTalla);
    if (this.tallas === undefined) {
      this.tallas  = [];
    } else if (this.tallas.length === 0 ) {
      if (this.inputTalla.value && this.inputTalla.value.length > 0) {
        // this.tallas.push({talla: this.inputTalla.value, inventario: this.inputInventario.value, precio: this.inputPrecio.value});
        this.tallas.push(this.inputTalla.value);
        console.log(this.tallas);
        this.inputTalla.value = '';
        // this.inputInventario.value = this.productoForm.value.cantStock;
        // this.inputPrecio.value = this.productoForm.value.precio;
        this.inputTalla.setFocus();
        return;
      } else {
        this.presentToast('No puedes agregar un valor vacío');
      }
    }
    if (this.tallas.length < 6 && this.tallas.length > 0) {
      let existe = false;
      this.tallas.forEach(element => {
        console.log('VALIDANDO', element);
        if (this.inputTalla.value === element.talla) {
          this.presentToast('ya se agrego ese valor');
          existe = true;
        }
      });
      if (existe === false) {
        if (this.inputTalla.value && this.inputTalla.value.length > 0) {
          // this.tallas.push({talla: this.inputTalla.value, inventario: this.inputInventario.value, precio: this.inputPrecio.value});
          this.tallas.push(this.inputTalla.value);
          console.log(this.tallas);
          this.inputTalla.value = '';
          // this.inputInventario.value = this.productoForm.value.cantStock;
          // this.inputPrecio.value = this.productoForm.value.precio;
          this.inputTalla.setFocus();
        } else {
          this.presentToast('No puedes agregar un valor vacio');
        }
      }
    } else if (this.tallas.length >= 6) {
      this.presentToast('No puede agregar mas tallas');
    }
  }

  quitarTalla(talla: number) {
    console.log('TALLA', talla);
    const indice =  this.tallas.indexOf(talla);
    console.log('i: ', indice);
    if (indice !== -1) {
      const arreglo = this.tallas;
      arreglo.splice(indice, 1);
      this.tallas = arreglo;
      console.log('quitado', this.tallas);
    }
  }

  guardarProducto() {
    this.sinFoto = null;
    this.mensaje = null;
    console.log(this.productoForm.value);
    console.log('vemos: ', this.precioTalla, this.inventario);
    //this.image = this.uploadImage; 
    //this.image = 'https://i.ya-webdesign.com/images/imagenes-de-frutas-png-14.png';
    if (isNullOrUndefined(this.image)) {
      this.sinFoto = 'Por favor suba una foto';
    }

    if (this.subCategoria === 'farmacia') {
      this.productoForm.removeControl('precio');
    }

    if (this.productoForm.valid && this.categoria && this.image) {
      if ( this.tallas && this.tallas.length > 0) {
        this.productoForm.addControl('tallas', new FormControl(this.tallas));
      } else {
        this.productoForm.removeControl('nombreTalla');
        this.productoForm.removeControl('tallas');
      }
      if (isNullOrUndefined(this.productoForm.value.descripcionProducto)) {
        this.productoForm.removeControl('descripcionProducto');
      }
      this.presentLoading('Agregando producto');
      this.uploadImages(this.image).then( url => {
        console.log('La url:', url);
        this.productoForm.value.img = url;
        this.productoForm.value.nombre = this.productoForm.value.nombre.toLowerCase();
        this.productoForm.value.categoria = this.categoria;
        this.productoForm.value.subCategoria = this.productoForm.value.categoriass.toLowerCase();
        this.productoForm.value.sede = this.sede;
        this.productoForm.value.fechaRegistro = new Date();
        this.dbData.guardarProducto(this.productoForm.value, this.sede);
        this.cerrarModal();
        this.loading.dismiss();
        this.presentToast('Se agregó correctamente.');
        this.onResetForm();
      }).catch(err => {
        this.presentToast('error al subir imagen');
      });
    }
    if (this.productoForm.invalid) {
      this.mensaje = 'Complete todos los campos';
    }
  }

  // subir varias imagenes
  // getImages() {
  //   this.listaImgenes = [];
  //   const options = {
  //     maximumImagesCount: 5,
  //     outputType: 1
  //   };
  //   this.imagePicker.getPictures(options).then((results) => {
  //     results.forEach(element => {
  //       this.listaImgenes.push('data:image/jpeg;base64,' + element);
  //       // alert('Image URI: ' + element);
  //     });
  //     // tslint:disable-next-line:prefer-for-of
  //     // for (let i = 0; i < results.length; i++) {
  //     //     console.log('Image URI: ' + results[i]);
  //     //     // alert('Image URI: ' + results[i]);
  //     // }
  //   }, (err) => { });
  // }

  async SubirFoto() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Cargar desde Galería',
        icon: 'images',
        handler: () => {
          this.image = null;
          this.sinFoto = null;
          // this.Openalbum();
        }
      },
      {
        text: 'Usar la Cámara',
        icon: 'camera',
        handler: () => {
          this.image = null;
          this.sinFoto = null;
        }
      },
      {
        text: 'Cancelar',
        icon: 'close-circle-outline',
        role: 'cancel'
      }]
    });
    await actionSheet.present();
  }

 

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
  //     quality: 1,
  //   }).then( resultado => {
  //     this.image = 'data:image/jpeg;base64,' + resultado;
  //     // this.uploadImage(this.image);
  //   }).catch(error => {
  //     // window.alert(error);
  //   });
  // }
  //TODO - modificar subir imagen a firebase
  uploadImages(image) {
    console.log('subir imagen');
    return new Promise<any>((resolve, reject) => {
      // tslint:disable-next-line:prefer-const
      let storageRef = this.firebaseStorage.storage.ref();
      const id = this.sede + this.datePipe.transform(new Date(), 'medium');
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
    this.tallas = [];
  }

}


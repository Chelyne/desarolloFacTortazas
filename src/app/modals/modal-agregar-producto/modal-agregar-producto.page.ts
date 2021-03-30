import { Component, OnInit, Input } from '@angular/core';
import { ModalController,  LoadingController } from '@ionic/angular';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoriaInterface } from '../../models/CategoriaInterface';
import { StorageService } from '../../services/storage.service';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from 'src/app/global/global.service';

import { MEDIDAS } from 'src/app/configs/medidasConfig';



@Component({
  selector: 'app-modal-agregar-producto',
  templateUrl: './modal-agregar-producto.page.html',
  styleUrls: ['./modal-agregar-producto.page.scss'],
  providers: [DatePipe]
})
export class ModalAgregarProductoPage implements OnInit {
  sede = this.storage.datosAdmi.sede;

  listaDeCategorias: CategoriaInterface[] = [{categoria: 'accesorios'}];

// ----------------
  processing: boolean;
  uploadImage: string | ArrayBuffer;

// ----------------
  image: any;
  progress = 0;

  productoForm: FormGroup;
  mensaje: string;

  loading;
  correlacionActual;

  medidas = MEDIDAS;

  constructor(
    private dataApi: DataBaseService,
    private globalservice: GlobalService,
    private modalController: ModalController,
    private firebaseStorage: AngularFireStorage,
    private datePipe: DatePipe,
    private loadingController: LoadingController,
    private storage: StorageService,
  ) {
    this.ObtenerCorrelacionProducto();
    this.productoForm = this.createFormAgregarProducto();
    this.ObtenerCategorias();
   }

  ngOnInit() {
  }
  // obtener lista de categorias
   ObtenerCategorias(){
    this.dataApi.obtenerListaCategorias(this.sede).subscribe(data => {
      if (data.length) {
        this.listaDeCategorias = data;
      } else {
        this.globalservice.presentToast('Por favor agregue un categoria para agregar productos');
      }
    });
  }

   // obtener correlacion del producto
   ObtenerCorrelacionProducto(){
    this.dataApi.obtenerObjetoCorrelacionProducto(this.sede).subscribe((datoo: any)  => {
      if (datoo.id) {
        this.correlacionActual = datoo.correlacionProducto;
        this.productoForm.setControl('codigo',
        new FormControl( datoo.correlacionProducto.toString(), [Validators.minLength(1), Validators.maxLength(20)]) );
      }
    });
  }

  // -------------------------- SUBIR IMAGEN
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
    reader.onload = (e: any) =>  {

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
          if (view.getUint32(offset += 2, false) !== 0x45786966){
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
        } else if ((marker && 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
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
      const  height = img.height;
      const  canvas = document.createElement('canvas');
      const  ctx = canvas.getContext('2d');

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
    this.uploadImage   = '../../../assets/img/load_image.jpg';
  }
  // ------------------------- FIN SUBIR IMAGEN

  createFormAgregarProducto() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]),
      cantidad: new FormControl('', [Validators.required, Validators.min(1)]),
      medida: new FormControl('unidad', [Validators.required]),
      marca: new FormControl('', [Validators.minLength(3), Validators.maxLength(65)]),
      codigo: new FormControl('', [Validators.minLength(1), Validators.maxLength(20)]),
      codigoBarra: new FormControl('', [Validators.minLength(1), Validators.maxLength(15)]),
      precio: new FormControl('', [Validators.required]),
      cantStock: new FormControl('', [Validators.min(1)]),
      fechaDeVencimiento: new FormControl(),
      img: new FormControl(''),
      fechaRegistro: new FormControl(''),
      sede: new FormControl(''),
      categoria: new FormControl(),
      subCategoria: new FormControl(this.listaDeCategorias[0].categoria, [Validators.required]),
      descripcionProducto: new FormControl(),
    });
  }

  get nombre() {return this.productoForm.get('nombre'); }
  get subCategoria() {return this.productoForm.get('subCategoria'); }
  get cantidad() {return this.productoForm.get('cantidad'); }
  get medida() {return this.productoForm.get('medida'); }
  get marca() {return this.productoForm.get('marca'); }
  get codigo() {return this.productoForm.get('codigo'); }
  get codigoBarra() {return this.productoForm.get('codigoBarra'); }
  get precio() {return this.productoForm.get('precio'); }
  get cantStock() {return this.productoForm.get('cantStock'); }
  get fechaDeVencimiento() {return this.productoForm.get('fechaDeVencimiento'); }


  onResetForm() {
    this.productoForm.reset();
    this.image = null;
    this.progress = 0;
  }

  guardarProducto() {
    this.mensaje = null;
    if (this.productoForm.valid ) {
      this.productoForm.value.nombre = this.productoForm.value.nombre.toLowerCase();
      this.productoForm.value.categoria = 'petshop'; // SOLO TOOBY
      this.productoForm.value.subCategoria = this.productoForm.value.subCategoria.toLowerCase();
      this.productoForm.value.sede = this.sede;
      this.productoForm.value.fechaRegistro = new Date();
      if (this.image){
        this.presentLoading('Agregando producto');
        this.uploadImages(this.image).then( url => {
          console.log('La url:', url);
          this.productoForm.value.img = url;
          this.dataApi.guardarProductoIncrementaCodigo(this.productoForm.value, this.sede, this.correlacionActual).then( resp => {
            this.cerrarModal();
            this.loading.dismiss();
            this.globalservice.presentToast('Se agregó correctamente.', {color: 'success', position: 'top'});
            this.onResetForm();

          }).catch( err => {
            if (err === 'fail'){
              this.globalservice.presentToast('No se pudo agregar el producto.', {color: 'danger', position: 'top'});
            }else {
              this.globalservice.presentToast('Se agrego el producto, pero no se incremento el codigo del producto.',
              {color: 'Warning', position: 'top'});

            }
          });
        }).catch(err => {
          this.globalservice.presentToast('error al subir imagen.', {color: 'danger', position: 'top'});

        });
      }else{
          this.productoForm.value.img = null;
          this.dataApi.guardarProductoIncrementaCodigo(this.productoForm.value, this.sede, this.correlacionActual).then( resp => {
            this.cerrarModal();
            this.onResetForm();
            this.globalservice.presentToast('Se agregó correctamente.', {color: 'success', position: 'top'});

          }).catch( err => {
            if (err === 'fail'){
              this.globalservice.presentToast('No se pudo agregar el producto.', {color: 'danger', position: 'top'});
            }else {
              this.globalservice.presentToast('Se agrego el producto, pero no se incremento el codigo del producto.',
              {color: 'Warning', position: 'top'});

            }
          });
      }
    }
    else {
      this.mensaje = 'Complete todos los campos';
    }
  }

  // TODO - modificar subir imagen a firebase
  uploadImages(image) {
    console.log('subir imagen');
    return new Promise<any>((resolve, reject) => {
      const storageRef = this.firebaseStorage.storage.ref();
      const id = this.sede + this.datePipe.transform(new Date(), 'medium');
      const imageRef = storageRef.child('productos/' + id);
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

  cerrarModal() {
    this.modalController.dismiss();
  }

}


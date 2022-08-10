import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { GlobalService } from '../../global/global.service';
import { DataBaseService } from '../../services/data-base.service';
import { StorageService } from 'src/app/services/storage.service';
import { CategoriaInterface } from 'src/app/models/CategoriaInterface';
import { GENERAL_CONFIG } from 'src/config/generalConfig';

@Component({
  selector: 'app-modal-agregar-categorias',
  templateUrl: './modal-agregar-categorias.page.html',
  styleUrls: ['./modal-agregar-categorias.page.scss'],
  providers: [DatePipe]
})
export class ModalAgregarCategoriasPage implements OnInit {

  sede = this.storage.datosAdmi.sede;


  // processing: boolean;
  // uploadImage: string | ArrayBuffer;

  // image: any;
  // sinFoto: string;
  // progress = 0;

  categoriaForm: FormGroup;
  mensaje: string;

  // loading;

  /** ambos son la misma imagen */
  imagenBin64: string | ArrayBuffer = '';
  imagenTargetFile: any = '';
  imagenUrl = '';
  AgregarTodoSedes =  false;
  listaSedes = GENERAL_CONFIG.listaSedes;
  categoriaFormateada;

  constructor(
    private dataApi: DataBaseService,
    private datePipe: DatePipe,
    private modalController: ModalController,
    private servGlobal: GlobalService,
    public storage: StorageService,
  ) {
    this.categoriaForm = this.createFormGroup();
   }



  ngOnInit() {
  }

  // subirFoto(fileLoader) {
  //   fileLoader.click();
  //   fileLoader.onchange = () => {
  //     const file = fileLoader.files[0];
  //     const reader = new FileReader();
  //     reader.addEventListener('load', () => {
  //       this.processing = true;
  //       this.uploadImage = reader.result;
  //       this.getOrientation(fileLoader.files[0], (orientation) => {
  //         if (orientation > 1) {
  //           this.resetOrientation(reader.result, orientation, (resetBase64Image) => {
  //             this.uploadImage = resetBase64Image;
  //           });
  //         } else {
  //           this.uploadImage = reader.result;
  //         }
  //       });
  //     }, false);
  //     if (file) {
  //       reader.readAsDataURL(file);
  //     }
  //   };
  // }

  // imageLoaded(){
  //   this.processing = false;
  // }

  // getOrientation(file, callback) {
  //   const reader = new FileReader();
  //   reader.onload = (e: any) => {
  //     const view = new DataView(e.target.result);
  //     if (view.getUint16(0, false) !== 0xFFD8) {
  //       return callback(-2);
  //     }
  //     const length = view.byteLength;
  //     let offset = 2;
  //     while (offset < length) {
  //       const marker = view.getUint16(offset, false);
  //       offset += 2;
  //       if (marker === 0xFFE1) {
  //         if (view.getUint32(offset += 2, false) !== 0x45786966) {
  //           return callback(-1);
  //         }
  //         const little = view.getUint16(offset += 6, false) === 0x4949;
  //         offset += view.getUint32(offset + 4, little);
  //         const tags = view.getUint16(offset, little);
  //         offset += 2;
  //         for (let i = 0; i < tags; i++) {
  //           if (view.getUint16(offset + (i * 12), little) === 0x0112) {
  //             return callback(view.getUint16(offset + (i * 12) + 8, little));
  //           }
  //         }
  //       }else if ((marker && 0xFF00) !== 0xFF00) {
  //         break;
  //       } else {
  //         offset += view.getUint16(offset, false);
  //       }
  //     }
  //     return callback(-1);
  //   };
  //   reader.readAsArrayBuffer(file);

  //   this.image = this.uploadImage;
  // }

  // resetOrientation(srcBase64, srcOrientation, callback) {
  //   const img = new Image();
  //   img.onload = () => {
  //     const width = img.width;
  //     const height = img.height;
  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
  //     if (4 < srcOrientation && srcOrientation < 9) {
  //       canvas.width = height;
  //       canvas.height = width;
  //     } else {
  //       canvas.width = width;
  //       canvas.height = height;
  //     }
  //     switch (srcOrientation) {
  //       case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
  //       case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
  //       case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
  //       case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
  //       case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
  //       case 7: ctx.transform(0, -1, -1, 0, height, width); break;
  //       case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
  //       default: break;
  //     }
  //     ctx.drawImage(img, 0, 0);
  //     callback(canvas.toDataURL());
  //   };
  //   img.src = srcBase64;
  // }

  // removePic() {
  //   this.uploadImage   = '../../../assets/img/load_image.jpg';
  // }

  createFormGroup() {
    return new FormGroup({
      categoria: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(45)]),
    });
  }

  get categoria() {return this.categoriaForm.get('categoria'); }


  // async guardarCategoria(){
  //   this.sinFoto = null;
  //   this.mensaje = null;

  //   if (this.categoriaForm.valid) {
  //     if (this.image){
  //       await this.presentLoading('Subiendo imagen...');
  //       this.uploadImages(this.image).then( url => {
  //         this.categoriaForm.value.img = url;
  //         this.categoriaForm.value.categoria = this.categoriaForm.value.categoria.toLowerCase();
  //         this.categoriaForm.value.sede = this.sede;
  //         this.categoriaForm.value.fechaRegistro = new Date();
  //         this.dataApi.guardarCategoria(this.categoriaForm.value, this.sede).then(data => {
  //           this.cerrarModal();
  //           this.loading.dismiss();
  //           this.servGlobal.presentToast('Se agregó correctamente.', {color: 'success'});
  //           this.onResetForm();
  //         }).catch(err => {
  //           this.loading.dismiss();
  //           this.servGlobal.presentToast('No se pudo agregar la categoria.', {color: 'danger'});
  //         });
  //       }).catch(err => {
  //         this.servGlobal.presentToast('error al subir imagen', {color: 'danger'});
  //       });
  //     }else{
  //       this.categoriaForm.value.img = null;
  //       this.categoriaForm.value.categoria = this.categoriaForm.value.categoria.toLowerCase();
  //       this.categoriaForm.value.sede = this.sede;
  //       this.categoriaForm.value.fechaRegistro = new Date();
  //       this.dataApi.guardarCategoria(this.categoriaForm.value, this.sede);
  //       this.cerrarModal();
  //       this.servGlobal.presentToast('Se agregó correctamente.', {color: 'success'});
  //       this.onResetForm();
  //     }
  //   } else  {
  //     this.mensaje = 'Complete todos los campos';
  //   }
  // }

  // uploadImages(image) {
  //   return new Promise<any>((resolve, reject) => {
  //     const storageRef = this.firebaseStorage.storage.ref();
  //     const id = this.sede + this.datePipe.transform(new Date(), 'medium');
  //     const imageRef = storageRef.child('categorias/' + id);
  //     imageRef.putString(image, 'data_url')
  //     .then(snapshot => {
  //       this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //       snapshot.ref.getDownloadURL().then((downloadURL) => {
  //         resolve(downloadURL);
  //       });
  //     }, err => {
  //       reject(err);
  //     });
  //   });
  // }

  // onResetForm() {
  //   this.categoriaForm.reset();
  //   this.sinFoto = null;
  //   this.image = null;
  //   this.progress = 0;
  // }


  onResetForm() {
    this.categoriaForm.reset();
    // this.progress = 0;
    this.removePic(); /** resetea datos de imagen */
  }

  // async presentLoading(mensaje: string) {
  //   this.loading = await this.loadingController.create({
  //     cssClass: 'my-custom-class',
  //     message: mensaje,
  //     duration: 10000
  //   });
  //   await this.loading.present();
  // }

  cerrarModal() {
    this.modalController.dismiss();
  }
  async guadarCategoriaenSedes(){
    if (this.AgregarTodoSedes) {
    let contador = 0;
    let id;
    for (const sede of GENERAL_CONFIG.listaSedes) {
      console.log(contador, 'agregando en sede', sede, this.categoriaForm.value);
      if (contador === 0) {
        await this.guardarCatogiaV2(this.sede).then(res => {
          console.log('agregado en sede local', res);
          id = res;
        });
      }else {
        console.log('siguientes', sede, 'con id ', id);
        await this.guardarCatogiaConId(sede, this.categoriaFormateada , id).then(() => 'exitaso').catch(() => 'error');
      }
      contador ++;
    }
    this.onResetForm();
    this.cerrarModal();
    }else {
      console.log('agregar solo en sede local');
      this.guardarCatogiaV2(this.sede).then(res => {
        console.log('exito', res);
        this.onResetForm();
        this.cerrarModal();
      });
    }
  }

  async guardarCatogiaV2(sede: string){
    if (this.categoriaForm.valid){

      // await this.presentLoading();
      const loadingControler =  await this.servGlobal.presentLoading('Agregando Categoría...', {duracion: 10000});


      if (this.imagenBin64){

        console.log('%c%s', 'color: #00a3cc', 'new imagen');
        /** subir imagen */
        this.imagenUrl = await this.configurarYsubirImagen().catch(() => '');

        if (!this.imagenUrl){
          this.servGlobal.presentToast('error al subir imagen.', {color: 'danger', position: 'top'});
          // this.loading.dismiss();
          loadingControler.dismiss();
          return;
        }
      }

      if (!this.imagenBin64){

        console.log('%c%s', 'color: #00e600', 'misma imagen' );
      }

      /** formatear producto */
      const categoria = this.formatearCategoria();
      this.categoriaFormateada = categoria;

      /** guardar Categoria */

      return this.dataApi.guardarCategoria(categoria, sede).then( (res) => {
        console.log('respuestass', res);

        this.servGlobal.presentToast('Se agregó correctamente.', {color: 'success'});

        loadingControler.dismiss();
        return res;
      }).catch( () => {
        this.servGlobal.presentToast('No se pudo agregar la categoria.', {color: 'danger'});
        loadingControler.dismiss();
      });

    } else {
      this.mensaje = 'completa todos los campos';
    }
  }
  async guardarCatogiaConId(sede: string, formatoCategoria, idCategoria){

      // await this.presentLoading();
      const loadingControler =  await this.servGlobal.presentLoading('Agregando Categoría en sede ...' + sede, {duracion: 10000});
      /** guardar Categoria */
      return this.dataApi.guardarCategoriaconID(formatoCategoria, sede, idCategoria).then( (res) => {
        console.log('respuestass', res);
        this.cerrarModal();
        this.servGlobal.presentToast('Se agregó correctamente en sede: ' + sede, {color: 'success'});
        loadingControler.dismiss();
        return res;
      }).catch( () => {
        this.servGlobal.presentToast('No se pudo agregar la categoriaen sede: ' + sede, {color: 'danger'});
        loadingControler.dismiss();
      });


  }

  formatearCategoria(): CategoriaInterface{

    const refProdForm = this.categoriaForm.value;
    console.log('subCategoria', refProdForm.subCategoria);

    const categoria: CategoriaInterface = {
      img: this.imagenUrl || this.imagenUrl,
      categoria: refProdForm.categoria.toLowerCase(),
      fechaTimeRegistro: new Date()
    };

    return categoria;
  }




  async abrirFileExplorer(fileLoader) {
    console.log('Ejecutando file loader');
    /** Muestra el cuadro de dialogo para seleccionar archivo */
    fileLoader.click();

    fileLoader.onchange = () => {
      if (fileLoader.files && fileLoader.files[0]) {

        this.imagenTargetFile = fileLoader.files[0];

        const reader = new FileReader();

        /** se crea el evento */
        reader.onload = (async (image) => {
          this.imagenBin64 = image.target.result as string;
          this.verificarDimension(image.target.result);

          const dim = await this.ObtenerDimensionesDeImagen();
          console.log('Dimensiones de imagen', dim.ancho, dim.alto);
        });

        /** se ejecuta el evento */
        reader.readAsDataURL(fileLoader.files[0]);

      }
    };

  }
  // ------------------------- FIN SUBIR IMAGEN
  async configurarYsubirImagen() {
    /**
     * @objetivo : configurar imagen y subirlo a firestorage
     * @return: retorna la url de la imagen en firestorege
     */

    /** config */
    const path = 'categorias';
    const name = this.sede + this.datePipe.transform(new Date(), 'medium');
    const file = this.imagenTargetFile; // imagenTargetFile

    const res = await this.servGlobal.subirImagen(file, path, name).catch(() => '');

    console.log('enlace de respuesta: ', res);
    return res;
  }

  async ObtenerDimensionesDeImagen() {
    const img = new Image();
    const dimensiones = {
      ancho: 0,
      alto: 0
    };

    let imgIsLoad = false;

    img.onload = () => {
      console.log('la imagen se cargo');
      imgIsLoad = true;
      console.log('ancho de imagen', img.width, img.height);
      dimensiones.ancho = img.width;
      dimensiones.alto = img.height;

    };


    img.src = String(this.imagenBin64);


    return dimensiones;
  }

  verificarDimension(imageBase64: any) {
    const img = new Image();

    img.onload = () => {
      if (img.width > 500 || img.height > 500) {
        this.RedimensionarImagen(imageBase64, 500, 500);
      }
    };

    img.src = String(this.imagenBin64);
  }

  RedimensionarImagen(imagenBase64: any, width: number, height: number) {
    const img = new Image();
    /** se declara el evento onload imagen */
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;

      /** Poner la imagen redimensionada en el canvas */
      ctx.drawImage(img, 0, 0, width, height);

      /** exportar la imagen en base 64 */
      this.imagenBin64 = canvas.toDataURL();

      /** convertir la imagen canvas a blob */
      const imgb64 = canvas.toDataURL(); /** base64 de la imagen */
      const png = imgb64.split(',')[1];
      const binary = this.fixBinary(window.atob(png)); // <-- Usamos la fn "fixBinary"
      const thefile = new Blob([binary], { type: 'image/png' }); // <-- Sacamos el encode
      const imagen = new File([thefile], 'imagen_redimensionada.png', { type: 'image/png' });
      this.imagenTargetFile = imagen;

    };

    /** se ejecuta el evento onload */
    img.src = imagenBase64;
  }

  fixBinary(bin) {
    const length = bin.length;
    const buf = new ArrayBuffer(length);
    const arr = new Uint8Array(buf);
    for (let i = 0; i < length; i++) {
      arr[i] = bin.charCodeAt(i);
    }
    return buf;
  }

  removePic() {
    // this.uploadImage   = '../../../assets/img/load_image.jpg';
    this.imagenBin64 = '';
    this.imagenTargetFile = '';
    this.imagenUrl = '';
  }
  // ------------------------- FIN SUBIR IMAGEN


}

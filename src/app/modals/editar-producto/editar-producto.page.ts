import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined } from 'util';

import { GlobalService } from '../../global/global.service';
import { ProductoInterface, VariantesInterface } from '../../models/ProductoInterface';
import { MEDIDAS } from 'src/config/medidasConfig';
import { DecimalOnlyValidation, DECIMAL_REGEXP_PATTERN } from 'src/app/global/validadores';
import { DataBaseService } from 'src/app/services/data-base.service';
import { CategoriaInterface } from 'src/app/models/CategoriaInterface';
import { StorageService } from 'src/app/services/storage.service';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.page.html',
  styleUrls: ['./editar-producto.page.scss'],
  providers: [DatePipe]
})
export class EditarProductoPage implements OnInit {

  /** AFI */
  decimalOnlyValidation = DecimalOnlyValidation;
  medidas = MEDIDAS;

  @Input() dataProducto: ProductoInterface;
  listaDeCategorias: CategoriaInterface[] = [{categoria: 'accesorios'}];
  obsCategoria: any;
  listaDeVariantes: VariantesInterface[] = [];

  // processing: boolean;
  // uploadImage: string | ArrayBuffer;

  // sinFoto: string;
  updateForm: FormGroup;
  // image: any;
  mensaje: string;
  // progress = 0;

  loading;

  /** ambos son la misma imagen */
  imagenBin64: string | ArrayBuffer;
  imagenTargetFile: any;
  imagenUrl: string;

  sede = this.storage.datosAdmi.sede;

  constructor(
    private modalCtrl: ModalController,
    private datePipe: DatePipe,
    private fireStorage: AngularFireStorage,
    private loadingController: LoadingController,
    private globalservice: GlobalService,
    private dataApi: DataBaseService,
    private storage: StorageService
  ) {
    this.ObtenerCategorias();
  }

  ngOnInit() {
    this.updateForm = this.createFormGroup();
    // this.updateForm = this.createFormGroup();
    // console.log(this.dataProducto);
    if (this.dataProducto.variantes && this.dataProducto.variantes.length) {
      this.listaDeVariantes = [...this.dataProducto.variantes];
    } else {
      this.listaDeVariantes = [];
    }
    this.imagenUrl = this.dataProducto.img;

    this.listaDeCategorias.push({categoria: this.dataProducto.subCategoria});
  }

  ionViewWillEnter(){

  }


    /** obtener lista de categorias */
    ObtenerCategorias(){
      this.obsCategoria = this.dataApi.obtenerListaCategorias(this.sede);
      this.obsCategoria.subscribe(data => {
        if (data.length) {
          this.listaDeCategorias = data;
        } else {
          this.globalservice.presentToast('Por favor agregue un categoria para agregar productos');
        }
      });
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
    this.imagenUrl =  this.dataProducto.img;
  }
    // -------------------------

  createFormGroup() {
    return new FormGroup({
      id: new FormControl(this.dataProducto.id),
      nombre: new FormControl(this.dataProducto.nombre, [Validators.required, Validators.minLength(3), Validators.maxLength(60)]),
      cantidad: new FormControl(this.dataProducto.cantidad, [Validators.required, Validators.min(1)]),
      medida: new FormControl(this.dataProducto.medida, [Validators.required]),
      marca: new FormControl(this.dataProducto.marca, [Validators.minLength(3), Validators.maxLength(20)]),
      codigo: new FormControl(this.dataProducto.codigo, [Validators.minLength(1), Validators.maxLength(20)]),
      codigoBarra: new FormControl(this.dataProducto.codigoBarra, [Validators.minLength(1), Validators.maxLength(15)]),
      precio: new FormControl(this.dataProducto.precio, [Validators.required]),
      cantStock: new FormControl(this.dataProducto.cantStock),
      fechaDeVencimiento: new FormControl(this.dataProducto.fechaDeVencimiento),
      img: new FormControl(this.dataProducto.img),
      sede: new FormControl(this.dataProducto.sede),
      categoria: new FormControl(),
      subCategoria: new FormControl(this.dataProducto.subCategoria, [Validators.required]),
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
  get subCategoria() {return this.updateForm.get('subCategoria'); }


  async actualizarProductoV2(){
    console.log('aaaaaaaaaaaaaaaaaaaaaaaa');
    console.log(this.imagenBin64, this.imagenTargetFile, this.imagenUrl);
    if (this.updateForm.valid){

      // await this.presentLoading();
      const newLoading =  await this.globalservice.presentLoading('Actualizando producto...', {duracion: 10000});


      if (this.imagenBin64){

        /** debes preguntarte si hay una imagena anterior y eliminarlo */
        if (this.dataProducto.img){
          await this.globalservice.ElimarImagen(this.dataProducto.img);
        }

        console.log('%c%s', 'color: #00a3cc', 'new imagen');
        /** subir imagen */
        this.imagenUrl = await this.configurarYsubirImagen().catch(() => '');

        if (!this.imagenUrl){
          this.globalservice.presentToast('error al subir imagen.', {color: 'danger', position: 'top'});
          // this.loading.dismiss();
          newLoading.dismiss();
          return;
        }
      }

      if (!this.imagenBin64){

        console.log('%c%s', 'color: #00e600', 'misma imagen' );
      }

      console.log('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');

      /** formatear producto */
      const producto = this.formatearProducto();
      console.log('ccccccccccccccccccccccccccccc');

      /** guardar producto */
      this.dataApi.actualizarProducto(producto).then(() => {

        this.cerrarModal();
        this.globalservice.presentToast('Producto se actualizó correctamente', {color: 'success', position: 'top'});
        this.onResetForm();
        // this.loading.dismiss();
        newLoading.dismiss();

      }).catch(() => {
        this.globalservice.presentToast('Producto no se actualizó', {color: 'danger', position: 'top'});
        newLoading.dismiss();
      });

    } else {
      this.mensaje = 'completa todos los campos';
    }
    console.log('zzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
  }

  onResetForm() {
    this.updateForm.reset();
    // this.progress = 0;
    this.removePic(); /** resetea datos de imagen */
  }


  async configurarYsubirImagen(){
    /**
     * @objetivo : configurar imagen y subirlo a firestorage
     * @return: retorna la url de la imagen en firestorege
     */

    /** config */
    const path = 'productos';
    const name = this.dataProducto.sede + this.datePipe.transform(new Date(), 'medium');
    const file = this.imagenTargetFile; // imagenTargetFile
    console.log('fffffffffffffffffffffffffffff', file, path, name);
    const res = await this.globalservice.subirImagen(file, path, name).catch(() => '');

    console.log('RESSSSSSSSSSSSSSSSSSS', res);

    console.log('enlace de respuesta: ', res);
    return res;
  }


  formatearProducto(): ProductoInterface{

    const refProdForm = this.updateForm.value;
    console.log('subCategoria', refProdForm.subCategoria);

    const producto: ProductoInterface = {
      id: this.dataProducto.id,
      img: this.imagenUrl || null,
      nombre: refProdForm.nombre.toLowerCase(),
      cantidad: parseFloat(refProdForm.cantidad),
      precio: parseFloat(refProdForm.precio),
      sede: this.dataProducto.sede,
      medida: refProdForm.medida.toLowerCase(),
      cantStock: parseFloat(refProdForm.cantStock) || 0,
      // categoria: 'petshop',
      subCategoria: refProdForm.subCategoria.toLowerCase(),
      descripcionProducto: refProdForm.descripcionProducto,
      marca: refProdForm.marca ? refProdForm.marca.toLowerCase() : null,
      codigo: refProdForm.codigo,
      codigoBarra: refProdForm.codigoBarra,
      fechaDeVencimiento: refProdForm.fechaDeVencimiento,
      variantes: this.listaDeVariantes
    };

    console.log('producto a guardar', producto);

    return producto;
  }



  // actualizarProducto() {
  //   if (isNullOrUndefined(this.updateForm.value.img)) {
  //     this.updateForm.removeControl('img');
  //   }
  //   if (this.updateForm.valid) {
  //     this.updateForm.value.nombre = this.updateForm.value.nombre.toLowerCase();
  //     const productoUpdate: ProductoInterface = this.updateForm.value;
  //     if (this.listaDeVariantes.length) {
  //       productoUpdate.variantes = this.listaDeVariantes;
  //     }
  //     if (this.image) {
  //       this.presentLoading();
  //       this.uploadImages(this.image).then (url => {
  //         productoUpdate.img = url;
  //         this.modalCtrl.dismiss({
  //           producto: productoUpdate
  //         });
  //         this.loading.dismiss();
  //       });
  //     } else {
  //       this.modalCtrl.dismiss({
  //         producto: productoUpdate
  //       });
  //     }
  //   } else {
  //     this.mensaje = 'Por favor complete los campos correctamente';
  //   }
  // }

  // uploadImages(image) {
  //   return new Promise<any>((resolve, reject) => {
  //     const storageRef = this.firebaseStorage.storage.ref();
  //     const id = this.dataProducto.sede + this.datePipe.transform(new Date(), 'medium');
  //     const imageRef = storageRef.child('productos/' + id);
  //     imageRef.putString(image, 'data_url')
  //     .then(snapshot => {
  //       this.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //       // console.log(this.progress);
  //       // console.log('Upload is ' + this.progress + '% done');
  //       // console.log(snapshot);
  //       snapshot.ref.getDownloadURL().then((downloadURL) => {
  //         // console.log('File available at', downloadURL);
  //         resolve(downloadURL);
  //       });
  //     }, err => {
  //       reject(err);
  //     });
  //   });
  // }




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

  // async presentLoading() {
  //   this.loading = await this.loadingController.create({
  //     cssClass: 'my-custom-class',
  //     message: 'Actualizando...',
  //     duration: 5000
  //   });
  //   await this.loading.present();
  // }

  decoficarName(){

  }

  deleteFireBaseStorageItem() {

    // let filePath = 'https://firebasestorage.googleapis.com/v0/b/dial-in-21c50.appspot.com/o/
    // default_images%2Fuser.png?alt=media&token=c2ccceec-8d24-42fe-b5c0-c987733ac8ae'
    //   .replace('https://firebasestorage.googleapis.com/v0/b/dial-in-21c50.appspot.com/o/', '');

    console.log('%c%s', 'color: #0088cc', this.imagenUrl);
    const filePath = this.imagenUrl.replace('https://firebasestorage.googleapis.com/v0/b/toobyfe.appspot.com/o/', '');

    console.log('%c%s', 'color: #733d00', filePath);
    // filePath = 'testimage/Andahuaylas12 may. 2021 18:56:22';

    console.log('%c%s', 'color: #917399', filePath);
    console.log('%c%s', 'color: #d90000', 'https://firebasestorage.googleapis.com/v0/b/toobyfe.appspot.com/o/testimage%2FAndahuaylas12%20may.%202021%2018%3A56%3A22?alt=media&token=761d249a-b2d8-4fb4-b983-17ddc3d1c37a');

    const ref = this.fireStorage.ref(filePath);

    const task = ref.delete().subscribe(() => console.log('imagen elimnado'));
    // finalize(() => {

    // });

    // gs://toobyfe.appspot.com/'testimage/Andahuaylas17 may. 2021 19:47:50'


    console.log('%c%s', 'color: #00bf00', 'tarea terminada');



  }

  async elimnarImagenV3(){
    console.log('%c%s', 'color: #731d1d', 'inicio');

    const loaderr: any = await this.globalservice.presentLoading('Elimando imagen...');
    const respuesta = await this.globalservice.ElimarImagen(this.imagenUrl);
    console.log('%c%s', 'color: #f200e2', respuesta);
    console.log('%c%s', 'color: #f200e2', 'finnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');
    loaderr.dismiss();
  }

  async deleteFireBaseStorageItemm(){

    console.log('%c%s', 'color: #731d1d', 'inicio');
    const respuesta = await this.globalservice.ElimarImagen(this.imagenUrl);
    console.log('%c%s', 'color: #f200e2', respuesta);
    console.log('%c%s', 'color: #f200e2', 'finnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');

    return;

    const fileUrl = this.imagenUrl;
    // let filePath = fileUrl.replace('https://firebasestorage.googleapis.com/v0/b/toobyfe.appspot.com/o/', '');

    let filePath = fileUrl.split('/o/')[1];
    console.log('%c%s', 'color: #1d5673', filePath);

    filePath = decodeURIComponent(filePath);


    const regex = new RegExp(/(\?alt).*/, 'ig'); // constructor with string pattern as first argument
    filePath = filePath.replace(regex, '');
    console.log('%c%s', 'color: #1d5673', filePath);

    const ref = this.fireStorage.ref(filePath);

    const task = ref.delete().subscribe(() => console.log('imagen elimnado'));

  }

  DecodificarNombreDeImagenUrl(fileUrl: string){
    // fileUrl = this.imagenUrl;
    // let filePath = fileUrl.replace('https://firebasestorage.googleapis.com/v0/b/toobyfe.appspot.com/o/', '');

    let filePath = fileUrl.split('/o/')[1]; /** partir por la cadena más especial de la url */

    if (filePath){
      filePath = decodeURIComponent(filePath);

      const regex = new RegExp(/(\?alt).*/, 'ig'); /** eliminar cadena de texto extra */
      filePath = filePath.replace(regex, '');
      console.log('%c%s', 'color: #1d5673', filePath);
      return filePath;
    }

    return '';

  }

  ElimarImagen(): Promise<string> {
    /**
     * @objetivo : Subir una imagen a Firestore.
     * @return: (String): Url de la imagen.
     */
    return new Promise( resolve => {

      const filePath = this.DecodificarNombreDeImagenUrl(this.imagenUrl);

      const ref = this.fireStorage.ref(filePath); /** crear una referencian en firestorage */
      const task = ref.delete(); // .subscribe(() => console.log('imagen elimnado'));
      // const task = ref.delete(); /** eliminarArchivo */

      /** Notifica cuando la descarga de la url esta lista */
      task.pipe(
        finalize(() => {
          console.log('looooooooooooooooooo');
          resolve('Se eliminó la imagen');
          return;
        })
        ).subscribe( (data) => console.log('imagen eliminada', data));

    });

  }


}

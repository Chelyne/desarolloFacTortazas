import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CategoriaInterface } from '../../models/CategoriaInterface';
import { StorageService } from '../../services/storage.service';
import { DataBaseService } from '../../services/data-base.service';
import { GlobalService } from 'src/app/global/global.service';
import { MEDIDAS } from 'src/config/medidasConfig';
import { ProductoInterface, VariantesInterface } from 'src/app/models/ProductoInterface';
import { DecimalOnlyValidation, DECIMAL_REGEXP_PATTERN } from 'src/app/global/validadores';



@Component({
  selector: 'app-modal-agregar-producto',
  templateUrl: './modal-agregar-producto.page.html',
  styleUrls: ['./modal-agregar-producto.page.scss'],
  providers: [DatePipe]
})
export class ModalAgregarProductoPage implements OnInit {

  /** AFI */
  decimalOnlyValidation = DecimalOnlyValidation;
  medidas = MEDIDAS;

  sede = this.storage.datosAdmi.sede;

  listaDeCategorias: CategoriaInterface[] = [{ categoria: 'accesorios' }];
  listaDeVariantes: VariantesInterface[] = [];

  // processing: boolean;
  // progress = 0;

  productoForm: FormGroup;

  loading; /** quisa no sea necesario */
  mensaje: string;

  correlacionActual: any;

  /** ambos son la misma imagen */
  imagenBin64: string | ArrayBuffer = '';
  imagenTargetFile: any = '';
  imagenUrl = '';

  constructor(
    private dataApi: DataBaseService,
    private globalservice: GlobalService,
    private modalController: ModalController,
    private datePipe: DatePipe,
    private storage: StorageService,
  ) {
    this.ObtenerCorrelacionProducto();
    this.productoForm = this.createFormAgregarProducto();
    this.ObtenerCategorias();
  }

  ngOnInit() {
  }

  createFormAgregarProducto() {
    return new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]),
      cantidad: new FormControl('1', [Validators.required, Validators.pattern(DECIMAL_REGEXP_PATTERN)]),
      medida: new FormControl('unidad', [Validators.required]),
      marca: new FormControl('', [Validators.minLength(3), Validators.maxLength(20)]),
      codigo: new FormControl('', [Validators.minLength(1), Validators.maxLength(20)]),
      codigoBarra: new FormControl('', [Validators.minLength(1), Validators.maxLength(15)]),
      precio: new FormControl('', [Validators.required]),
      cantStock: new FormControl(''),
      fechaDeVencimiento: new FormControl(),
      img: new FormControl(''),
      fechaRegistro: new FormControl(''),
      sede: new FormControl(''),
      categoria: new FormControl(),
      subCategoria: new FormControl(this.listaDeCategorias[0].categoria, [Validators.required]),
      descripcionProducto: new FormControl(),
      variantes: new FormControl()
    });
  }

  get nombre() { return this.productoForm.get('nombre'); }
  get subCategoria() { return this.productoForm.get('subCategoria'); }
  get cantidad() { return this.productoForm.get('cantidad'); }
  get medida() { return this.productoForm.get('medida'); }
  get marca() { return this.productoForm.get('marca'); }
  get codigo() { return this.productoForm.get('codigo'); }
  get codigoBarra() { return this.productoForm.get('codigoBarra'); }
  get precio() { return this.productoForm.get('precio'); }
  get cantStock() { return this.productoForm.get('cantStock'); }
  get fechaDeVencimiento() { return this.productoForm.get('fechaDeVencimiento'); }

  onResetForm() {
    this.productoForm.reset();
    // this.progress = 0;
    this.removePic(); /** resetea datos de imagen */
  }

  /** obtener lista de categorias */
  ObtenerCategorias() {
    this.dataApi.obtenerListaCategorias(this.sede).subscribe(data => {
      if (data.length) {
        this.listaDeCategorias = data;
      } else {
        this.globalservice.presentToast('Por favor agregue un categoria para agregar productos');
      }
    });
  }

  /** obtener correlacion del producto */
  ObtenerCorrelacionProducto() {
    this.dataApi.obtenerObjetoCorrelacionProducto(this.sede).subscribe((datoo: any) => {
      if (datoo.id) {
        this.correlacionActual = datoo.correlacionProducto;
        this.productoForm.setControl('codigo',
          new FormControl(datoo.correlacionProducto.toString(), [Validators.minLength(1), Validators.maxLength(20)]));
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

  // ------------------------- FIN SUBIR IMAGEN
  async configurarYsubirImagen() {
    /**
     * @objetivo : configurar imagen y subirlo a firestorage
     * @return: retorna la url de la imagen en firestorege
     */

    /** config */
    const path = 'productos';
    const name = this.sede + this.datePipe.transform(new Date(), 'medium');
    const file = this.imagenTargetFile; // imagenTargetFile

    const res = await this.globalservice.subirImagen(file, path, name).catch(() => '');

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

  formatearProducto(): ProductoInterface {

    const refProdForm = this.productoForm.value;

    const producto: ProductoInterface = {
      img: this.imagenUrl,
      nombre: refProdForm.nombre.toLowerCase(),
      cantidad: parseFloat(refProdForm.cantidad),
      precio: parseFloat(refProdForm.precio),
      sede: this.sede,
      medida: refProdForm.medida.toLowerCase(),
      cantStock: parseFloat(refProdForm.cantStock) || 0,
      categoria: 'petshop',
      subCategoria: refProdForm.subCategoria.toLowerCase(),
      descripcionProducto: refProdForm.descripcionProducto,
      marca: refProdForm.marca ? refProdForm.marca.toLowerCase() : null,
      codigo: refProdForm.codigo,
      codigoBarra: refProdForm.codigoBarra,
      fechaRegistro: new Date(),
      fechaDeVencimiento: refProdForm.fechaDeVencimiento,
      variantes: this.listaDeVariantes
    };

    return producto;
  }

  async guardarProducto() {
    if (this.productoForm.valid) {

      const loadController = await this.globalservice.presentLoading('Agrando producto...', { duracion: 10000 });

      if (this.imagenBin64) {
        console.log('NO INGRESA A SUBIR IMAGEN');
        /** subir imagen */
        this.imagenUrl = await this.configurarYsubirImagen().catch(() => '');

        if (!this.imagenUrl) {
          this.globalservice.presentToast('error al subir imagen.', { color: 'danger', position: 'top' });
          loadController.dismiss();
          return;

        }
      }

      /** formatear producto */
      const producto = this.formatearProducto();

      /** guardar producto */
      this.dataApi.guardarProductoIncrementaCodigo(producto, this.sede, this.correlacionActual)
        .then(() => {
          console.log('%c%s', 'color: #069230', 'que paso aquí', 'se guardo el producto con exito');
          this.cerrarModal();
          // this.loading.dismiss();
          this.globalservice.presentToast('Se agregó correctamente.', { color: 'success', position: 'top' });
          this.onResetForm();
          loadController.dismiss();
        })
        .catch(err => {

          console.log('%c%s', 'color: #b60d0d', 'hubo un error', err);
          if (err === 'fail') {
            this.globalservice.presentToast('No se pudo agregar el producto.', { color: 'danger', position: 'top' });
          } else {
            this.globalservice.presentToast('Se agrego el producto, pero no se incremento el codigo del producto.',
              { color: 'Warning', position: 'top' });
          }
          loadController.dismiss();
        });

    } else {
      this.mensaje = 'completa todos los campos';
    }
  }

  agregarVariante(medida, factor, precio) {

    if (!medida.value || !factor.value || !precio.value) {
      this.globalservice.presentToast('Completa todos los campos', { position: 'middle' });
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
      // console.log(item);
      this.listaDeVariantes.push(item);
    }
  }

  quitarVariante(item) {
    const i = this.listaDeVariantes.indexOf(item);
    if (i !== -1) {
      this.listaDeVariantes.splice(i, 1);
    }
  }

  cerrarModal() {
    this.modalController.dismiss();
  }

  /* -------------------------------------------------------------------------- */
  /*                            funciones auxiliares                            */
  /* -------------------------------------------------------------------------- */

  fun() {
    console.log(this.productoForm.value);
    console.log(this.productoForm.value.marcaa);
    console.log(this.marca);
    console.log(this.marca.errors);
  }

  async botonTestGuardar() {
    await this.configurarYsubirImagen();
  }
  /* -------------------------------------------------------------------------- */
  /*                             limite de funcioens                            */
  /* -------------------------------------------------------------------------- */

}


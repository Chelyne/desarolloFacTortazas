import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(
    private toastCtrl: ToastController,
    private loadingController: LoadingController,
    private fireStorage: AngularFireStorage,
    public alertController: AlertController
  ) { }

  async presentToast(
    mensaje: string,
    propiedades: {duracion?: number, position?: 'bottom'| 'top'| 'middle', color?: string, icon?: string} = {}
  ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: propiedades.duracion || 2000,
      position: propiedades.position || 'bottom',
      color: propiedades.color || 'dark',
      buttons: [
        {
          side: 'start',
          icon: propiedades.icon || 'notifications-outline',
        }]
    });
    toast.present();
  }


  subirImagen(file: any, path: string, nombre: string): Promise<string> {
    /**
     * @objetivo : Subir una imagen a Firestore.
     * @return: (String): Url de la imagen.
     */
    return new Promise( resolve => {

      const filePath = path + '/' + nombre;   /** ruta del archivo */
      const ref = this.fireStorage.ref(filePath); /** crear una referencian en firestorage */
      const task = ref.put(file); /** subir archivo a FIRESTORAGE */

      /** Notifica cuando la descarga de la url esta lista */
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe(res => {
            const downloadURL = res;
            resolve(downloadURL);
            return;
          });
        })
        ).subscribe();


    });

  }

  ElimarImagen(fileUrl: string): Promise<string> {
    /**
     * @objetivo : eliminar una imagen a Firestorege.
     * @return: nada
     */
    return new Promise( resolve => {

      const filePath = this.DecodificarNombreDeImagenUrl(fileUrl);

      const ref = this.fireStorage.ref(filePath); /** crear una referencian en firestorage */
      const task = ref.delete(); /** eliminarArchivo */

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

  async presentLoading(mensaje: string, propiedades: {duracion?: number } = {}) {
    const loading = await this.loadingController.create({
      cssClass: 'my-custom-class',
      message: mensaje,
      duration: propiedades.duracion || 10000
    });

    await loading.present();
    return loading;
  }

  async crearAlertController(showMessage: string, actionName: string, funcExecuter: any){

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmar',
      message: showMessage,
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: actionName,
          handler: () => {
            funcExecuter();
          }
        }
      ]
    });

    await alert.present();
  }




}

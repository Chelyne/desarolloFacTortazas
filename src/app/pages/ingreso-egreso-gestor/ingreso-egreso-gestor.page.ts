import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IngresoEgresoPage } from 'src/app/modals/ingreso-egreso/ingreso-egreso.page';

@Component({
  selector: 'app-ingreso-egreso-gestor',
  templateUrl: './ingreso-egreso-gestor.page.html',
  styleUrls: ['./ingreso-egreso-gestor.page.scss'],
})
export class IngresoEgresoGestorPage implements OnInit {

  saldo : number = 0;

  modalEvento: string;
  modalTag: string;
  modalButtonTag:string;
  modalSaldo: number;


  constructor( private modalCtlr: ModalController) {
    //this.usuarioForm = this.createFormGroupUsuario();
    //this.ObtenerUsuarios();
  }

  ngOnInit() {
  }

  //TODO -Cambiar nombre
  exec(accion : string){
    console.log(accion);
    if (accion == 'Ingreso') {
      this.modalEvento = 'Ingreso';
      this.modalTag = 'Monto a Ingresar';
      this.modalButtonTag = 'Ingresar monto';
      this.modalSaldo = this.saldo;

    } else if (accion == 'Egreso') {
      this.modalEvento = 'Egreso';
      this.modalTag = 'Monto a Retirar';
      this.modalButtonTag = 'Retirar monto';
      this.modalSaldo = this.saldo;

    } else{
      console.log('La funcion no es valida');
    }

    this.abrirModal();

  }

  async abrirModal(){

    const modal =  await this.modalCtlr.create({
      component: IngresoEgresoPage,
      componentProps: {
        eventoInvoker: this.modalEvento,
        buttonTagInvoer: this.modalButtonTag,
        tagInvoker: this.modalTag,
        saldoInvoker: this.modalSaldo
      }
    });

    await modal.present()

    const {data} = await modal.onDidDismiss();
    if(data){
      console.log(data);
      this.saldo = data.newMonto;
    }

  }

}

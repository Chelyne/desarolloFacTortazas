import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IngresoEgresoModalPage } from '../../modals/ingreso-egreso-modal/ingreso-egreso-modal.page';

@Component({
  selector: 'app-ingreso-egreso',
  templateUrl: './ingreso-egreso.page.html',
  styleUrls: ['./ingreso-egreso.page.scss'],
})
export class IngresoEgresoPage implements OnInit {

  private saldo : number = 0;

  eventToSendModel: string;
  tagToSendModel: string;
  saldoToSendModel: number;


  constructor( private modalCtlr: ModalController) {
    //this.usuarioForm = this.createFormGroupUsuario();
    //this.ObtenerUsuarios();
  }
  ngOnInit() {
  }

  exec(accion : string){
    console.log(accion);
    if (accion == 'Ingreso') {
      this.eventToSendModel = 'Ingreso';
      this.tagToSendModel = 'Ingresar monto';
      this.saldoToSendModel = this.saldo;

    } else if (accion == 'Egreso') {
      this.eventToSendModel = 'Egreso';
      this.tagToSendModel = 'Retirar monto';
      this.saldoToSendModel = this.saldo;

    } else{
      console.log('La funcion no es valida');
    }

    this.abrirModal();

  }

  async abrirModal(){

    const modal =  await this.modalCtlr.create({
      component: IngresoEgresoModalPage,
      componentProps: {
        eventoInvoker: this.eventToSendModel,
        tagInvoker: this.tagToSendModel,
        saldoInvoker: this.saldoToSendModel
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

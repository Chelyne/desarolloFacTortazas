import { Component, Input, OnInit } from '@angular/core';
import { CompraInterface } from 'src/app/models/Compra';

@Component({
  selector: 'app-detalles-de-compra',
  templateUrl: './detalles-de-compra.page.html',
  styleUrls: ['./detalles-de-compra.page.scss'],
})
export class DetallesDeCompraPage implements OnInit {

  @Input() compra: CompraInterface;


  constructor() { }

  ngOnInit() {
    console.log('aaaaaaaa', this.compra);
  }

}

import { Injectable } from '@angular/core';
import { SaleDetailInterface } from 'src/app/models/comprobante/comprobante';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { VentaInterface } from 'src/app/models/venta/venta';
import * as moment from 'moment';
import { formatDate } from '@angular/common';

import { redondeoDecimal } from 'src/app/global/funciones-globales';
import { MontoALetras } from 'src/app/global/monto-a-letra';

@Injectable({
  providedIn: 'root'
})
export class TestApiService {

  userApiPeru = 'friendscode';
  passwardApiPeru = 'friends2019peru';

  constructor() { }

  saludo(){
    return 'hola';
  }

  setApiPeruDataUser(user: string, password: string){
    this.userApiPeru = user;
    this.passwardApiPeru = password;
    // console.log('DATA USUARIOOOOOOOOOOOO: ', this.userApiPeru, this.passwardApiPeru);
  }

  login(){
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      username: this.userApiPeru,
      password: this.passwardApiPeru
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/auth/login', requestOptions)
      .then(response => response.json())
      // .then(result => result.token)
      .catch(error => console.log('error', error));
  }

  obtenerUserApiperuToken(){
    return this.login().then(result => result.token);
      // .catch(error => console.log('error', error));
  }

  async listarEmprasas(){

    const myHeaders = new Headers();
    const userToken = await this.obtenerUserApiperuToken();
    // console.log('Bearerrrrrrrrrrrrrrrrrrrrr ', 'Bearer '.concat(userToken));
    myHeaders.append('Authorization', 'Bearer '.concat(userToken));

    // const raw = JSON.stringify({});

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      // body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/companies', requestOptions)
      .then(response => response.json())
      // .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }

  async obtenerEmpresaByRUC(rucEnter: string){
    const listaDeEmpresas = await this.listarEmprasas();
    console.log(rucEnter);
    for (const empresa of listaDeEmpresas) {
      // console.log('sssssssssssssssssssssss', empresa);
      // console.log(empresa.ruc);
      if (empresa.ruc === rucEnter){
        // console.log('ruccccccccccccccccccccccccccccc', rucEnter, empresa);
        return empresa;
      }
    }
    console.log('ruc failllllllllllllllllllllllllllllll');
    return {};
  }

/* ---------------------------------------------------------------------------------------------- */
/*                                     ENVIAR COMPROBANTE A SUNAT                                 */
/* ---------------------------------------------------------------------------------------------- */

enviarASunatAdaptador(venta: VentaInterface){

}

reconstruirVenta(venta: VentaInterface){
  // NOTE: recuperar datos de firestore
  // NOTE: Añadir a venta,
  // NOTE: formatear
  // NOTE: Enviar a sunat
  // NOTE: Guardar CDR
}


obtenerCodigoComprobante(typoComprobante: string){

  if (typoComprobante.toLowerCase() === 'factura'){
    return '01';
  } else if (typoComprobante.toLowerCase() === 'boleta'){
    return '03';
  } else {
    console.log('Comprobante no valido');
    return 'TYPO COMPROBANTE INVALID';
  }
}

formtearFecha(dateTime: any): string{

  const fechaFormateada = new Date(moment.unix(dateTime.seconds).format('D MMM YYYY H:mm'));
  const fechaString = formatDate(fechaFormateada, 'yyyy-dd-MMThh:mm:ss-05:00', 'en');
  // console.log('aaaaaaaaaaaaa', fechaString);
  return fechaString;
}

formatearVenta(venta: VentaInterface){
  console.log('Venta a ser Formateada', venta);
  console.log('Fecha de emision de la venta', venta.fechaEmision);
  const productFormat = this.formatearDetalles(venta.listaItemsDeVenta);

  const totalaPagar = venta.totalPagarVenta;
  const montoBase = totalaPagar / 1.18;
  const igv = totalaPagar - montoBase;
  const montoOperGravadas = montoBase;

  return {
    tipoOperacion: '0101', // Venta interna
    tipoDoc: this.obtenerCodigoComprobante(venta.tipoComprobante),  // Factura:01, Boleta:03 //
    serie: venta.serieComprobante,
    correlativo: venta.numeroComprobante, // venta.numeroComprobante,
    fechaEmision: '', // this.formtearFecha(venta.fechaEmision), // TODO, formaterar fecha a Data-time
    tipoMoneda: 'PEN',
    client: {}, // this.formatearCliente(venta.cliente),
    company: {}, // this.formatearEmpresa(this.datosDeEmpresa), // ANCHOR
    mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
    mtoIGV: redondeoDecimal(igv, 2),
    totalImpuestos: redondeoDecimal(igv, 2),
    valorVenta: redondeoDecimal(montoOperGravadas, 2),
    mtoImpVenta: redondeoDecimal(totalaPagar, 2),
    ublVersion: '2.1',
    details: productFormat,
    legends: [
      {
        code: '1000',
        value: MontoALetras(totalaPagar)
      }
    ]
  };

}

formatearDetalles(itemsDeVenta): SaleDetailInterface[]{
  const listaFormateda: SaleDetailInterface[] = [];

  for (const itemDeVenta of itemsDeVenta) {
    listaFormateda.push(this.formatearDetalleVenta(itemDeVenta));
  }
  console.log(listaFormateda);
  return listaFormateda;
}

formatearDetalleVenta(itemDeVenta: ItemDeVentaInterface): SaleDetailInterface{
  // TODO - Verificar que como se hace un descuento
  const cantidadItems = itemDeVenta.cantidad;
  const precioUnit = itemDeVenta.producto.precio;
  const precioUnitarioBase = precioUnit / 1.18;
  const igvUnitario = precioUnit - precioUnitarioBase;

  const montoBase = cantidadItems * precioUnitarioBase;
  const igvTotal = cantidadItems * igvUnitario;

  return {
      // codProducto: 'P001', // TODO, PROBAR A ENVIAR SIN ESTE
      unidad: this.ObtenerCodigoMedida(itemDeVenta.producto.medida),
      descripcion: itemDeVenta.producto.nombre,
      cantidad: itemDeVenta.cantidad,
      mtoValorUnitario: redondeoDecimal(precioUnitarioBase, 2),
      mtoValorVenta: redondeoDecimal(montoBase, 2),
      mtoBaseIgv: redondeoDecimal(montoBase, 2),
      porcentajeIgv: 18,
      igv: redondeoDecimal(igvTotal, 2),
      tipAfeIgv: '10', // OperacionOnerosa: 10
      totalImpuestos: redondeoDecimal(igvTotal, 2), // suma de todos los impues que hubiesen
      mtoPrecioUnitario: redondeoDecimal(precioUnit, 2)
    };
}


/* ---------------------------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*                           enviar nota de credito                           */
/* -------------------------------------------------------------------------- */

formatearNotaDeCredito(venta: VentaInterface){
  console.log('Venta a ser Formateada', venta);
  console.log('Fecha de emision de la venta', venta.fechaEmision);
  const productFormat = this.formatearDetalles(venta.listaItemsDeVenta);

  const totalaPagar = venta.totalPagarVenta;
  const montoBase = totalaPagar / 1.18;
  const igv = totalaPagar - montoBase;
  const montoOperGravadas = montoBase;

  return {
    tipDocAfectado: this.obtenerCodigoComprobante(venta.tipoComprobante), // '01',   // Factura
    numDocfectado: `${venta.serieComprobante}-${venta.numeroComprobante}`, // 'F001-111', // numero y serie
    codMotivo: '07',    //  Códigos de Tipo de Nota de Crédito Electrónica - 07:Devolucion por item
    desMotivo: 'DEVOLUCION POR ITEM',
    tipoDoc: '07', // nota de crédito
    serie: 'FF01', // la nota de credito tiene una serie
    fechaEmision: '2019-10-27T00:00:00-05:00', // Fecha de emision // NOTE - se debe gener aquí.
    correlativo: '123', // correlacion  // NOTE - Tambien debe obtenerse aquí
    tipoMoneda: 'PEN',
    client: {}, // this.formatearCliente(venta.cliente),
    company: {}, // this.formatearEmpresa(this.datosDeEmpresa), // ANCHOR
    mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
    mtoIGV: redondeoDecimal(igv, 2),
    totalImpuestos: redondeoDecimal(igv, 2),
    valorVenta: redondeoDecimal(montoOperGravadas, 2),
    mtoImpVenta: redondeoDecimal(totalaPagar, 2),
    ublVersion: '2.1',
    details: productFormat,
    legends: [
      {
        code: '1000',
        value: MontoALetras(totalaPagar)
      }
    ]
  };

}




/* -------------------------------------------------------------------------- */


  ObtenerCodigoMedida(medida: string){
    switch (medida.toLowerCase()) {
        case 'botellas': return 'BG';
        case 'caja': return 'BO';
        case 'docena': return 'BX';
        case 'gramo': return 'DZN';
        case 'juego': return 'GRM';
        case 'kilogramo': return 'SET';
        case 'kit': return 'KGM';
        case 'libras': return 'KT';
        case 'litro': return 'LBR';
        case 'metro': return 'LTR';
        case 'miligramos': return 'MTR';
        case 'mililitro': return 'MGM';
        case 'milimetro': return 'MLT';
        case 'onzas': return 'MMT';
        case 'pies': return 'ONZ';
        case 'piezas': return 'FOT';
        case 'pulgadas': return 'C62';
        case 'unidad (bienes)': return 'INH';
        case 'ciento de unidades': return 'NIU';
        case 'bolsa': return 'CEN';
        case 'balde': return 'BJ';
        case 'barriles': return 'BLL';
        case 'cartones': return 'CT';
        case 'centimetro cuadrado': return 'CMK';
        case 'latas': return 'CA';
        case 'metro cuadrado': return 'MTK';
        case 'milimetro cuadrado': return 'MMK';
        case 'paquete': return 'PK';
        case 'par': return 'PR';
        case 'unidad servicios': return 'ZZ';
        case 'cilindro': return 'CY';
        case 'galon ingles': return 'GLI';
        case 'pies cuadrados': return 'FTK';
        case 'us galon': return 'GLL';
        case 'bobinas': return '4A';
        case 'centimetro cubico': return 'CMQ';
        case 'centimetro lineal': return 'CMT';
        case 'conos': return 'CJ';
        case 'docena por 10**6': return 'DZP';
        case 'fardo': return 'BE';
        case 'gruesa': return 'GRO';
        case 'hectolitro': return 'HLT';
        case 'hoja': return 'LEF';
        case 'kilometro': return 'KTM';
        case 'kilovatio hora': return 'KWH';
        case 'megawatt hora': return 'MWH';
        case 'metro cubico': return 'MTQ';
        case 'milimetro cubico': return 'MMQ';
        case 'millares': return 'MLL';
        case 'millon de unidades': return 'UM';
        case 'paletas': return 'PF';
        case 'pies cubicos': return 'FTQ';
        case 'placas': return 'PG';
        case 'pliego': return 'ST';
        case 'resma': return 'RM';
        case 'tambor': return 'DR';
        case 'tonelada corta': return 'STN';
        case 'tonelada larga': return 'LTN';
        case 'toneladas': return 'TNE';
        case 'tubos': return 'TU';
        case 'yarda': return 'YRD';
        case 'yarda cuadrada': return 'YDK';
        default: return 'NIU';
        // default: return 'MEDIDA NO REGISTRADA';
    }
  }

}

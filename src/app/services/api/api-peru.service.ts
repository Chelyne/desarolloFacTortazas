import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { EmpresaInterface } from 'src/app/models/api-peru/empresa';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { ClientInterface, CompanyInterface, SaleDetailInterface } from 'src/app/models/comprobante/comprobante';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { VentaInterface } from 'src/app/models/venta/venta';
import { isNullOrUndefined } from 'util';
import { DbDataService } from '../db-data.service';
import { StorageService } from '../storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiPeruService {

  token: string;
  datosDeEmpresa: EmpresaInterface;
  sede = this.storage.datosAdmi.sede;


  constructor(
    private dataApi: DbDataService,
    private storage: StorageService
  ) {
    this.obtenerDatosDeLaEmpresa();
  }

  // verificarVenta(venta: VentaInterface){

  // }

  login(){
    // NOTE - return a userToken
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      "username": "friendscode",
      "password": "friends2019peru"
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/auth/login', requestOptions)
      .then(response => response.json())
      .then(result => result.token)
      .catch(error => console.log('error', error));
  }

  async listarEmprasas(){

    const myHeaders = new Headers();
    const userToken = await this.login();
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
    // console.log('lista de empresas', listaDeEmpresas);

    for (const empresa of listaDeEmpresas) {
      // console.log('sssssssssssssssssssssss', empresa);
      // console.log(empresa.ruc);
      if (empresa.ruc === rucEnter){
        // console.log('ruccccccccccccccccccccccccccccc', rucEnter, empresa);
        return empresa;
      }
    }
    // console.log('ruc failllllllllllllllllllllllllllllll');
    return '';
  }

  async obtenerTokenDeEmpresa(rucEnter: string){
    const empresa = await this.obtenerEmpresaByRUC(rucEnter);
    // console.log(empresa.token.code);
    return empresa.token.code;
  }

  async guardarDatosEmpresaFirebase(rucEnter: string){
    const empresa = await this.obtenerEmpresaByRUC(rucEnter);
    this.dataApi.guardarDatosEmpresa(empresa);
  }

  // REFACTOR: renombrar a un nombre más descriptivo
  obtenerDatosDeLaEmpresa(){
    // TODO: Debe intentar obtener los datos de la empresa de fisebase
    // Si no hubieran datos entonces obtenerlos de apiPeru y guardarlo en firebase

    // La solución actual supone que siempre existirá los datos de la empresa en firebase
    this.dataApi.obtenerEmpresa().subscribe(data => {
      // console.log('esto debería imprimirse primero');
      this.datosDeEmpresa = data[0];
      // console.log(this.datosDeEmpresa);
    });
  }

  // REFACTOR: renombrar a un nombre más descriptivo
  getDatosEmpresa(){
    return this.datosDeEmpresa;
  }

  // NOTE - Esta es la función más importante que se encarga de enviar una factura a sunat
  // ANCHOR
  enviarComprobanteASunat(venta: VentaInterface){
    const myHeaders = new Headers();
    // TODO: en caso de que no exita el token ver si emprea tiene el token
    myHeaders.append('Authorization', 'Bearer '.concat(this.datosDeEmpresa.token.code));
    myHeaders.append('Content-Type', 'application/json');

    // TODO: Poner el tipo de dato a raw
    let raw: string;

    this.formatearVenta(venta).then(comprobante => {
      console.log('Objeto venta formateadaaaaaaaaaaa: ', comprobante);
      raw = JSON.stringify(comprobante);

      // console.log('imprimiendo el rawwwwwwwww', data);
      // console.log('_____________________________________________________________________________');
      // console.log(typeof raw);

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
        .then(response => response.json())
        .then(cdr => {

          console.log('Sunat Respuesta: ', cdr);
          // ?NOTE: Guardar resultado en la base de datos
          this.dataApi.guardarCDR(venta, this.sede, cdr);
        } )
        .catch(error => console.log('errorrrrrrrrrrrrrrrrrrrrrrrrr', error));
    });
  }

  enviarComprobanteToSunat(data: any){
    const myHeaders = new Headers();
    // myHeaders.append('Authorization', 'Bearer '.concat(this.datosDeEmpresa.token.code));
    // myHeaders.append('Content-Type', 'application/json');

    // myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDk2MTUzMDAsInVzZXJuYW1lIjoiZnJpZW5kc2NvZGUiLCJjb21wYW55IjoiMjA2MDE4MzEwMzIiLCJleHAiOjQ3NjMyMTUzMDB9.JIikuy-l6I74EB5-DNMlFjdqtIhIwR4CDDc10LLuiUuwt3AdxSbpQlgZbIHsGA7cMFAGkhP0trdZVFp40Z35Ayr9fL-JA4NX6Scd6VdnlIBkf2FT32irpGwkY71bEUnjDxGARWGtFnZwhK3MMLWAdjemGrTP25AqtGK8IjkiFZSKQ90toFxpd1Ije6zigRxrkFl0vS6WsFWwHXG-vmCyBqw_i_qE8MVT1zVemas1RZxaDH3UIhCB7mXxZqEUO8QqcmUB8L9OY6tCFOYm_whDjOdkz4GrxdfWMoAQHwDhEhI85k4fwrdynbGyonH1Invcv5xejz0u99geEJmTns9TdqV0dDjhvE4Prqtb53PwRSpJ6Bpo9lIq_YFoMcJk9duXqS2iVNgFDEc3oa35OeM75x0xfrv5i7uIr_JajjQ1-LLz36hJpc1lt9dwAEPrtGoEoSwImGByBZA7yU19cw_3r429-bHMAjnvdF9tPBPJCfVFfW0SYsLfR_UVXoZNzWk1gYDLUvvQw5PtLh6GVGtphy4sSTElZ1-fZ1Q2lmf8Jh8XSdeE4qDfXhW9YHIBUwn99K_9H80Hd8mi2rqJzig4ftudNZtAU0YqLHq6WohTXWNwf9Fob7b66vlwXHawQ6HGoN046kAebuWKBQeYwJFYzfQJOznEtkw5aiJ2wo9hcaU");
    const tokenOne = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDk2MTUzMDAsInVzZXJuYW1lIjoiZnJpZW5kc2NvZGUiLCJjb21wYW55IjoiMjA2MDE4MzEwMzIiLCJleHAiOjQ3NjMyMTUzMDB9.JIikuy-l6I74EB5-DNMlFjdqtIhIwR4CDDc10LLuiUuwt3AdxSbpQlgZbIHsGA7cMFAGkhP0trdZVFp40Z35Ayr9fL-JA4NX6Scd6VdnlIBkf2FT32irpGwkY71bEUnjDxGARWGtFnZwhK3MMLWAdjemGrTP25AqtGK8IjkiFZSKQ90toFxpd1Ije6zigRxrkFl0vS6WsFWwHXG-vmCyBqw_i_qE8MVT1zVemas1RZxaDH3UIhCB7mXxZqEUO8QqcmUB8L9OY6tCFOYm_whDjOdkz4GrxdfWMoAQHwDhEhI85k4fwrdynbGyonH1Invcv5xejz0u99geEJmTns9TdqV0dDjhvE4Prqtb53PwRSpJ6Bpo9lIq_YFoMcJk9duXqS2iVNgFDEc3oa35OeM75x0xfrv5i7uIr_JajjQ1-LLz36hJpc1lt9dwAEPrtGoEoSwImGByBZA7yU19cw_3r429-bHMAjnvdF9tPBPJCfVFfW0SYsLfR_UVXoZNzWk1gYDLUvvQw5PtLh6GVGtphy4sSTElZ1-fZ1Q2lmf8Jh8XSdeE4qDfXhW9YHIBUwn99K_9H80Hd8mi2rqJzig4ftudNZtAU0YqLHq6WohTXWNwf9Fob7b66vlwXHawQ6HGoN046kAebuWKBQeYwJFYzfQJOznEtkw5aiJ2wo9hcaU';
    let tokenDos = this.datosDeEmpresa.token.code;

    if(tokenDos === tokenOne){
      console.log('Los tokens son iguales');
      console.log(tokenDos);
      console.log(tokenOne);

    }else{
      console.log('LosNOOOOOOOOOOOOOOOOO tokens son iguales');
      console.log(tokenDos);
      console.log(tokenOne);
    }


    myHeaders.append("Authorization", `Bearer ${this.datosDeEmpresa.token.code}`)
    //myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDk2MTUzMDAsInVzZXJuYW1lIjoiZnJpZW5kc2NvZGUiLCJjb21wYW55IjoiMjA2MDE4MzEwMzIiLCJleHAiOjQ3NjMyMTUzMDB9.JIikuy-l6I74EB5-DNMlFjdqtIhIwR4CDDc10LLuiUuwt3AdxSbpQlgZbIHsGA7cMFAGkhP0trdZVFp40Z35Ayr9fL-JA4NX6Scd6VdnlIBkf2FT32irpGwkY71bEUnjDxGARWGtFnZwhK3MMLWAdjemGrTP25AqtGK8IjkiFZSKQ90toFxpd1Ije6zigRxrkFl0vS6WsFWwHXG-vmCyBqw_i_qE8MVT1zVemas1RZxaDH3UIhCB7mXxZqEUO8QqcmUB8L9OY6tCFOYm_whDjOdkz4GrxdfWMoAQHwDhEhI85k4fwrdynbGyonH1Invcv5xejz0u99geEJmTns9TdqV0dDjhvE4Prqtb53PwRSpJ6Bpo9lIq_YFoMcJk9duXqS2iVNgFDEc3oa35OeM75x0xfrv5i7uIr_JajjQ1-LLz36hJpc1lt9dwAEPrtGoEoSwImGByBZA7yU19cw_3r429-bHMAjnvdF9tPBPJCfVFfW0SYsLfR_UVXoZNzWk1gYDLUvvQw5PtLh6GVGtphy4sSTElZ1-fZ1Q2lmf8Jh8XSdeE4qDfXhW9YHIBUwn99K_9H80Hd8mi2rqJzig4ftudNZtAU0YqLHq6WohTXWNwf9Fob7b66vlwXHawQ6HGoN046kAebuWKBQeYwJFYzfQJOznEtkw5aiJ2wo9hcaU");

    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify(data);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    // fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
    //     .then(response => response.text())
    //     .then(cdr => {

    //       console.log('crd', cdr);
    //       // TODO: Guardar resultado en la base de datos
    //       // console.log('Aqui debería guardaaaaaaaaaaaaaaaaa');
    //       // this.dataApi.guardarCDR(venta, this.sede, cdr);
    //     } )
    //     .catch(error => console.log('errorrrrrrrrrrrrrrrrrrrrrrrrr', error));
    fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));

  }

  formatearVenta(venta: VentaInterface){
    // const productFormat: SaleDetailInterface[] = this.formatearDetalles(venta);
    console.log('Venta a ser Formateada', venta);
    console.log('Fecha de emision de la venta', venta.fechaEmision);
    let productFormat;

    const totalaPagar = venta.totalPagarVenta;
    const igv = totalaPagar * 18 / 100;
    const montoOperGravadas = totalaPagar - igv;

    const promesa = new Promise((resolve, reject) => {
      this.obtenerDetallesDeProductos(venta.idListaProductos)
      .then(itemsVenta => {
        console.log('lista de productos Formateados 3: ', itemsVenta);

        productFormat = itemsVenta; // TODO: Probar como funciona directo
        const r = {
          tipoOperacion: '0101', // Venta interna
          tipoDoc: this.obtenerCodigoComprobante(venta.tipoComprobante),  // Factura:01, Boleta:03 //
          serie: venta.serieComprobante,
          correlativo: venta.numeroComprobante, // venta.numeroComprobante,
          fechaEmision: this.formtearFecha(venta.fechaEmision), // TODO, formaterar fecha a Data-time
          tipoMoneda: 'PEN',
          client: this.formatearCliente(venta.cliente),
          company: this.formatearEmpresa(this.datosDeEmpresa), // ANCHOR
          mtoOperGravadas: montoOperGravadas,
          mtoIGV: igv,
          totalImpuestos: igv,
          valorVenta: montoOperGravadas,
          mtoImpVenta: totalaPagar,
          ublVersion: '2.1',
          details: productFormat,
          legends: [
            {
              code: '1000',
              value: 'SON CIENTO DIECIOCHO CON 00/100 SOLES'
            }
          ]
        };
        resolve(r);
      });
    });
    return promesa;

  }

  // tslint:disable-next-line: member-ordering
  listaDeProductosDeVenta: ItemDeVentaInterface[] = [];

  obtenerDetallesDeProductos(idLista: string) {
    let productFormat: SaleDetailInterface[];
    const listaFormateda: SaleDetailInterface[] = [];

    const promesa = new Promise((resolve, reject) => {
      this.dataApi.obtenerProductosDeVenta(idLista, this.sede)
      .subscribe( (data: any) => {
        console.log('Lista de productos de la venta obtenidos de firebase:', data);
        // tslint:disable-next-line: deprecation
        if (!isNullOrUndefined(data)){
          this.listaDeProductosDeVenta = data.productos;
          for (const itemDeVenta of this.listaDeProductosDeVenta) {
            listaFormateda.push(this.formatearDetalleVenta(itemDeVenta));
          }
          productFormat = listaFormateda;
          console.log('lista de productos Formateados', productFormat);

          console.log('lista de productos Formateados 2: ', data.productos);
        }
        resolve(productFormat);
      });
    });
    return promesa;
  }

  formatearDetalleVenta(itemDeVenta: ItemDeVentaInterface): SaleDetailInterface{
    const cantidadItems = itemDeVenta.cantidad;
    const precioUnit = itemDeVenta.producto.precio;
    const igvUnitario = precioUnit * 18 / 100;
    const precioUnitSinIgv = precioUnit - igvUnitario;
    const montoBase = cantidadItems * precioUnitSinIgv;
    const igvTotal = cantidadItems * igvUnitario;

    return {
        // codProducto: 'P001', // TODO, PROBAR A ENVIAR SIN ESTE
        unidad: this.ObtenerCodigoMedida(itemDeVenta.producto.medida), // TODO: crear obtener codigo de medida
        descripcion: itemDeVenta.producto.nombre,
        cantidad: itemDeVenta.cantidad,
        mtoValorUnitario: precioUnitSinIgv,
        mtoValorVenta: montoBase,
        mtoBaseIgv: montoBase,
        porcentajeIgv: 18,
        igv: igvTotal,
        tipAfeIgv: '10', // OperacionOnerosa: 10
        totalImpuestos: igvTotal, // suma de todos los impues que hubiesen
        mtoPrecioUnitario: precioUnit
      };
  }

  formatearDetalles(venta: VentaInterface): SaleDetailInterface[]{
    const listaFormateda: SaleDetailInterface[] = [];
    this.obtenerItemsDeVenta(venta.idVenta, this.sede);
    for (const itemDeVenta of this.listaDeProductosDeVenta) {
      listaFormateda.push(this.formatearDetalleVenta(itemDeVenta));
    }
    console.log(listaFormateda);
    return listaFormateda;
  }

  formtearFecha(dateTime: any): string{

    const fechaFormateada = new Date(moment.unix(dateTime.seconds).format('D MMM YYYY H:mm'));
    const fechaString = formatDate(fechaFormateada, 'yyyy-dd-MMThh:mm:ss-05:00', 'en');
    // console.log('aaaaaaaaaaaaa', fechaString);
    return fechaString;
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

  formatearCliente(cliente: ClienteInterface): ClientInterface{
    // como todos los documentos son DNI, segun
    // TODO - mejorar el cliente interface
    // TODO - agregar una funcion para obtener el codigo de tipo de documento segun sunat
    // TODO - Adaptar al nueva ClienteInterface
    return {
      tipoDoc: this.ObtenerCodigoTipoDoc(cliente.tipoDoc), // el catalogo N6, DNI = 1, Tambien obtener el ruc
      numDoc: cliente.numDoc,
      rznSocial: cliente.nombre,
      address: {
        direccion: cliente.direccion
      },
      email: cliente.email,
      telephone: cliente.celular
    };
  }

  ObtenerCodigoTipoDoc(typoDoc: string){
    if (typoDoc === 'ruc'){
      return '1';
    } else if (typoDoc === 'dni') {
      return '6';
    } else{
      return 'TYPO DE DOCUMENTO INVALIDO';
    }
  }

  formatearEmpresa(empresa: EmpresaInterface): CompanyInterface{
    return {
      ruc: empresa.ruc,
      razonSocial: empresa.razon_social,
      address: {
        direccion : empresa.direccion
      }
    };
  }




  obtenerItemsDeVenta(ventaId: string, sede: string){
    this.dataApi.obtenerProductosDeVenta(ventaId, sede).subscribe( (data: any) => {
      // tslint:disable-next-line: deprecation
      if (!isNullOrUndefined(data)){
        this.listaDeProductosDeVenta = data.productos;
        console.log('datosd', data.productos);
      }
    });
  }



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

import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { EmpresaInterface } from 'src/app/models/api-peru/empresa';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { AddressInterface, ChangeInterface, ClientInterface, CompanyInterface } from 'src/app/models/comprobante/comprobante';
import { ComprobanteInterface, NotaDeCreditoInterface, SaleDetailInterface } from 'src/app/models/comprobante/comprobante';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { VentaInterface } from 'src/app/models/venta/venta';
import { isNullOrUndefined } from 'util';
import { DbDataService } from '../db-data.service';
import { StorageService } from '../storage.service';

import { redondeoDecimal } from 'src/app/global/funciones-globales';
import { MontoALetras } from 'src/app/global/monto-a-letra';



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

/* ------------------------------------------------------------------------------------------------ */
/*                                    configuración apisperu setting                                */
/* ------------------------------------------------------------------------------------------------ */

  login(){
    // NOTE - return a userToken
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      username: 'friendscode',
      password: 'friends2019peru'
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
/* ------------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------------ */


/* ---------------------------------------------------------------------------------------------- */
/*                                     ENVIAR COMPROBANTE A SUNAT                                 */
/* ---------------------------------------------------------------------------------------------- */

  enviarASunatAdaptador(venta: VentaInterface){

    const promesa = new Promise((resolve, reject) => {
      if (venta.cdr && typeof(venta.cdr.sunatResponse.success) !== 'undefined' && venta.cdr.sunatResponse.success === true ){
        reject(null);
      } else {
        this.dataApi.obtenerProductosDeVenta(venta.idListaProductos, this.sede).subscribe( (data: any) => {
          console.log('Lista de productos de la venta obtenidos de firebase:', data);
          // tslint:disable-next-line: deprecation
          if (!isNullOrUndefined(data)){
            venta.listaItemsDeVenta = data.productos;
          }
          const ventaFormateada: ComprobanteInterface = this.formatearVenta(venta);
          console.log(ventaFormateada);
          this.enviarComprobanteASunat(ventaFormateada).then(cdr => {
            console.log('drin crd', cdr);
            this.dataApi.guardarCDRr(venta.idVenta, venta.fechaEmision, this.sede, cdr).then(() => {
              resolve(cdr);
            });
          }).catch(error => console.log('No se envio comprobante a la SUNAT', error));
        });
      }
    });
    return promesa;
  }


  // NOTE - Esta es la función más importante que se encarga de enviar una factura a sunat
  enviarComprobanteASunat(ventaFormateada: ComprobanteInterface){
    const myHeaders = new Headers();
    // TODO: en caso de que no exita el token ver si emprea tiene el token
    myHeaders.append('Authorization', 'Bearer '.concat(this.datosDeEmpresa.token.code));
    myHeaders.append('Content-Type', 'application/json');

    // TODO: Poner el tipo de dato a raw
    let raw: string;

    raw = JSON.stringify(ventaFormateada);

    // console.log('imprimiendo el rawwwwwwwww', data);
    // console.log('_____________________________________________________________________________');
    // console.log(typeof raw);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
      .then(response => response.json())
      .then(cdr => {

        // console.log('Sunat Respuesta: ', cdr);
        return cdr;
        // ?NOTE: Guardar resultado en la base de datos
        // this.dataApi.guardarCDR(venta, this.sede, cdr);
        // this.dataApi.guardarCDRr(idVenta, fechaEmision, sede, cdrVenta);
      } )
      .catch(error => console.log('errorrrrrrrrrrrrrrrrrrrrrrrrr', error));
  }

  formatearVenta(venta: VentaInterface): ComprobanteInterface{
    console.log('Venta a ser Formateada', venta);
    console.log('Fecha de emision de la venta', venta.fechaEmision);
    const productFormat = this.formatearDetalles(venta.listaItemsDeVenta);

    let icbr: number;
    if (venta.hasOwnProperty('cantidadBolsa')){
      icbr = venta.cantidadBolsa * 0.3;
    }else{
      icbr = 0;
    }

    const totalaPagar = venta.totalPagarVenta - icbr;
    // const totalaPagar = venta.montoNeto - icbr;
    const MontoBase = totalaPagar / 1.18;
    const igv = totalaPagar - MontoBase;
    const montoOperGravadas = MontoBase;

    let ventaFormateada: ComprobanteInterface ;

    ventaFormateada =  {
      tipoOperacion: '0101', // Venta interna
      tipoDoc: this.obtenerCodigoComprobante(venta.tipoComprobante),  // Factura:01, Boleta:03 //
      serie: venta.serieComprobante,
      correlativo: venta.numeroComprobante, // venta.numeroComprobante,
      fechaEmision: this.formtearFecha(venta.fechaEmision), // TODO, formaterar fecha a Data-time
      tipoMoneda: 'PEN',
      client: this.formatearCliente(venta.cliente),
      company: this.formatearEmpresa(this.datosDeEmpresa),
      mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
      mtoIGV: redondeoDecimal(igv, 2),
      icbper: redondeoDecimal(icbr, 2),
      totalImpuestos: redondeoDecimal(igv + icbr, 2),
      valorVenta: redondeoDecimal(montoOperGravadas, 2),
      mtoImpVenta: redondeoDecimal(venta.totalPagarVenta, 2),
      ublVersion: '2.1',
      details: productFormat,
      legends: [
        {
          code: '1000',
          value: MontoALetras(totalaPagar)
        }
      ],
      // descuentos: venta.descuentoVenta > 0 ? [descuento] : []
    };

    const descuento: ChangeInterface = {};
    if (venta.descuentoVenta > 0){
      // const Descuento = venta.descuentoVenta;

      // let descuentoBase = Descuento / 1.18;
      // const descuentoIgv = redondeoDecimal(Descuento - descuentoBase, 2);
      // descuentoBase = redondeoDecimal(descuentoBase, 2);


      // const objetoDescuento: SaleDetailInterface = {
      //     unidad: 'NIU',
      //     descripcion: 'DESCUENTO',
      //     cantidad: 1,
      //     mtoValorUnitario: descuentoBase,
      //     mtoValorVenta: -descuentoBase,
      //     mtoBaseIgv: -descuentoBase,
      //     porcentajeIgv: 18,
      //     igv: -descuentoIgv,
      //     tipAfeIgv: '10', // OperacionOnerosa: 10
      //     totalImpuestos: -descuentoIgv, // suma de todos los impues que hubiesen
      //     mtoPrecioUnitario: -Descuento
      // };

      // ventaFormateada.details.push(objetoDescuento);

      // descuento = {
      //   codTipo: '00',
      //   // montoBase: venta.montoNeto,
      //   // factor: `${redondeoDecimal((venta.descuentoVenta) / venta.montoNeto, 2)}`,
      //   monto: venta.descuentoVenta
      // };

      // ventaFormateada.descuentos = [descuento];
      ventaFormateada.sumDsctoGlobal = venta.descuentoVenta;
    }

    return ventaFormateada;
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



  formtearFecha(dateTime: any): string{

    const fechaFormateada = new Date(moment.unix(dateTime.seconds).format('D MMM YYYY H:mm:ss'));
    const fechaString = formatDate(fechaFormateada, 'yyyy-MM-ddThh:mm:ss-05:00', 'en');
    // console.log('aaaaaaaaaaaaa', fechaString);
    return fechaString;
  }

  formtearFechaActual(): string{
    const hoy = new Date();
    console.log(hoy);
    const fechaFormateada = new Date(moment(hoy).format('D MMM YYYY H:mm:ss'));
    const fechaString = formatDate(fechaFormateada, 'yyyy-MM-ddThh:mm:ss-05:00', 'en');
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
    if (typoDoc === 'dni'){
      return '1';
    } else if (typoDoc === 'ruc') {
      return '6';
    } else{
      return 'TYPO DE DOCUMENTO INVALIDO';
    }
  }

  formatearEmpresa(empresa: EmpresaInterface): CompanyInterface{
    let empresaDireccion: AddressInterface = {};
    const sede = this.sede.toLocaleLowerCase();

    if (sede === 'andahuaylas'){
      empresaDireccion = {
        ubigueo: '030201',
        direccion : 'AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS',
        codigoPais: 'PE',
        departamento: 'APURIMAC',
        provincia: 'ANDAHUAYLAS',
        distrito: 'ANDAHUAYLAS'
      };
    } else if (sede === 'abancay'){
      empresaDireccion = {
        ubigueo: '030101',
        direccion : 'AV.SEOANE NRO. 100 (PARQUE EL OLIVO) APURIMAC - ABANCAY - ABANCAY',
        codigoPais: 'PE',
        departamento: 'APURIMAC',
        provincia: 'ABANCAY',
        distrito: 'ABANCAY'
      };
    } else {
      console.log('direccion no valida');
    }

    return {
      ruc: empresa.ruc,
      nombreComercial: 'VETERINARIAS TOBBY',
      razonSocial: empresa.razon_social,
      address: empresaDireccion
    };
  }


/* ---------------------------------------------------------------------------------------------- */
/*                           enviar nota de credito                                               */
/* ---------------------------------------------------------------------------------------------- */

  enviarNotaDeCreditoAdaptador(venta: VentaInterface){
    // console.log('EnviarNotaCreditoAdaptador: ', venta);

    // solo enviar a sunat si ya tiene un cdr y estado exito
    if (venta.cdr && venta.cdr.sunatResponse.success === true ){
      console.log('SE ENVIARÁ NOTA DE CREDITO');
      this.dataApi.obtenerProductosDeVenta(venta.idListaProductos, this.sede).subscribe((data: any) => {
        console.log('Lista de productos de la venta obtenidos de firebase:', data);

        // tslint:disable-next-line: deprecation
        if (!isNullOrUndefined(data)) {
          venta.listaItemsDeVenta = data.productos;
        }

        // const ventaFormateada = this.formatearVenta(venta);
        const typoComprobante = `n.credito.${venta.tipoComprobante}`;
        console.log('CORRELACION--------------------------------', typoComprobante);

        this.obtenerSerie(typoComprobante).then((dataComprobante: any) => {
          console.log('DATOS DEL COMPROBANTE', dataComprobante);
          const IdSerie =  dataComprobante.id;
          const DatosSerie = {
            serie: dataComprobante.serie,
            correlacion: dataComprobante.correlacion
          };

          console.log('DATOS DEL COMPROBANTE FORMATEADO', DatosSerie);

          const notaCreditoFormateado = this.formatearNotaDeCredito(venta, DatosSerie);
          console.log('NOTA DE CREDITO FORMATEADO', notaCreditoFormateado);

          this.enviarNotaCreditoASunat(notaCreditoFormateado).then(cdr => {
            console.log('cdr de nota de credito', cdr);
            this.dataApi.incrementarCorrelacionTypoDocumento(IdSerie, this.sede, DatosSerie.correlacion); // .then(() => {
            //   this.dataApi.guardarCDRAnulado(venta.idVenta, venta.fechaEmision, this.sede, cdr);
            // });
          }).catch(error => console.log('No se envio comprobante a la SUNAT', error));

        }).catch(error => console.log('No se envio comprobante a la SUNAT', error));

      });

    } else {
      console.log('no se enviará el comprobante porque no tiene cdr');
    }

  }

  async obtenerSerie(typoDocumento: string){
    let datosComprobante: any;

    const promesa = new Promise((resolve, reject) => {
      this.dataApi.obtenerCorrelacionTypoDocumento(typoDocumento, this.sede).subscribe(data => {
        console.log(data);
        datosComprobante = data[0];
        resolve(datosComprobante);
      });
    });
    return promesa;

  }

  enviarNotaCreditoASunat(notaCreditoFormateado: NotaDeCreditoInterface){
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer '.concat(this.datosDeEmpresa.token.code));
    myHeaders.append('Content-Type', 'application/json');

    // TODO: Poner el tipo de dato a raw
    let raw: string;
    raw = JSON.stringify(notaCreditoFormateado);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/note/send', requestOptions)
      .then(response => response.json())
      // .then(result => console.log(result))
      .catch(error => console.log('error', error));

  }

  formatearNotaDeCredito(venta: VentaInterface, serieNotaCred: {serie: string, correlacion: number}): NotaDeCreditoInterface{
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
      codMotivo: '06', //  Códigos de Tipo de Nota de Crédito Electrónica - 07:Devolucion por item
      desMotivo: 'DEVOLUCION TOTAL',
      tipoDoc: '07', // nota de crédito, nota de debito 08
      serie: serieNotaCred.serie, // 'FF01', // la nota de credito, F si factura y B si boleta
      correlativo: `${serieNotaCred.correlacion}`, // '123', // correlacion  // NOTE - Tambien debe obtenerse aquí
      fechaEmision: this.formtearFechaActual(), // '2019-10-27T00:00:00-05:00', // Fecha de emision // NOTE - se debe gener aquí.
      tipoMoneda: 'PEN',
      client: this.formatearCliente(venta.cliente),
      company:  this.formatearEmpresa(this.datosDeEmpresa),
      mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
      mtoIGV: redondeoDecimal(igv, 2),
      totalImpuestos: redondeoDecimal(igv, 2),
      // valorVenta: redondeoDecimal(montoOperGravadas, 2),
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

/* ---------------------------------------------------------------------------------------------- */


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

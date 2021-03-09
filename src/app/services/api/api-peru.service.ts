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

import { redondeoDecimal, formatearDateTime } from 'src/app/global/funciones-globales';
import { MontoALetras } from 'src/app/global/monto-a-letra';
import { GENERAL_CONFIG } from '../../../config/apiPeruConfig';
import { ApiPeruConfigInterface, DatosApiPeruInterface, DatosEmpresaInterface } from './apiPeruInterfaces';
import { CDRInterface } from 'src/app/models/api-peru/cdr-interface';



@Injectable({
  providedIn: 'root'
})
export class ApiPeruService {

  sede = this.storage.datosAdmi.sede.toLocaleLowerCase();

  // userApiPeru = 'friendscode';
  // passwardApiPeru = 'friends2019peru';

  // rucEmpresa = '20601831032';

  // tokenEmpresa: string;
  datosDeEmpresaOnFirebase: EmpresaInterface;

  datosApiPeru: DatosApiPeruInterface;
  datosEmpresa: DatosEmpresaInterface;
  // datosSede: AddressInterface;
  sedeDireccion: AddressInterface;


  constructor(
    private dataApi: DbDataService,
    private storage: StorageService
  ) {
    // TODO : DESCOMENTAR LINEA ABAJO
    // this.obtenerDatosDeLaEmpresa();
    this.sede = storage.datosAdmi.sede.toLocaleLowerCase();
    this.setApiPeruConfig(GENERAL_CONFIG);
  }

  // verificarVenta(venta: VentaInterface){
  // }
  saludo(){
    return 'hola';
  }
  getSede(){
    return this.sede;
  }

  setApiPeruConfig(config: ApiPeruConfigInterface){
    // console.log('CONFIGGGGGGGGGGGGGGGGG', config);

    this.datosApiPeru = config.datosApiPeru;
    // this.userApiPeru = config.datosApiPeru.usuario;
    // this.passwardApiPeru = config.datosApiPeru.password;

    this.datosEmpresa = config.datosEmpresa;
    // this.rucEmpresa = this.datosEmpresa.ruc;
    // this.tokenEmpresa = this.datosEmpresa.token;

    // this.datosSede = config.sedes[this.sede];
    // console.log(config.sedes[this.sede]);
    this.sedeDireccion = config.sedes[this.sede].direccion;
    // console.log('sedeDireccion', this.sedeDireccion);
  }



/* ------------------------------------------------------------------------------------------------ */
/*                                    configuración apisperu setting                                */
/* ------------------------------------------------------------------------------------------------ */
  setApiPeruDataUser(newUser: string, newPassword: string){
    this.datosApiPeru = {
      usuario: newUser,
      password: newPassword
    };
  }

  async login(){
    /**
     *  @objetivo : obtener un UserToken de apis peru
     *  @note   : Un UserToken tiene una duración de 24 horas.
     *  @nota   : Si llega a apisPeru responde con un resolve
     *  @return : Promesa<{token: string}>
     */
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    console.log(this.datosApiPeru);

    const raw = JSON.stringify({
      username: this.datosApiPeru.usuario,
      password: this.datosApiPeru.password
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/auth/login', requestOptions)
      .then(tokenResponse => tokenResponse.json())
      // .then(result => result.token)
      .catch(error => error);
  }

  async obtenerUserApiperuToken(){
    /**
     *  @objetivo : Validar y obtener un UserToken valido de api peru
     *  @return : exito: promesa<token:string>, else: promesa<''>
     *  @CausasDeUnError : Error de internet
     *  @CausasDeUnError : Usuario o constraseña invalido de ApisPeru
     */
    const loginResponse = await this.login();

    if (loginResponse.token){
      return loginResponse.token;
    }
    return '';
  }

  async listarEmprasas(){
    /**
     *  @objetivo : obtener una lista de empresas de apisPeru
     *  @return : Promesa< [datosEmpresa1, datosEmpresa2, ... ] >
     *  @CausasDeUnError : Error de internet
     *  @CausasDeUnError : Si no se obtuviese el token
     */
    const myHeaders = new Headers();
    const userToken = await this.obtenerUserApiperuToken();
    // tslint:disable-next-line: curly
    if (!userToken) return [];

    myHeaders.append('Authorization', 'Bearer '.concat(userToken));

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      // body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/companies', requestOptions)
      .then(listaEmpresas => listaEmpresas.json())
      // .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }


  async obtenerEmpresaByRUC(rucEnter: string){
    /**
     *  @objetivo : Extraer la empresa de apisPeru deacuerdo al parametro
     *  @return : exito: Promesa< {datosEmpresa1} >, else Promesa< {} >
     *  @CausasDeUnError : Error de internet
     *  @CausasDeUnError : Si no se obtuviese el token
     */
    const listaDeEmpresas = await this.listarEmprasas();
    // console.log(rucEnter);
    for (const empresa of listaDeEmpresas) {
      if (empresa.ruc === rucEnter){
        return empresa;
      }
    }
    // console.log('ruc failllllllllllllllllllllllllllllll');
    return {};
  }

  async obtenerTokenDeEmpresa(rucEnter: string){
    const empresa = await this.obtenerEmpresaByRUC(rucEnter);
    // console.log(empresa.token.code);
    return empresa.token.code;
  }

  async getAndSaveEmpresaOnfirebase(rucEnter = this.datosEmpresa.ruc){
    /**
     *  @objetivo : Obtener empresa de ApisPeru y Guardarlo en Firebase
     *  @return : exito: Promesa< {datosEmpresa1} >, else Promesa< {} >
     *  @CausasDeUnError : Error de internet
     *  @CausasDeUnError : Si no se obtuviese el token
     */

    const empresa = await this.obtenerEmpresaByRUC(rucEnter);
    if (Object.entries(empresa).length === 0) {
      // tslint:disable-next-line: no-string-throw
      throw 'fail';
    }
    return this.dataApi.guardarDatosEmpresa(empresa);
  }

  obtenerDatosDeLaEmpresa(){
    this.dataApi.obtenerEmpresa().subscribe((data: any) => {
      if (Object.entries(data).length === 0 || data.ruc !== this.datosEmpresa.ruc) {
        this.getAndSaveEmpresaOnfirebase(this.datosEmpresa.ruc);
      }
      this.datosDeEmpresaOnFirebase = data;
      console.log(this.datosDeEmpresaOnFirebase);
    });
  }

  getDatosEmpresa(){
    return this.datosDeEmpresaOnFirebase;
  }
/* ------------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------------------------------ */
/*                                     ENVIAR COMPROBANTE A SUNAT                                   */
/* ------------------------------------------------------------------------------------------------ */
  async enviarASunatAdaptador(venta: VentaInterface){
    if (venta.cdr && venta.cdr.sunatResponse.success === true){
      throw String('ya fue enviado');
    } else {

      let productos: any;
      productos = await this.obtenerProductosDeVenta(venta.idListaProductos).catch(err => err);

      if (productos === 'fail'){
        throw String('Error de Conexion a Intenet, no se encontro lista de productos');
      }

      console.log('PRODUCTOS_DE_VENTA: ', productos);

      if (!productos.length){
        throw String(`no se encontro productos por idListaProductos: ${venta.idListaProductos}`);
      }

      venta.listaItemsDeVenta = productos;

      const ventaFormateada: ComprobanteInterface = this.formatearVenta(venta);
      console.log('VENTA_FORMATEADA', ventaFormateada);

      if (ventaFormateada.fechaEmision === 'INVALID_DATA_TIME'){
        throw String('Fecha de emisión invalida');
      }

      const cdrRespuesta = await this.enviarComprobanteASunat(ventaFormateada)
        .catch(error => {
          console.log('No se envio comprobante a la SUNAT', error);
          return 'fail';
        });

      if (cdrRespuesta === 'fail'){
        throw String('COMPROBANTE NO ENVIADO A SUNAT');
      }

      console.log('Cdr', cdrRespuesta);

      // un for de tres intentos para guardar cdr
      let seGuardoCdr: string;
      for (let i = 0; i < 3; i++) {

        seGuardoCdr =  await this.guardarCDR(venta.idVenta, venta.fechaEmision, cdrRespuesta).then(exito => exito).catch(err => {
            console.log('err');
            return 'fail';
          });

        if ( seGuardoCdr === 'exito'){
          break;
        }
      }

      if ( seGuardoCdr === 'fail'){
        console.log(`Se obtuvo el cdr pero no se pudo guardar, con Success: ${cdrRespuesta.sunatResponse.success}`);
        throw String('NO SE GUARDO EL CDR');
      }

      return 'exito';
    }
  }

  async guardarCDR(idVenta: string, fechaEmision: any, cdrRespuesta: CDRInterface){
    return this.dataApi.guardarCDR2(idVenta, fechaEmision, this.sede, cdrRespuesta).then(exito => {
      return exito;
    }).then(err => err);
  }

  async obtenerProductosDeVenta(idListaProductos: string){
    if (!idListaProductos){
      return [];
    }
    return this.dataApi.obtenerProductosDeVenta2(idListaProductos, this.sede).catch(err => {
      throw err;
    });
  }



  // NOTE - Esta es la función más importante que se encarga de enviar una factura a sunat
  enviarComprobanteASunat(ventaFormateada: ComprobanteInterface){
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer '.concat(this.datosEmpresa.token));
    myHeaders.append('Content-Type', 'application/json');

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
      .then(cdr => cdr)
      .catch(error => error);
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
      fechaEmision: formatearDateTime('YYYY-MM-DDTHH:mm:ss-05:00', venta.fechaEmision), // this.formtearFecha(venta.fechaEmision)
      tipoMoneda: 'PEN',
      client: this.formatearCliente(venta.cliente),
      company: this.formatearEmpresa(this.datosEmpresa),
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
    // console.log(listaFormateda);
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
        unidad: this.ObtenerCodigoMedida(itemDeVenta.producto.medida),
        descripcion: itemDeVenta.producto.nombre,
        cantidad: itemDeVenta.cantidad,
        mtoValorUnitario: redondeoDecimal(precioUnitarioBase, 2),
        mtoValorVenta: redondeoDecimal(montoBase, 2),
        mtoBaseIgv: redondeoDecimal(montoBase, 2),
        porcentajeIgv: 18,
        igv: redondeoDecimal(igvTotal, 2),
        tipAfeIgv: '10', // OperacionOnerosa: 10
        totalImpuestos: redondeoDecimal(igvTotal, 2), // suma de todos los impuestos que hubiesen
        mtoPrecioUnitario: redondeoDecimal(precioUnit, 2)
    };
  }

  obtenerCodigoComprobante(typoComprobante: string){

    if (typoComprobante.toLowerCase() === 'factura'){
      return '01';
    } else if (typoComprobante.toLowerCase() === 'boleta'){
      return '03';
    } else {
      // console.log('Comprobante no valido');
      return 'TYPO COMPROBANTE INVALID';
    }
  }

  formatearCliente(cliente: ClienteInterface): ClientInterface{
    // TODO - Que pasa si un dato del cliente falta
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

  formatearEmpresa(empresa: DatosEmpresaInterface): CompanyInterface{
    // TODO - QUE PASA SI ALGUNO NO TIENE DATOS
    return {
      ruc: empresa.ruc,
      nombreComercial: empresa.nombreComercial,
      razonSocial: empresa.razon_social,
      address: this.sedeDireccion
    };
  }


/* ---------------------------------------------------------------------------------------------- */
/*                           enviar nota de credito                                               */
/* ---------------------------------------------------------------------------------------------- */
  // REFACTOR - NOTA DE CREDITO
  async enviarNotaDeCreditoAdaptador(venta: VentaInterface){
    console.log('______________________ENVIAR_NOTA_CREDITO______________________');
    if (venta.cdrAnulado && venta.cdrAnulado.sunatResponse.success === true){
      throw String(`Ya se ha emitido la Nota de Credito para el comprobante: ${venta.serieComprobante}-${venta.numeroComprobante}`);
    }

    if (venta.cdr && venta.cdr.sunatResponse.success === true){

      let productos: any;
      productos = await this.obtenerProductosDeVenta(venta.idListaProductos).catch(err => err);

      if (productos === 'fail'){
        throw String('Error de Conexion a Intenet, no se encontro lista de productos');
      }

      console.log('PRODUCTOS_DE_VENTA: ', productos);

      if (!productos.length){
        throw String(`no se encontro productos por idListaProductos: ${venta.idListaProductos}`);
      }
      venta.listaItemsDeVenta = productos;

      const typoComprobante = `n.credito.${venta.tipoComprobante}`;
      const serie = await this.obtenerSerie(typoComprobante).catch(err => err);

      if ( serie === 'fail'){
        throw String('No se pudo obtener la serie para Nota de Credito');
      }

      const IdSerie =  serie.id;
      const DatosSerie = {
        serie: serie.serie,
        correlacion: serie.correlacion + 1
      };

      // console.log('se usará la correlacion: ', DatosSerie.correlacion);

      const notaCreditoFormateado = this.formatearNotaDeCredito(venta, DatosSerie);

      // console.log('NOTA DE CREDITO FORMATEADO', notaCreditoFormateado);
      const fechaEmisionNotaCredito = notaCreditoFormateado.fechaEmision;

      const cdrRespuesta = await this.enviarNotaCreditoASunat(notaCreditoFormateado).catch(err => 'fail');

      console.log('CDR NOTA DE CREDITO', cdrRespuesta);

      if (cdrRespuesta === 'fail'){
        throw String('COMPROBANTE NO ENVIADO A SUNAT');
      }

      let respIncremtarCorrelacion = true;
      let guardarCDRAnulado = true;

      await(
        this.incrementarCorrelacionNotaCredito(IdSerie, DatosSerie).catch(() => {
          respIncremtarCorrelacion = false;
        }),
        this.guardarCDRAnulado(venta.idVenta, venta.fechaEmision, cdrRespuesta, fechaEmisionNotaCredito).catch(() => {
          guardarCDRAnulado = false;
        })
      );

      if (!respIncremtarCorrelacion){
        throw String('NO INCREMENTO LA CORRELACION');
      }

      if (!guardarCDRAnulado){
        throw String('NO SE GUARDO EL CDR');
      }

      return 'exito';

    } else {
      throw String(`El comprobante: ${venta.serieComprobante}-${venta.numeroComprobante}, aun no ha sido enviado a SUNAT`);
    }
  }

  async incrementarCorrelacionNotaCredito(IdSerie: any, DatosSerie: {serie: string, correlacion: number}){
    let seGuardoCdr: string;
    for (let i = 0; i < 3; i++) {
      seGuardoCdr = await this.dataApi.incrementarCorrelacionTypoDocumento(IdSerie, this.sede, DatosSerie.correlacion)
      .catch(() => 'fail');

      if ( seGuardoCdr === 'exito'){
        console.log('SE GUARDO EN EL INTENTO Incrementar: ', i);
        return 'exito';
      }
    }
    throw String('fail');
  }

  async guardarCDRAnulado(idVenta: string, fechaEmisionVenta: any, cdrRespuesta: CDRInterface, fechaEmisionNotaCredito: string){
    let seGuardoCdr: string;
    for (let i = 0; i < 3; i++) {
      seGuardoCdr = await this.dataApi.guardarCDRAnulado(idVenta, fechaEmisionVenta, this.sede, cdrRespuesta, fechaEmisionNotaCredito)
      .then(() => 'exito').catch(() => 'fail');

      if ( seGuardoCdr === 'exito'){
        console.log('SE GUARDO EN EL INTENTO cdrAnulado: ', i);

        return 'exito';
      }
    }

    throw String('fail');
  }


  async obtenerSerie(typoDocumento: string){
    const valor = await  this.dataApi.obtenerCorrelacionTypoDocumentoV2(typoDocumento, this.sede).then(serie => serie).catch(err => err);
    console.log(valor);

    if (Object.entries(valor).length === 0) {
      // tslint:disable-next-line: no-string-throw
      throw 'fail';
    }
    return valor;
  }


  enviarNotaCreditoASunat(notaCreditoFormateado: NotaDeCreditoInterface){
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer '.concat(this.datosEmpresa.token));
    myHeaders.append('Content-Type', 'application/json');

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
      .then(cdr => cdr)
      .catch(error => console.log('error', error));

  }

  formatearNotaDeCredito(venta: VentaInterface, serieNotaCred: {serie: string, correlacion: number}): NotaDeCreditoInterface{
    // console.log('Venta a ser Formateada', venta);
    // console.log('Fecha de emision de la venta', venta.fechaEmision);
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

    // const totalaPagar = venta.totalPagarVenta;
    // const montoBase = totalaPagar / 1.18;
    // const igv = totalaPagar - montoBase;
    // const montoOperGravadas = montoBase;

    return {
      tipDocAfectado: this.obtenerCodigoComprobante(venta.tipoComprobante), // '01',   // Factura
      numDocfectado: `${venta.serieComprobante}-${venta.numeroComprobante}`, // 'F001-111', // numero y serie
      codMotivo: '06', //  Códigos de Tipo de Nota de Crédito Electrónica - 07:Devolucion por item
      desMotivo: 'DEVOLUCION TOTAL',
      tipoDoc: '07', // nota de crédito, nota de debito 08
      serie: serieNotaCred.serie, // 'FF01', // la nota de credito, F si factura y B si boleta
      correlativo: `${serieNotaCred.correlacion}`, // '123', // correlacion  // NOTE - Tambien debe obtenerse aquí
      fechaEmision: formatearDateTime('YYYY-MM-DDTHH:mm:ss-05:00'), // this.formtearFechaActual(), // '2019-10-27T00:00:00-05:00',
      tipoMoneda: 'PEN',
      client: this.formatearCliente(venta.cliente),
      company:  this.formatearEmpresa(this.datosEmpresa),
      mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
      mtoIGV: redondeoDecimal(igv, 2),
      totalImpuestos: redondeoDecimal(igv, 2),
      icbper: redondeoDecimal(icbr, 2),
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
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------------------- */
  formatearResumenDiario(listaDeVentas: VentaInterface[], fechaVenta: string){
    let resumenDiarioFormateado: any = {};

    const listaVentasFormateadas: any[] = [];
    for (const venta of listaDeVentas) {
      if (venta.tipoComprobante === 'boleta'){
        listaVentasFormateadas.push(this.formatearVentaResumenDiario(venta));
      }
    }


    resumenDiarioFormateado = {
      fecGeneracion: `${fechaVenta}T00:00:00+00:00`, // , '2019-10-27T00:00:00+00:00', // Día Generacion de Boletas
      fecResumen: this.formtearFechaActual(),  // Dia que se gener el resumenDiario
      correlativo: '001',
      moneda: 'PEN',
      company: this.formatearEmpresa(this.datosEmpresa),
      details: listaVentasFormateadas
    };
    console.log('ESTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTEEEEEEEEES rESUMEN diario Formateado', resumenDiarioFormateado);
  }

  formatearVentaResumenDiario(venta: VentaInterface){

    let icbr: number;
    if (venta.hasOwnProperty('cantidadBolsa')){
      icbr = venta.cantidadBolsa * 0.3;
    }else{
      icbr = 0;
    }

    const totalaPagar = venta.totalPagarVenta - icbr;
    const MontoBase = totalaPagar / 1.18;
    const igv = totalaPagar - MontoBase;
    const montoOperGravadas = MontoBase;


    return {
      tipoDoc: this.obtenerCodigoComprobante(venta.tipoComprobante),  // Factura:01, Boleta:03 //
      serieNro: `${venta.serieComprobante}-${venta.numeroComprobante}`,
      estado: venta.estadoVenta === 'anulado' ? '3' : '1',
      clienteTipo: this.ObtenerCodigoTipoDoc(venta.cliente.tipoDoc),
      clienteNro: venta.cliente.numDoc,
      mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
      mtoIGV: redondeoDecimal(igv, 2),
      icbper: redondeoDecimal(icbr, 2),
      // mtoOperInafectas: 0,
      // mtoOperExoneradas: 0,
      // mtoOperExportacion: 0,
      // mtoOtrosCargos: 0,
      total: redondeoDecimal(venta.totalPagarVenta, 2)
    };
  }

/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------------------------- */
  // CLEAN -FORMATEAR FECHA Y FORMATEAR FECHA ACTUAL
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

  ObtenerCodigoMedida(medida: string){
    switch (medida.toLowerCase()) {
      case 'gramos': return 'GRM';
      case 'servicios': return 'ZZ';
      case 'kilogramos': return 'KGM';
      case 'litros': return 'LTR';
      case 'unidad': return 'NIU';
      case 'cajas': return 'BX';
      case 'paquetes': return 'PK';
      case 'botellas': return 'BO';
      case 'docena': return 'DZN';
      case 'kit': return 'KT';
      case 'libras': return 'LBR';
      case 'metros': return 'MTR';
      case 'miligramos': return 'MGM';
      case 'mililitros': return 'MLT';
      case 'milimetros': return 'MMT';
      case 'pulgadas': return 'INH';
      case 'bolsas': return 'BG';
      case 'par': return 'PR';
      case 'piezas': return 'C62';
      case 'latas': return 'CA';
      case 'juego': return 'SET';
      case 'onzas': return 'ONZ';
      case 'pies': return 'FOT';
      case 'ciento de unidades': return 'CEN';
      case 'balde': return 'BJ';
      case 'barriles': return 'BLL';
      case 'cartones': return 'CT';
      case 'centimetro cuadrado': return 'CMK';
      case 'metro cuadrado': return 'MTK';
      case 'milimetro cuadrado': return 'MMK';
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

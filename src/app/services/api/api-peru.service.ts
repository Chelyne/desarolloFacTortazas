import { Injectable } from '@angular/core';
import { EmpresaInterface } from 'src/app/models/api-peru/empresa';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { AddressInterface, ClientInterface, CompanyInterface } from 'src/app/models/comprobante/comprobante';
import { ComprobanteInterface, NotaDeCreditoInterface, SaleDetailInterface } from 'src/app/models/comprobante/comprobante';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { VentaInterface } from 'src/app/models/venta/venta';
import { StorageService } from '../storage.service';

import { redondeoDecimal, formatearDateTime } from 'src/app/global/funciones-globales';
import { MontoALetras } from 'src/app/global/monto-a-letra';
import { GENERAL_CONFIG } from '../../../config/generalConfig';
import { ApiPeruConfigInterface, DatosApiPeruInterface, DatosEmpresaInterface } from './apiPeruInterfaces';
import { CDRInterface } from 'src/app/models/api-peru/cdr-interface';
import { DataBaseService } from '../data-base.service';



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

  FACTOR_ICBPER = 0.3;

  enviroment = '';


  constructor(
    private dataApi: DataBaseService,
    private storage: StorageService
  ) {
    this.sede = storage.datosAdmi.sede.toLocaleLowerCase();
    this.setApiPeruConfig(GENERAL_CONFIG);
  }

  saludo(){
    return 'hola';
  }

  getSede(){
    return this.sede;
  }

  setApiPeruConfig(config: ApiPeruConfigInterface){

    this.datosApiPeru = config.datosApiPeru;

    this.datosEmpresa = config.datosEmpresa;
    this.datosEmpresa.telefono = config.sedes[this.sede].telefono ?? '';
    this.datosEmpresa.email = config.sedes[this.sede].email ?? '';

    this.sedeDireccion = this.formatearDireccion(config.sedes[this.sede].direccion);
  }

  formatearDireccion(objDireccion: any): AddressInterface{
    return {
      ubigueo: objDireccion.ubigueo ?? '',
      codigoPais: objDireccion.codigoPais ?? '',
      departamento: objDireccion.departamento ?? '',
      provincia: objDireccion.provincia ?? '',
      distrito: objDireccion.distrito ?? '',
      direccion: objDireccion.direccion ?? '',
    };
  }





/* ------------------------------------------------------------------------------------------------ */
/*                                    configuración apisperu setting                                */
/* ------------------------------------------------------------------------------------------------ */
  /** CLEAN - funcion desfasada */
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

    // console.log(this.datosApiPeru);

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
      .catch(error => {
        throw error;
      });
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
      .catch(error => {
        throw error;
      });
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

  async obtenerEmpresaPorId(){
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer '.concat(await this.obtenerUserApiperuToken()));

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    return fetch(`https://facturacion.apisperu.com/api/v1/companies/${this.datosEmpresa.apisPeruId}`, requestOptions)
      .then(response => response.json())
      .then(apisPeruEmpresa => apisPeruEmpresa)
      .catch(error => {
        throw error;
    });
  }

  async modificarEmpresa(NewEmpresaValues: EmpresaInterface){
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer '.concat(await this.obtenerUserApiperuToken()));
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify(NewEmpresaValues);

    const requestOptions: RequestInit = {
      method: 'PUT',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch(`https://facturacion.apisperu.com/api/v1/companies/${this.datosEmpresa.apisPeruId}`, requestOptions)
      .then(response => response.json())
      .then(empresaModificada => empresaModificada)
      .catch(error => {
        throw error;
      });
  }

  async toggleEnviromentEmpresa(){
    console.log('ambiar enviromenttttttttttttttttttttt');
    /**
     * @objetivo : Intercambia entre beta y produccion
     */

    /** obtener el enviroment de la empresa */
    const actualEnviroment = await this.obtenerEmpresaPorId().then( (Empresa: any) => Empresa.environment.nombre ?? '')
    .catch(() => 'fail');

    if (actualEnviroment === 'fail' || actualEnviroment === ''){
      throw String('ERROR AL OBTENER ENVIROMENT DE EMPRESA');
    }

    const newEnviroment = actualEnviroment === 'beta' ? 'produccion' : 'beta';

    return await this.modificarEmpresa({environment: newEnviroment}).then((Emp) => {
      this.enviroment = Emp.environment.nombre;
      return Emp.environment.nombre;
    })
    .catch(() => {
      throw String('No se pudo modificar el Enviroment');
    });
  }

  async obtenerEnviromentFromApisPeru(){
    return await this.obtenerEmpresaPorId().then( (Empresa: any) => Empresa.environment.nombre ?? '')
    .catch(err => {
      throw err;
    });
  }

  async obtenerEnviroment(){
    if (!this.enviroment){
      const result = await this.obtenerEnviromentFromApisPeru().then((env) => {
        this.enviroment = env;
      }).catch(() => 'fail');

      if (result === 'fail'){
        return 'NO_HAY_ENVIROMENT';
      }
    }

    return this.enviroment;
  }

/* ------------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------------ */
/* ------------------------------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------------------------------ */
/*                                     ENVIAR COMPROBANTE A SUNAT                                   */
/* ------------------------------------------------------------------------------------------------ */
  async enviarASunatAdaptador(venta: VentaInterface){
    if (venta.cdr && venta.cdr?.sunatResponse?.success === true){
      throw String('ya fue enviado');
    } else {

      if (!venta.idVenta || !venta.idListaProductos){
        throw String('Venta sin ID o IDlistaProductos');
      }

      let productos: any;
      productos = await this.obtenerProductosDeVenta(venta.idListaProductos).catch(err => err);

      if (productos === 'fail'){
        throw String('Error de Conexion a Intenet, no se encontro lista de productos');
      }

      // console.log('PRODUCTOS_DE_VENTA: ', productos);

      if (!productos.length){
        throw String(`no se encontro productos por idListaProductos: ${venta.idListaProductos}`);
      }

      venta.listaItemsDeVenta = productos;


      const ventaFormateada: ComprobanteInterface = this.intentarFormatearVenta(venta);
      // const ventaFormateada: ComprobanteInterface = this.formatearVenta(venta);

      console.log('%cENVIAR COMPROBANTE A SUNAT:', 'color:white; background-color:DodgerBlue;padding:20px');
      console.log('VENTA_FORMATEADA', ventaFormateada);

      const cdrRespuesta = await this.enviarComprobanteASunat(ventaFormateada)
        .catch(error => {
          console.log('No se envio comprobante a la SUNAT', error);
          return 'fail';
        });

      if (cdrRespuesta === 'fail'){
        throw String('COMPROBANTE NO ENVIADO A SUNAT');
      }

      console.log('Cdr', cdrRespuesta);

      /** ANALISIS DE CDR */
      const cdrStatusForResponse: {success?: boolean, observaciones?: any, typoObs?: string} = {};
      cdrStatusForResponse.success = cdrRespuesta.sunatResponse.success ?? false;

      if (cdrRespuesta.sunatResponse.error){
        cdrStatusForResponse.observaciones = cdrRespuesta.sunatResponse.error;
        cdrStatusForResponse.typoObs = 'error';
      } else {
        cdrStatusForResponse.observaciones = cdrRespuesta.sunatResponse.cdrResponse.notes ?? [];
        cdrStatusForResponse.typoObs = 'notes';
      }

      if (
        !cdrStatusForResponse.success ||
        Object.entries(cdrStatusForResponse.observaciones).length ||
        cdrStatusForResponse.observaciones.length
      ){
        console.log('%cOBSERVACIONES:', 'color:white; background-color:red;padding:20px');
        console.log(cdrStatusForResponse.observaciones);
      }

      // un for de tres intentos para guardar cdr
      let seGuardoCdr = '';
      for (let i = 0; i < 3; i++) {

        seGuardoCdr =  await this.guardarCDR(venta.idVenta, venta.fechaEmision, cdrRespuesta).then(exito => exito)
          .catch(err => {
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

      return cdrStatusForResponse;
      // return 'exito';
    }
  }

  async guardarCDR(idVenta: string, fechaEmision: any, cdrRespuesta: CDRInterface){
    return this.dataApi.guardarCDR(idVenta, fechaEmision, this.sede, cdrRespuesta)
    .then(exito =>  exito)
    .catch(err => {
      throw err;
    });
  }

  async obtenerProductosDeVenta(idListaProductos: string){
    if (!idListaProductos){
      return [];
    }
    return this.dataApi.obtenerProductosDeVenta(idListaProductos, this.sede).catch(err => {
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

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
      .then(response => response.json())
      .then(cdr => cdr)
      .catch(error => {
        throw error;
      });
  }

  intentarFormatearVenta(venta: VentaInterface): ComprobanteInterface{
    try {
      const ventaFormateada = this.formatearVenta(venta);
      if (ventaFormateada.fechaEmision === 'INVALID_DATA_TIME'){
        throw String('FECHA DE EMESION INVALIDO');
      }
      return ventaFormateada;
    } catch (error) {
      throw error;
    }
  }

  formatearVenta(venta: VentaInterface): ComprobanteInterface{

    if (!venta.serieComprobante || !venta.numeroComprobante){
      throw String('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');
    }

    if (!venta.listaItemsDeVenta){
      throw String('VENTA INCONSISTE, NO EXISTE ITEMS DE VENTA');
    }

    if (!venta.totalPagarVenta){
      throw String('VENTA INCONSISTENTE, TOTAL PAGAR VENTA NO DEFINIDO');
    }

    const productFormat = this.formatearDetalles(venta.listaItemsDeVenta);

    let icb: number;
    let cantidaBolsas = 0;
    if (venta.cantidadBolsa && venta.cantidadBolsa > 0){
      icb = venta.cantidadBolsa * this.FACTOR_ICBPER;
      cantidaBolsas = venta.cantidadBolsa;
    } else {
      icb = 0;
    }

    const totalaPagar = venta.totalPagarVenta - icb;
    // const totalaPagar = venta.montoNeto - icbr;
    const MontoBase = totalaPagar / 1.18;
    const igv = totalaPagar - MontoBase;
    const montoOperGravadas = MontoBase;

    let ventaFormateada: ComprobanteInterface;

    ventaFormateada =  {
      ublVersion: '2.1',
      tipoOperacion: '0101', /** Venta interna */
      tipoDoc: this.obtenerCodigoComprobante(venta.tipoComprobante ?? ''),  /** Factura:01, Boleta:03 */
      serie: venta.serieComprobante,
      correlativo: venta.numeroComprobante,
      fechaEmision: formatearDateTime('YYYY-MM-DDTHH:mm:ss-05:00', venta.fechaEmision ?? ''),
      tipoMoneda: 'PEN',
      client: this.formatearCliente(venta.cliente ?? {}),
      company: this.formatearEmpresa(this.datosEmpresa, this.sedeDireccion),
      mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
      mtoIGV: redondeoDecimal(igv, 2),
      // icbper: redondeoDecimal(icb, 2),
      // totalImpuestos: redondeoDecimal(igv + icb, 2),
      valorVenta: redondeoDecimal(montoOperGravadas, 2),
      mtoImpVenta: redondeoDecimal(venta.totalPagarVenta, 2),
      subTotal: redondeoDecimal(venta.totalPagarVenta, 2),
      formaPago: this.formatearFormaDePago(),
      details: productFormat,
      legends: [
        {
          code: '1000',
          value: MontoALetras(venta.totalPagarVenta)
        }
      ],
    };

    if ( icb > 0 ){
      const detailBolsa = this.obtenerDetalleBolsaGratuita(cantidaBolsas);
      // ventaFormateada.details.push(detailBolsa);
      const newDetail = [...productFormat, detailBolsa];
      ventaFormateada.details = newDetail;

      ventaFormateada.icbper = redondeoDecimal(icb, 2);
      ventaFormateada.mtoOperGratuitas = detailBolsa.mtoBaseIgv;
      ventaFormateada.mtoIGVGratuitas = detailBolsa.igv;
      ventaFormateada.totalImpuestos = redondeoDecimal(igv + icb, 2);

    } else {
      ventaFormateada.totalImpuestos = redondeoDecimal(igv, 2);
    }


    return ventaFormateada;
  }

  obtenerDetalleBolsaGratuita(cantidaBolsas: number): SaleDetailInterface{
    const costoBolsa = 0.05;
    const montoBase = costoBolsa * cantidaBolsas;
    const igvTotal = montoBase * 0.18;

    const detailBolsa = {
      // codProducto: 'P002',
      unidad: 'NIU',
      descripcion: 'BOLSA DE PLASTICO',
      cantidad: cantidaBolsas,
      mtoValorUnitario: 0,
      mtoValorGratuito: costoBolsa,
      mtoValorVenta: redondeoDecimal(montoBase, 2),
      mtoBaseIgv: redondeoDecimal(montoBase, 2),
      porcentajeIgv: 18,
      igv: redondeoDecimal(igvTotal, 2),
      // ! tipAfeIGV number or not number
      tipAfeIgv: '13', /** catalog: 07, Codigo afectacion gratuito */
      factorIcbper: this.FACTOR_ICBPER, /** Factor ICBPER Anio actual, */
      icbper: redondeoDecimal(this.FACTOR_ICBPER * cantidaBolsas, 2), /** (cantidad)*(factor ICBPER), */
      totalImpuestos: redondeoDecimal(this.FACTOR_ICBPER * cantidaBolsas + igvTotal, 2), /** icbper+igv */
   };

    return detailBolsa;
  }

  formatearDetalles(itemsDeVenta: ItemDeVentaInterface[]): SaleDetailInterface[]{
    const listaFormateda: SaleDetailInterface[] = [];

    for (const itemDeVenta of itemsDeVenta) {
      listaFormateda.push(this.formatearDetalleVenta(itemDeVenta));
    }
    return listaFormateda;
  }

  formatearDetalleVenta(itemDeVenta: ItemDeVentaInterface): SaleDetailInterface{
    if (!itemDeVenta.cantidad || !itemDeVenta.producto?.precio){
      throw String('ITEM DE VENTA INCONSISTENTE, CANTIDA O PU_VENTA NO DEFINIDO');
    }
    const cantidadItems = itemDeVenta.cantidad;
    const precioUnit = itemDeVenta.producto.precio; /** montoBase + IGV */

    const precioUnitarioBase = precioUnit / 1.18;
    const igvUnitario = precioUnit - precioUnitarioBase;

    const montoBase = cantidadItems * precioUnitarioBase;
    const igvTotal = cantidadItems * igvUnitario;

    return {
      // codProducto : 'P001',
      unidad: this.ObtenerCodigoMedida(itemDeVenta.producto.medida ?? ''),
      descripcion: itemDeVenta.producto.nombre ?? '',
      cantidad: itemDeVenta.cantidad,
      mtoBaseIgv: redondeoDecimal(montoBase, 2),
      porcentajeIgv: 18,
      igv: redondeoDecimal(igvTotal, 2),
      tipAfeIgv: '10', // OperacionOnerosa: 10
      totalImpuestos: redondeoDecimal(igvTotal, 2), // suma de todos los impuestos que hubiesen
      mtoValorVenta: redondeoDecimal(montoBase, 2),
      mtoValorUnitario: redondeoDecimal(precioUnitarioBase, 2),
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
      // return 'TYPO COMPROBANTE INVALID';
      throw String('TYPO COMPROBANTE INVALID');
    }
  }

  formatearCliente(cliente: ClienteInterface): ClientInterface{
    if (!cliente.numDoc){
      throw String('NO EXISTE EL NUMERO DE DOCUMENTO DEL CLIENTE');
    }
    return {
      tipoDoc: this.ObtenerCodigoTipoDoc(cliente.tipoDoc ?? ''),
      numDoc: cliente.numDoc,
      rznSocial: cliente.nombre ?? '',
      address: {
        direccion: cliente.direccion ?? ''
      },
      email: cliente.email ?? '',
      telephone: cliente.celular ?? ''
    };
  }

  ObtenerCodigoTipoDoc(typoDoc: string){
    if (typoDoc === 'dni'){
      return '1';
    } else if (typoDoc === 'ruc') {
      return '6';
    } else{
      throw String('TYPO DE DOCUMENTO DEL CLIENTE INVALIDO');
    }
  }

  formatearEmpresa(empresa: DatosEmpresaInterface, direccion: AddressInterface): CompanyInterface{
    if (!empresa.ruc){
      throw String('NO EXISTE RUC DE LA EMPRESA');
    }
    return {
      ruc: empresa.ruc,
      nombreComercial: empresa.nombreComercial ?? '',
      razonSocial: empresa.razon_social ?? '',
      address: direccion,
      email: empresa.email ?? '',
      telephone: empresa.telefono ?? ''
    };
  }

  formatearFormaDePago(){
    return {
      moneda: 'PEN',
      tipo: 'Contado'
    };
  }


/* ---------------------------------------------------------------------------------------------- */
/*                           enviar nota de credito                                               */
/* ---------------------------------------------------------------------------------------------- */
  // REFACTOR - NOTA DE CREDITO
  async enviarNotaDeCreditoAdaptador(venta: VentaInterface){
    if (venta.cdrAnulado && venta.cdrAnulado?.cdr?.sunatResponse?.success === true){
      throw String(`Ya se ha emitido la Nota de Credito para el comprobante: ${venta.serieComprobante}-${venta.numeroComprobante}`);
    }

    if (venta.cdr && venta.cdr?.sunatResponse?.success === true){
      if ( !venta.idVenta || !venta.idListaProductos){
        throw String('Venta sin ID o IDlistaProductos');
      }

      let productos: any;
      productos = await this.obtenerProductosDeVenta(venta.idListaProductos).catch(err => err);

      if (productos === 'fail'){
        throw String('Error de Conexion a Intenet, no se encontro lista de productos');
      }

      // console.log('PRODUCTOS_DE_VENTA: ', productos);

      if (!productos.length){
        throw String(`no se encontro productos por idListaProductos: ${venta.idListaProductos}`);
      }
      venta.listaItemsDeVenta = productos;

      let DatosSerie: {serie: string, correlacion: number};
      let IdSerie = '';

      /** si mi comprobante ya tiene serie NO obtener serie */
      if (venta.cdrAnulado?.serie && venta.cdrAnulado?.correlacion) {
        DatosSerie = {
          serie: venta.cdrAnulado.serie,
          correlacion: venta.cdrAnulado.correlacion
        };
      } else {

        const typoComprobante = `n.credito.${venta.tipoComprobante}`;
        const serie = await this.obtenerSerie(typoComprobante).catch(err => err);

        if ( serie === 'fail'){
          throw String('No se pudo obtener la serie para Nota de Credito');
        }

        IdSerie =  serie.id;
        DatosSerie = {
          serie: serie.serie,
          correlacion: serie.correlacion + 1
        };
      }


      // console.log('se usará la correlacion: ', DatosSerie.correlacion);

      // const notaCreditoFormateado = this.formatearNotaDeCredito(venta, DatosSerie);
      const notaCreditoFormateado = this.intentarFormatearNotaDeCredito(venta, DatosSerie);
      // notaCreditoFormateado.formaPago = this.formatearFormaDePago();

      console.log('%cENVIAR NOTA DE CREDITO FORMATEADO A SUNAT:', 'color:white; background-color:purple;padding:20px');
      console.log('NOTA DE CREDITO FORMATEADO', notaCreditoFormateado);
      const fechaEmisionNotaCredito = notaCreditoFormateado.fechaEmision ?? '';

      const cdrRespuesta = await this.enviarNotaCreditoASunat(notaCreditoFormateado).catch(err => 'fail');


      if (cdrRespuesta === 'fail'){
        throw String('COMPROBANTE NO ENVIADO A SUNAT');
      }

      console.log('CDR NOTA DE CREDITO', cdrRespuesta);


      /** ANALISIS DE CDR */
      const cdrStatusForResponse: {success?: boolean, observaciones?: any, typoObs?: string} = {};
      cdrStatusForResponse.success = cdrRespuesta.sunatResponse.success ?? false;

      if (cdrRespuesta.sunatResponse.error){
        cdrStatusForResponse.observaciones = cdrRespuesta.sunatResponse.error;
        cdrStatusForResponse.typoObs = 'error';
      } else {
        cdrStatusForResponse.observaciones = cdrRespuesta.sunatResponse.cdrResponse.notes ?? [];
        cdrStatusForResponse.typoObs = 'notes';
      }

      if (
        !cdrStatusForResponse.success ||
        Object.entries(cdrStatusForResponse.observaciones).length ||
        cdrStatusForResponse.observaciones.length
      ){
        console.log('%cOBSERVACIONES:', 'color:white; background-color:red;padding:20px');
        console.log(cdrStatusForResponse.observaciones);
      }

      let respIncremtarCorrelacion = true;
      let guardarCDRAnulado = true;

      if (IdSerie){
        await(
          this.incrementarCorrelacionNotaCredito(IdSerie, DatosSerie).catch(() => {
            respIncremtarCorrelacion = false;
          }),
          this.guardarCDRAnulado(venta.idVenta, venta.fechaEmision, cdrRespuesta, fechaEmisionNotaCredito, DatosSerie).catch(() => {
            guardarCDRAnulado = false;
          })
        );
        if (!respIncremtarCorrelacion){
          throw String('NO INCREMENTO LA CORRELACION');
        }
      } else {
        await this.guardarCDRAnulado(venta.idVenta, venta.fechaEmision, cdrRespuesta, fechaEmisionNotaCredito, DatosSerie).catch(() => {
          guardarCDRAnulado = false;
        });
      }

      if (!guardarCDRAnulado){
        throw String('NO SE GUARDO EL CDR');
      }

      return cdrStatusForResponse;
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

  async guardarCDRAnulado(
    idVenta: string,
    fechaEmisionVenta: any,
    cdrRespuesta: CDRInterface,
    fechaEmisionNotaCredito: string,
    DatosSerie?: {serie: string, correlacion: number}
  ){
    let seGuardoCdr: string;
    for (let i = 0; i < 3; i++) {
      seGuardoCdr = await this.dataApi.guardarCDRAnulado(
        idVenta, fechaEmisionVenta, this.sede, cdrRespuesta, fechaEmisionNotaCredito, DatosSerie)
      .catch(() => 'fail');

      if ( seGuardoCdr === 'exito'){
        // console.log('SE GUARDO EN EL INTENTO cdrAnulado: ', i);
        return 'exito';
      }
    }

    throw String('fail');
  }


  async obtenerSerie(typoDocumento: string){
    const valor = await  this.dataApi.obtenerCorrelacionPorTypoComprobante(typoDocumento, this.sede)
    .then(serie => serie).catch(() => 'fail');
    console.log(valor);

    if (valor === 'fail') {
      throw String('fail');
    }

    if (Object.entries(valor).length === 0) {
      throw String('NO SE ENCONTRO SERIE EN BASEDATOS');
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
      .catch(error => {
        throw error;
      });
  }

  intentarFormatearNotaDeCredito(venta: VentaInterface, serieNotaCred: {serie: string, correlacion: number}): ComprobanteInterface{
    try {
      const ventaFormateada = this.formatearNotaDeCredito(venta, serieNotaCred);
      if (ventaFormateada.fechaEmision === 'INVALID_DATA_TIME'){
        throw String('FECHA DE EMESION INVALIDO');
      }
      return ventaFormateada;
    } catch (error) {
      throw error;
    }
  }

  formatearNotaDeCredito(venta: VentaInterface, serieNotaCred: {serie: string, correlacion: number}): NotaDeCreditoInterface{

    if (!venta.listaItemsDeVenta){
      throw String('VENTA INCONSISTE, NO EXISTE ITEMS DE VENTA');
    }
    if (!venta.totalPagarVenta){
      throw String('VENTA INCONSISTENTE, TOTAL PAGAR VENTA NO DEFINIDO');
    }
    if (!venta.serieComprobante || !venta.numeroComprobante){
      throw String('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');
    }

    const productFormat = this.formatearDetalles(venta.listaItemsDeVenta);


    let icb: number;
    let cantidadBolsas = 0;
    if (venta.cantidadBolsa && venta.cantidadBolsa > 0){
      icb = venta.cantidadBolsa * this.FACTOR_ICBPER;
      cantidadBolsas = venta.cantidadBolsa;
    } else {
      icb = 0;
    }

    const totalaPagar = venta.totalPagarVenta - icb;
    const MontoBase = totalaPagar / 1.18;
    const igv = totalaPagar - MontoBase;
    const montoOperGravadas = MontoBase;

    let notaCreditoFormateada: NotaDeCreditoInterface;
    notaCreditoFormateada = {
      ublVersion: '2.1',
      tipoDoc: '07', /** 07 nota de crédito, nota de debito 08 */
      serie: serieNotaCred.serie, /** la nota de credito, F si factura y B si boleta */
      correlativo: `${serieNotaCred.correlacion}`,
      fechaEmision: formatearDateTime('YYYY-MM-DDTHH:mm:ss-05:00'),
      tipDocAfectado: this.obtenerCodigoComprobante(venta.tipoComprobante ?? ''),
      numDocfectado: `${venta.serieComprobante}-${venta.numeroComprobante}`, /** numero - serie, 'F001-111' */
      codMotivo: '06', /** 06:Devolucion total, 01: Anulacion de la operacion */
      desMotivo: 'DEVOLUCION TOTAL',
      tipoMoneda: 'PEN',
      client: this.formatearCliente(venta.cliente ?? {}),
      company:  this.formatearEmpresa(this.datosEmpresa, this.sedeDireccion),
      mtoOperGravadas: redondeoDecimal(montoOperGravadas, 2),
      mtoIGV: redondeoDecimal(igv, 2),
      // icbper: redondeoDecimal(icb, 2),
      totalImpuestos: redondeoDecimal(igv + icb, 2),
      // valorVenta: redondeoDecimal(montoOperGravadas, 2),
      mtoImpVenta: redondeoDecimal(venta.totalPagarVenta, 2),
      subTotal: redondeoDecimal(venta.totalPagarVenta, 2),
      // formaPago: this.formatearFormaDePago(), // al parecer no es necesario
      details: productFormat,
      legends: [
        {
          code: '1000',
          value: MontoALetras(venta.totalPagarVenta)
        }
      ]
    };

    if ( icb > 0 ){
      const detailBolsa = this.obtenerDetalleBolsaGratuita(cantidadBolsas);
      // notaCreditoFormateada.details.push(detailBolsa);
      const newDetail = [...productFormat, detailBolsa];
      notaCreditoFormateada.details = newDetail;

      notaCreditoFormateada.icbper = redondeoDecimal(icb, 2);
      notaCreditoFormateada.mtoOperGratuitas = detailBolsa.mtoBaseIgv;
      notaCreditoFormateada.totalImpuestos = redondeoDecimal(igv + icb, 2);

    } else {
      notaCreditoFormateada.totalImpuestos = redondeoDecimal(igv, 2);
    }

    return notaCreditoFormateada;

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
      // fecResumen: this.formtearFechaActual(),  // Dia que se gener el resumenDiario
      fecResumen: formatearDateTime('YYYY-MM-DDTHH:mm:ss-05:00'),  // Dia que se gener el resumenDiario
      correlativo: '001',
      moneda: 'PEN',
      company: this.formatearEmpresa(this.datosEmpresa, this.sedeDireccion),
      details: listaVentasFormateadas
    };
    console.log('ESTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTEEEEEEEEES rESUMEN diario Formateado', resumenDiarioFormateado);
  }

  formatearVentaResumenDiario(venta: VentaInterface){

    let icbr: number;
    if (venta.hasOwnProperty('cantidadBolsa')){
      icbr = venta.cantidadBolsa * this.FACTOR_ICBPER;
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

  ObtenerCodigoMedida(medida: string){
    if (!medida){
      return 'NIU';
    }
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

  /* -------------------------------------------------------------------------- */
  /*                             escript auxiliares                             */
  /* -------------------------------------------------------------------------- */
  formatearVentas(listaDeVentas: VentaInterface[]){
    for (const venta of listaDeVentas) {
      console.log('VENTA ORIGINAL', venta);
      const ventaFormateada: ComprobanteInterface = this.intentarFormatearVenta(venta);
      console.log('VENTA FORMATEADO', ventaFormateada);
    }
  }

  formatearNotasDeCretito(listaDeVentas: VentaInterface[]){
    for (const venta of listaDeVentas) {
      if (venta.estadoVenta === 'anulado'){
        console.log('VENTA ORIGINAL', venta);
        const ventaFormateada: ComprobanteInterface = this.intentarFormatearNotaDeCredito(venta, {serie: 'ALGO', correlacion: 504431});
        console.log('VENTA FORMATEADO', ventaFormateada);
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */

}

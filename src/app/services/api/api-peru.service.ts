import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { EmpresaInterface } from 'src/app/models/api-peru/empresa';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { ClientInterface, CompanyInterface, ComprobanteInterface, SaleDetailInterface } from 'src/app/models/comprobante/comprobante';
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

    // tslint:disable-next-line: no-inferrable-types
    // let token: string = '';
    return fetch('https://facturacion.apisperu.com/api/v1/auth/login', requestOptions)
      .then(response => response.json())
      .then(result => result.token)
      .catch(error => console.log('error', error));
  }

  async listarEmprasas(){

    const myHeaders = new Headers();
    const userToken = await this.login();
    console.log('Bearerrrrrrrrrrrrrrrrrrrrr ', 'Bearer '.concat(userToken));
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
      //.then(result => result)
      .catch(error => console.log('error', error));
  }

  async obtenerEmpresaByRUC(rucEnter: string){
    const listaDeEmpresas = await this.listarEmprasas();
    console.log('lista de empresas', listaDeEmpresas);

    for (const empresa of listaDeEmpresas) {
      console.log('sssssssssssssssssssssss', empresa);
      console.log(empresa.ruc);
      if (empresa.ruc === rucEnter){
        console.log('ruccccccccccccccccccccccccccccc', rucEnter, empresa);
        return empresa;
      }
    }
    console.log('ruc failllllllllllllllllllllllllllllll');
    return '';
  }

  async obtenerTokenDeEmpresa(rucEnter: string){
    const empresa = await this.obtenerEmpresaByRUC(rucEnter);
    console.log(empresa.token.code);
    return empresa.token.code;
  }

 async guardarDatosEmpresaFirebase(rucEnter: string){
  const empresa = await this.obtenerEmpresaByRUC(rucEnter);
  this.dataApi.guardarDatosEmpresa(empresa);
 }


  obtenerDatosDeLaEmpresa(){
    this.dataApi.obtenerEmpresa().subscribe(data => {
      console.log('esto debería imprimirse primero');
      this.datosDeEmpresa = data[0];
    });
  }

  getDatosEmpresa(){
    return this.datosDeEmpresa;
  }



  formatearCliente(cliente: ClienteInterface): ClientInterface{
    // como todos los documentos son DNI, segun
    // TODO - mejorar el cliente interface
    // TODO - agregar una funcion para obtener el codigo de tipo de documento segun sunat
    // TODO - Adaptar al nueva ClienteInterface
    return {
      tipoDoc: '1', // el catalogo N6, DNI = 1
      numDoc: cliente.numDoc,
      rznSocial: cliente.nombre,

      //rznSocial: cliente.nombre + ' ' + cliente.apellidos,
      address: {
        direccion: cliente.direccion
      },
      email: cliente.email,
      telephone: cliente.celular
    };
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

  formatearDetallesVenta(itemDeVenta: ItemDeVentaInterface): SaleDetailInterface{
    const cantidadItems = itemDeVenta.cantidad;
    const precioUnitario = itemDeVenta.producto.precio;
    const igvUnitario = precioUnitario * 18 / 100;
    const montoBase = cantidadItems * precioUnitario;
    const igvTotal = montoBase * 18 / 100;
    const montoBaseIgv = montoBase + igvTotal;

    return {
        codProducto: 'P001',
        unidad: 'NIU',
        descripcion: itemDeVenta.producto.nombre,
        cantidad: itemDeVenta.cantidad,
        mtoValorUnitario: precioUnitario,
        mtoValorVenta: montoBase,
        mtoBaseIgv: montoBaseIgv,
        porcentajeIgv: 18,
        igv: igvTotal,
        tipAfeIgv: '10',
        totalImpuestos: igvTotal, // suma de todos los impues que hubiesen
        mtoPrecioUnitario: precioUnitario + igvUnitario
      };
  }

  listaDeProductosDeVenta: ItemDeVentaInterface[] = [];

  formatearDetalles(venta: VentaInterface): SaleDetailInterface[]{
    const listaFormateda: SaleDetailInterface[] = [];
    this.obtenerItemsDeVenta(venta.idVenta, this.sede);
    for (const itemDeVenta of this.listaDeProductosDeVenta) {
      listaFormateda.push(this.formatearDetallesVenta(itemDeVenta));
    }
    console.log(listaFormateda);
    return listaFormateda;
  }


  obtenerItemsDeVenta(ventaId: string, sede: string){
    this.dataApi.obtenerProductosDeVenta(ventaId, sede).subscribe( (data:any) => {
      if (!isNullOrUndefined(data)){
        this.listaDeProductosDeVenta = data.productos;
      console.log('datosd', data.productos);
      }
    });
  }

  detallesProductos(id: string) {
    let productFormat: SaleDetailInterface[];
    const listaFormateda: SaleDetailInterface[] = [];

    const promesa = new Promise((resolve, reject) => {
      this.dataApi.obtenerProductosDeVenta(id, this.sede).subscribe( (data:any) => {
        console.log('dataaa:', data);
        if (!isNullOrUndefined(data)){
          this.listaDeProductosDeVenta = data.productos;
          for (const itemDeVenta of this.listaDeProductosDeVenta) {
            listaFormateda.push(this.formatearDetallesVenta(itemDeVenta));
          }
          productFormat = listaFormateda;
          console.log(productFormat);

          console.log('datosd', data.productos);
        }
        resolve(productFormat);
      });
    });
    return promesa;
  }

  formatearVenta(venta: VentaInterface){
    // const productFormat: SaleDetailInterface[] = this.formatearDetalles(venta);
    let productFormat;

    const totalaPagar = venta.totalPagarVenta;
    const igv = totalaPagar * 18 / 100;
    const totalaPagarMasIgv = totalaPagar + igv;
    console.log('wwwwwwwwwwwwwwwwwwwwwwwwwww', venta.fechaEmision);
    console.log('wwwwwwwwwwwwwwwwwwwwwwwwwww', venta);
    const promesa = new Promise((resolve, reject) => {
      this.detallesProductos(venta.idListaProductos).then(data => {
        productFormat = data;
        const r = {
          tipoOperacion: '0101', // Venta interna
          tipoDoc: this.obtenerCodigoComprobante(venta.tipoComprobante),  // Factura:01, Boleta:03 //
          serie: venta.serieComprobante,
          correlativo: '1', // venta.numeroComprobante,
          fechaEmision: this.formtearFecha(venta.fechaEmision), // TODO, formaterar fecha a Data-time
          tipoMoneda: 'PEN',
          client: this.formatearCliente(venta.cliente),
          company: this.formatearEmpresa(this.datosDeEmpresa),
          mtoOperGravadas: totalaPagar,
          mtoIGV: igv,
          totalImpuestos: igv,
          valorVenta: totalaPagar,
          mtoImpVenta: totalaPagarMasIgv,
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

  formtearFecha(dateTime: any): string{
    // let dateTime = new Date();
    // const dateTime = new Date(dateTimeSend);
    const fechaFormateada = new Date(moment.unix(dateTime.seconds).format('D MMM YYYY H:mm'));
    const fechaString = formatDate(fechaFormateada, 'yyyy-dd-MMThh:mm:ss-05:00', 'en');

    console.log('aaaaaaaaaaaaa', fechaString);
    // let fechaFormateada = `${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDay()}T`;
    // fechaFormateada += `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}-05:00`;

    // console.log('hola Mariluz', fechaFormateada);

    // console.log(fechaFormateada);
    return fechaString;
  }

  obtenerCodigoComprobante(typoComprobante: string){

    if (typoComprobante.toLowerCase() === 'factura'){
      return '01';
    } else if (typoComprobante.toLowerCase() === 'boleta'){
      return '03';
    } else {
      console.log('Comprobante no valido');
    }
  }

  enviarComprobanteASunat(venta: VentaInterface){
    const myHeaders = new Headers();
    // TODO: en caso de que no exita el token ver si emprea tiene el token
    myHeaders.append('Authorization', 'Bearer '.concat(this.datosDeEmpresa.token.code));
    myHeaders.append('Content-Type', 'application/json');

    // const raw = JSON.stringify(
    //   this.formatearVenta(venta)
    // );
    let raw;
    this.formatearVenta(venta).then(data => {
      console.log(data);
      raw = JSON.stringify(data); console.log('rwwwwwwwwwwwwaw', this.formatearVenta(venta));
      console.log('VEAMOS', raw);

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
      };

      fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
        .then(response => response.json())
        .then(cdr => {

          console.log(cdr);
          // TODO: Guardar resultado en la base de datos
          console.log('Aqui debería guardaaaaaaaaaaaaaaaaa');
          this.dataApi.guardarCDR(venta, this.sede, cdr);
        } )
        .catch(error => console.log('errorrrrrrrrrrrrrrrrrrrrrrrrr'));
    });
  }

}

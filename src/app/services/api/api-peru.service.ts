import { Injectable } from '@angular/core';
import { EmpresaInterface } from 'src/app/models/api-peru/empresa';
import { ClienteInterface } from 'src/app/models/cliente-interface';
import { ClientInterface, CompanyInterface, ComprobanteInterface, SaleDetailInterface } from 'src/app/models/comprobante/comprobante';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { VentaInterface } from 'src/app/models/venta/venta';
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

    const raw = JSON.stringify({username: 'hz', password: '123456'});

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
      numDoc: cliente.dni,
      rznSocial: cliente.nombre + ' ' + cliente.apellidos,
      address: {
        direccion: cliente.direccion
      },
      email: cliente.direccion,
      telephone: cliente.telefono
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

  formatearDetalles(venta: VentaInterface): SaleDetailInterface[]{
    const listaFormateda: SaleDetailInterface[] = [];
    for (const itemDeVenta of venta.listaItemsDeVenta) {
      listaFormateda.push(this.formatearDetallesVenta(itemDeVenta));
    }
    console.log(listaFormateda);
    return listaFormateda;
  }

  formatearVenta(venta: VentaInterface): ComprobanteInterface{
    const totalaPagar = venta.total;
    const igv = totalaPagar * 18 / 100;
    const totalaPagarMasIgv = totalaPagar + igv;

    return {
      tipoOperacion: '0101', // Venta interna
      tipoDoc: this.obtenerCodigoComprobante(venta.tipoComprobante),  // Factura:01, Boleta:03 //
      serie: venta.serieComprobante,
      correlativo: venta.numeroComprobante,
      fechaEmision: this.formtearFecha(venta.fechaEmision), // TODO, formaterar fecha a Data-time
      tipoMoneda: 'PEN',
      client: this.formatearCliente(venta.cliente),
      company: this.formatearCliente(this.datosDeEmpresa),
      mtoOperGravadas: totalaPagar,
      mtoIGV: igv,
      totalImpuestos: igv,
      valorVenta: totalaPagar,
      mtoImpVenta: totalaPagarMasIgv,
      ublVersion: '2.1',
      details: this.formatearDetalles(venta),
      legends: [
        {
          code: '1000',
          value: 'SON CIENTO DIECIOCHO CON 00/100 SOLES'
        }
      ]
    };
  }

  formtearFecha(dateTime: Date): string{
    // let dateTime = new Date();

    let fechaFormateada = `${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDay()}T`;
    fechaFormateada += `${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}-05:00`;

    // console.log(fechaFormateada);
    return fechaFormateada;
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

    const raw = JSON.stringify(
      this.formatearVenta(venta)
    );

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
      .then(response => response.json())
      .then(cdr =>{

        console.log(cdr);
        // TODO: Guardar resultado en la base de datos
        this.dataApi.guardarCDR(venta, this.sede, cdr);
      } )
      .catch(error => console.log('error', error));
  }

}

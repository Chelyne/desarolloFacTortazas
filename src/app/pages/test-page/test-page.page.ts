import { Component, OnInit } from '@angular/core';
import { VentaInterface } from 'src/app/models/venta/venta';
import { ApiPeruService } from 'src/app/services/api/api-peru.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.page.html',
  styleUrls: ['./test-page.page.scss'],
})
export class TestPagePage implements OnInit {

  constructor(
    private apisPeru: ApiPeruService
  ) { }

  ngOnInit() {
  }

  async login(){
    const token = await this.apisPeru.login();
    console.log('tokennnnnnnnnnnnnnnnnnnnn', token);
  }

  async listarEmpresas(){
      await this.apisPeru.listarEmprasas().then(result => console.log(result));
  }

  async obtenerEmpresaPorRuc(){
    const empresa = await this.apisPeru.obtenerEmpresaByRUC('20601831032');
    console.log(empresa);
  }

  async obtenerTokenDeEmpresa(){
    const tokenEmprersa = await this.apisPeru.obtenerTokenDeEmpresa('20601831032');
    console.log('tokenEmprersaaaaaaaaaaa', tokenEmprersa);
  }

  async guardarDatosDeEmpresa(){
  //  const empresa = await this.apisPeru.getAndSaveEmpresaOnfirebase('20601831032');
   await this.apisPeru.getAndSaveEmpresaOnfirebase();

  }

  async obtenerDatosDeEmpresa(){
    await this.apisPeru.obtenerDatosDeLaEmpresa();
  }

  async enviarASunat(){
    // await this.apisPeru.enviarComprobanteASunat({});
    const dote: any = {
      tipoOperacion: '0101',
      tipoDoc: '03',
      serie: 'B002',
      correlativo: '1',
      fechaEmision: '2021-02-01T02:13:00-05:00',
      tipoMoneda: 'PEN',
      client: {
        tipoDoc: '1',
        numDoc: '72244070',
        rznSocial: 'adrian llalli perez',
        address: {
          direccion: 'Jr. los Sauces 167'
        },
        email: 'adrian@gmail.com',
        telephone: '916056564'
      },
      company: {
        ruc: '20601831032',
        razonSocial: 'CLÍNICA VETERINARIA TOOBY E.I.R.L',
        address: {
          direccion: 'AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'
        }
      },
      mtoOperGravadas: 0.2,
      mtoIGV: 0.036000000000000004,
      totalImpuestos: 0.036000000000000004,
      valorVenta: 0.2,
      mtoImpVenta: 0.23600000000000002,
      ublVersion: '2.1',
      details: [
        {
          codProducto: 'P001',
          unidad: 'NIU',
          descripcion: 'impuesto bolsa plastica',
          cantidad: 1,
          mtoValorUnitario: 0.2,
          mtoValorVenta: 0.2,
          mtoBaseIgv: 0.23600000000000002,
          porcentajeIgv: 18,
          igv: 0.036000000000000004,
          tipAfeIgv: '10',
          totalImpuestos: 0.036000000000000004,
          mtoPrecioUnitario: 0.23600000000000002
        }
      ],
      legends: [
        {
          code: '1000',
          value: 'SON CIENTO DIECIOCHO CON 00/100 SOLES'
        }
      ]
    };
    // await this.apisPeru.enviarComprobanteToSunat(dote);

    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDk2MTUzMDAsInVzZXJuYW1lIjoiZnJpZW5kc2NvZGUiLCJjb21wYW55IjoiMjA2MDE4MzEwMzIiLCJleHAiOjQ3NjMyMTUzMDB9.JIikuy-l6I74EB5-DNMlFjdqtIhIwR4CDDc10LLuiUuwt3AdxSbpQlgZbIHsGA7cMFAGkhP0trdZVFp40Z35Ayr9fL-JA4NX6Scd6VdnlIBkf2FT32irpGwkY71bEUnjDxGARWGtFnZwhK3MMLWAdjemGrTP25AqtGK8IjkiFZSKQ90toFxpd1Ije6zigRxrkFl0vS6WsFWwHXG-vmCyBqw_i_qE8MVT1zVemas1RZxaDH3UIhCB7mXxZqEUO8QqcmUB8L9OY6tCFOYm_whDjOdkz4GrxdfWMoAQHwDhEhI85k4fwrdynbGyonH1Invcv5xejz0u99geEJmTns9TdqV0dDjhvE4Prqtb53PwRSpJ6Bpo9lIq_YFoMcJk9duXqS2iVNgFDEc3oa35OeM75x0xfrv5i7uIr_JajjQ1-LLz36hJpc1lt9dwAEPrtGoEoSwImGByBZA7yU19cw_3r429-bHMAjnvdF9tPBPJCfVFfW0SYsLfR_UVXoZNzWk1gYDLUvvQw5PtLh6GVGtphy4sSTElZ1-fZ1Q2lmf8Jh8XSdeE4qDfXhW9YHIBUwn99K_9H80Hd8mi2rqJzig4ftudNZtAU0YqLHq6WohTXWNwf9Fob7b66vlwXHawQ6HGoN046kAebuWKBQeYwJFYzfQJOznEtkw5aiJ2wo9hcaU');
    myHeaders.append('Content-Type', 'application/json');
    // tslint:disable-next-line:max-line-length
    const data = {tipoOperacion: '0101', tipoDoc: '03', serie: 'B002', correlativo: '1', fechaEmision: '2021-02-01T02:13:00-05:00', tipoMoneda: 'PEN', client: {tipoDoc: '1', numDoc: '72244070', rznSocial: 'adrian llalli perez', address: {direccion: 'Jr. los Sauces 167'}, email: 'adrian@gmail.com', telephone: '916056564'}, company: {ruc: '20601831032', razonSocial: 'CLÍNICA VETERINARIA TOOBY E.I.R.L', address: {direccion: 'AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'}}, mtoOperGravadas: 0.2, mtoIGV: 0.036000000000000004, totalImpuestos: 0.036000000000000004, valorVenta: 0.2, mtoImpVenta: 0.23600000000000002, ublVersion: '2.1', details: [{codProducto: 'P001', unidad: 'NIU', descripcion: 'impuesto bolsa plastica', cantidad: 1, mtoValorUnitario: 0.2, mtoValorVenta: 0.2, mtoBaseIgv: 0.23600000000000002, porcentajeIgv: 18, igv: 0.036000000000000004, tipAfeIgv: '10', totalImpuestos: 0.036000000000000004, mtoPrecioUnitario: 0.23600000000000002}], legends: [{code: '1000', value: 'SON CIENTO DIECIOCHO CON 00/100 SOLES'}]};
    const raw = JSON.stringify(data);
    console.log('__________________________________________');
    console.log(data);
    console.log(dote);
    console.log('__________________________________________');
    console.log(raw);
    console.log(JSON.stringify(dote));
    console.log('__________________________________________');


    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(dote),
      redirect: 'follow'
    };

    console.log(requestOptions);


    fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }

  enviarComprobanteAsuant2(){
    const dote: any = {
      tipoOperacion: '0101',
      tipoDoc: '03',
      serie: 'B002',
      correlativo: '1',
      fechaEmision: '2021-02-01T02:13:00-05:00',
      tipoMoneda: 'PEN',
      client: {
        tipoDoc: '1',
        numDoc: '72244070',
        rznSocial: 'adrian llalli perez',
        address: {
          direccion: 'Jr. los Sauces 167'
        },
        email: 'adrian@gmail.com',
        telephone: '916056564'
      },
      company: {
        ruc: '20601831032',
        razonSocial: 'CLÍNICA VETERINARIA TOOBY E.I.R.L',
        address: {
          direccion: 'AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'
        }
      },
      mtoOperGravadas: 0.2,
      mtoIGV: 0.036000000000000004,
      totalImpuestos: 0.036000000000000004,
      valorVenta: 0.2,
      mtoImpVenta: 0.23600000000000002,
      ublVersion: '2.1',
      details: [
        {
          codProducto: 'P001',
          unidad: 'NIU',
          descripcion: 'impuesto bolsa plastica',
          cantidad: 1,
          mtoValorUnitario: 0.2,
          mtoValorVenta: 0.2,
          mtoBaseIgv: 0.23600000000000002,
          porcentajeIgv: 18,
          igv: 0.036000000000000004,
          tipAfeIgv: '10',
          totalImpuestos: 0.036000000000000004,
          mtoPrecioUnitario: 0.23600000000000002
        }
      ],
      legends: [
        {
          code: '1000',
          value: 'SON CIENTO DIECIOCHO CON 00/100 SOLES'
        }
      ]
    };
    // this.apisPeru.enviarComprobanteToSunat(dote);
  }

  listarProductos() {
    const venta: VentaInterface = {
      numeroComprobante: '12',
      bolsa: false,
      idListaProductos: 'h1DpNvvWlBFmiev5SkD2',
      tipoComprobante: 'n. venta',
      fechaEmision: {
        seconds: 1610318081,
        nanoseconds: 855000000
      },
      tipoPago: 'efectivo',
      vendedor: {
        celular: '910426974',
        nombre: 'nerio',
        token: 'token laptop',
        apellidos: 'cañari huarcaya',
        rol: 'Administrador',
        sede: 'Andahuaylas',
        foto: null,
        password: 'nerio123',
        id: 'nerio@gmail.com',
        correo: 'nerio@gmail.com',
        dni: '70148737'
      },
      totalPagarVenta: 46,
      cliente: {
        email: 'cliente@gmail.com',
        nombre: 'cliente varios',
        tipoDoc: 'dni',
        direccion: 'jr. prueba',
        celular: '999999999',
        numDoc: '00000000',
        id: '5FwjPZ7ClHegWoQqOQzN'
      },
      serieComprobante: 'NV01',
      idVenta: 'cwNG3OcbTLtwEn2C36EO'
    };
    this.apisPeru.enviarASunatAdaptador(venta);
  }

  enviarNotaCredito(){
    console.log('Enviar nota de credito');

    const venta: VentaInterface = {
      montoPagado: 129,
      serieComprobante: 'B001',
      numeroComprobante: '224',
      vendedor: {
        token: 'token laptop',
        celular: '910426974',
        rol: 'Administrador',
        sede: 'Andahuaylas',
        foto: null,
        correo: 'nerio@gmail.com',
        apellidos: 'Cañari Huarcaya',
        password: 'nerio123',
        nombre: 'Nerio',
        dni: '70148737',
        id: 'nerio@gmail.com'
      },
      tipoComprobante: 'boleta',
      bolsa: false,
      cantidadBolsa: 0,
      cliente: {
        numDoc: '73517374',
        direccion: '',
        tipoDoc: 'dni',
        email: '',
        celular: '944217218',
        id: '2GNsnalhwmIpOvv6vDIo',
        nombre: 'wilmer arcaya layme'
      },
      idListaProductos: 'J5DP4B3L1W0HfjdJ27Gl',
      estadoVenta: 'registrado',
      montoNeto: 129,
      igv: 19.677966101694906,
      tipoPago: 'efectivo',
      descuentoVenta: 0,
      fechaEmision: {
        seconds: 1611439573,
        nanoseconds: 723000000
      },
      montoBase: 109.3220338983051,
      totalPagarVenta: 129,
      cdr: {
        sunatResponse: {
          success: true
        }
      },
      // cdrAnulado: {
      //     sunatResponse: {
      //       success: true
      //     }
      // },
      idVenta: 'JJa3WunEjd8oVErlYCC6'
    };

    this.apisPeru.enviarNotaDeCreditoAdaptador(venta);

  }

  enviarNotaCreditoFactura(){
    console.log('Enviar nota de credito');

    const venta: VentaInterface = {
      cantidadBolsa: 0,
      tipoComprobante: 'factura',
      cliente: {
        celular: '',
        nombre: 'taipe huamani erick ruli',
        direccion: 'Av. Santa Cruz Curibamba- Andahuaylas',
        email: '',
        numDoc: '10741636005',
        tipoDoc: 'ruc',
        id: 'lq4VYau4IiWsfd2f04IE'
      },
      fechaEmision: {
        seconds: 1611014124,
        nanoseconds: 216000000
      },
      bolsa: false,
      igv: 38.59322033898303,
      montoPagado: 300,
      estadoVenta: 'registrado',
      totalPagarVenta: 253,
      idListaProductos: '8EMFNz3oI7t3Txjyr8EY',
      descuentoVenta: 0,
      montoNeto: 253,
      montoBase: 214.40677966101697,
      serieComprobante: 'F001',
      tipoPago: 'efectivo',
      cdr: {
        sunatResponse: {
          success: true
        }
      },
      vendedor: {
        nombre: 'Nerio',
        rol: 'Administrador',
        apellidos: 'Cañari Huarcaya',
        password: 'nerio123',
        sede: 'Andahuaylas',
        token: 'token laptop',
        dni: '70148737',
        foto: null,
        correo: 'nerio@gmail.com',
        celular: '910426974',
        id: 'nerio@gmail.com'
      },
      numeroComprobante: '3',
      idVenta: 'woWbBVAm4GI7pzNljQdF'
    };

    this.apisPeru.enviarNotaDeCreditoAdaptador(venta);

  }

  newSendSunat(){
    // const venta: VentaInterface = {
    //   cantidadBolsa: 0,
    //   montoBase: 84.74576271186442,
    //   fechaEmision: {
    //     seconds: 1611254602,
    //     nanoseconds: 40000000
    //   },
    //   totalPagarVenta: 100,
    //   tipoComprobante: 'boleta',
    //   estadoVenta: 'anulado',
    //   montoNeto: 100,
    //   cliente: {
    //     id: '5FwjPZ7ClHegWoQqOQzN',
    //     celular: '999999999',
    //     tipoDoc: 'dni',
    //     nombre: 'cliente varios',
    //     email: 'cliente@gmail.com',
    //     numDoc: '00000000',
    //     direccion: 'jr. prueba'
    //   },
    //   tipoPago: 'efectivo',
    //   montoPagado: 100,
    //   idListaProductos: 'lkwl4BjQA8sntUdbhsB6',
    //   vendedor: {
    //     token: 'token laptop',
    //     password: 'nerio123',
    //     nombre: 'Nerio',
    //     foto: null,
    //     correo: 'nerio@gmail.com',
    //     dni: '70148737',
    //     apellidos: 'Cañari Huarcaya',
    //     celular: '910426974',
    //     rol: 'Administrador',
    //     sede: 'Andahuaylas',
    //     id: 'nerio@gmail.com'
    //   },
    //   igv: 15.254237288135585,
    //   descuentoVenta: 0,
    //   serieComprobante: 'B001',
    //   numeroComprobante: '205',
    //   bolsa: false,
    //   cdr: {
    //     sunatResponse: {
    //       success: true,
    //     }
    //   },
    //   idVenta: 'JDjjk7ZkRXKwtljSUtcz'
    // };

    const venta: VentaInterface = {
      tipoPago: 'efectivo',
      cliente: {
        direccion: 'jr. prueba',
        celular: '999999999',
        email: 'cliente@gmail.com',
        numDoc: '00000000',
        tipoDoc: 'dni',
        nombre: 'cliente varios',
        id: '5FwjPZ7ClHegWoQqOQzN'
      },
      descuentoVenta: 0,
      totalPagarVenta: 85,
      montoPagado: 85,
      tipoComprobante: 'boleta',
      igv: 12.966101694915253,
      montoBase: 72.03389830508475,
      vendedor: {
        celular: '910426974',
        correo: 'nerio@gmail.com',
        token: 'token laptop',
        password: 'nerio123',
        rol: 'Administrador',
        foto: null,
        sede: 'Andahuaylas',
        id: 'nerio@gmail.com',
        apellidos: 'Cañari Huarcaya',
        dni: '70148737',
        nombre: 'Nerio'
      },
      cantidadBolsa: 0,
      serieComprobante: 'B001',
      estadoVenta: 'anulado',
      cdr: {
        sunatResponse: {
          success: true
        }
      },
      numeroComprobante: '241',
      bolsa: false,
      fechaEmision: {
        seconds: 1611343970,
        nanoseconds: 66000000
      },
      idListaProductos: 'cU5otZjGwR7S8rHuCKRP',
      montoNeto: 85,
      idVenta: 'dwVJBZVkrSZqeEvSjeuQ'
    };

    // this.apisPeru.enviarNotaDeCreditoAdaptador(venta);
  }

}

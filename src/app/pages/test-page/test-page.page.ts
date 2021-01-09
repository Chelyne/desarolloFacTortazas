import { Component, OnInit } from '@angular/core';
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
    await this.apisPeru.obtenerEmpresaByRUC('20601831032');
  }

  async obtenerTokenDeEmpresa(){
    const tokenEmprersa = await this.apisPeru.obtenerTokenDeEmpresa('20601831032');
    console.log('tokenEmprersaaaaaaaaaaa', tokenEmprersa);
  }

  async guardarDatosDeEmpresa(){
    await this.apisPeru.guardarDatosEmpresaFirebase('20601831032');
  }

  async obtenerDatosDeEmpresa(){
    await this.apisPeru.obtenerDatosDeLaEmpresa();
  }

  async enviarASunat(){
    // await this.apisPeru.enviarComprobanteASunat({});
    const dote: any = {
      "tipoOperacion": "0101",
      "tipoDoc": "03",
      "serie": "B002",
      "correlativo": "1",
      "fechaEmision": "2021-02-01T02:13:00-05:00",
      "tipoMoneda": "PEN",
      "client": {
        "tipoDoc": "1",
        "numDoc": "72244070",
        "rznSocial": "adrian llalli perez",
        "address": {
          "direccion": "Jr. los Sauces 167"
        },
        "email": "adrian@gmail.com",
        "telephone": "916056564"
      },
      "company": {
        "ruc": "20601831032",
        "razonSocial": "CLÍNICA VETERINARIA TOOBY E.I.R.L",
        "address": {
          "direccion": "AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS"
        }
      },
      "mtoOperGravadas": 0.2,
      "mtoIGV": 0.036000000000000004,
      "totalImpuestos": 0.036000000000000004,
      "valorVenta": 0.2,
      "mtoImpVenta": 0.23600000000000002,
      "ublVersion": "2.1",
      "details": [
        {
          "codProducto": "P001",
          "unidad": "NIU",
          "descripcion": "impuesto bolsa plastica",
          "cantidad": 1,
          "mtoValorUnitario": 0.2,
          "mtoValorVenta": 0.2,
          "mtoBaseIgv": 0.23600000000000002,
          "porcentajeIgv": 18,
          "igv": 0.036000000000000004,
          "tipAfeIgv": "10",
          "totalImpuestos": 0.036000000000000004,
          "mtoPrecioUnitario": 0.23600000000000002
        }
      ],
      "legends": [
        {
          "code": "1000",
          "value": "SON CIENTO DIECIOCHO CON 00/100 SOLES"
        }
      ]
    };
    // await this.apisPeru.enviarComprobanteToSunat(dote);

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDk2MTUzMDAsInVzZXJuYW1lIjoiZnJpZW5kc2NvZGUiLCJjb21wYW55IjoiMjA2MDE4MzEwMzIiLCJleHAiOjQ3NjMyMTUzMDB9.JIikuy-l6I74EB5-DNMlFjdqtIhIwR4CDDc10LLuiUuwt3AdxSbpQlgZbIHsGA7cMFAGkhP0trdZVFp40Z35Ayr9fL-JA4NX6Scd6VdnlIBkf2FT32irpGwkY71bEUnjDxGARWGtFnZwhK3MMLWAdjemGrTP25AqtGK8IjkiFZSKQ90toFxpd1Ije6zigRxrkFl0vS6WsFWwHXG-vmCyBqw_i_qE8MVT1zVemas1RZxaDH3UIhCB7mXxZqEUO8QqcmUB8L9OY6tCFOYm_whDjOdkz4GrxdfWMoAQHwDhEhI85k4fwrdynbGyonH1Invcv5xejz0u99geEJmTns9TdqV0dDjhvE4Prqtb53PwRSpJ6Bpo9lIq_YFoMcJk9duXqS2iVNgFDEc3oa35OeM75x0xfrv5i7uIr_JajjQ1-LLz36hJpc1lt9dwAEPrtGoEoSwImGByBZA7yU19cw_3r429-bHMAjnvdF9tPBPJCfVFfW0SYsLfR_UVXoZNzWk1gYDLUvvQw5PtLh6GVGtphy4sSTElZ1-fZ1Q2lmf8Jh8XSdeE4qDfXhW9YHIBUwn99K_9H80Hd8mi2rqJzig4ftudNZtAU0YqLHq6WohTXWNwf9Fob7b66vlwXHawQ6HGoN046kAebuWKBQeYwJFYzfQJOznEtkw5aiJ2wo9hcaU");
    myHeaders.append("Content-Type", "application/json");
    const data = {"tipoOperacion":"0101","tipoDoc":"03","serie":"B002","correlativo":"1","fechaEmision":"2021-02-01T02:13:00-05:00","tipoMoneda":"PEN","client":{"tipoDoc":"1","numDoc":"72244070","rznSocial":"adrian llalli perez","address":{"direccion":"Jr. los Sauces 167"},"email":"adrian@gmail.com","telephone":"916056564"},"company":{"ruc":"20601831032","razonSocial":"CLÍNICA VETERINARIA TOOBY E.I.R.L","address":{"direccion":"AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS"}},"mtoOperGravadas":0.2,"mtoIGV":0.036000000000000004,"totalImpuestos":0.036000000000000004,"valorVenta":0.2,"mtoImpVenta":0.23600000000000002,"ublVersion":"2.1","details":[{"codProducto":"P001","unidad":"NIU","descripcion":"impuesto bolsa plastica","cantidad":1,"mtoValorUnitario":0.2,"mtoValorVenta":0.2,"mtoBaseIgv":0.23600000000000002,"porcentajeIgv":18,"igv":0.036000000000000004,"tipAfeIgv":"10","totalImpuestos":0.036000000000000004,"mtoPrecioUnitario":0.23600000000000002}],"legends":[{"code":"1000","value":"SON CIENTO DIECIOCHO CON 00/100 SOLES"}]};
    var raw = JSON.stringify(data);
    console.log('__________________________________________');
    console.log(data);
    console.log(dote);
    console.log('__________________________________________');
    console.log(raw);
    console.log(JSON.stringify(dote));
    console.log('__________________________________________');


    var requestOptions:RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(dote),
      redirect: 'follow'
    };

    console.log(requestOptions);


    fetch("https://facturacion.apisperu.com/api/v1/invoice/send", requestOptions)
      .then(response => response.text())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
  }

  enviarComprobanteAsuant2(){
    const dote: any = {
      "tipoOperacion": "0101",
      "tipoDoc": "03",
      "serie": "B002",
      "correlativo": "1",
      "fechaEmision": "2021-02-01T02:13:00-05:00",
      "tipoMoneda": "PEN",
      "client": {
        "tipoDoc": "1",
        "numDoc": "72244070",
        "rznSocial": "adrian llalli perez",
        "address": {
          "direccion": "Jr. los Sauces 167"
        },
        "email": "adrian@gmail.com",
        "telephone": "916056564"
      },
      "company": {
        "ruc": "20601831032",
        "razonSocial": "CLÍNICA VETERINARIA TOOBY E.I.R.L",
        "address": {
          "direccion": "AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS"
        }
      },
      "mtoOperGravadas": 0.2,
      "mtoIGV": 0.036000000000000004,
      "totalImpuestos": 0.036000000000000004,
      "valorVenta": 0.2,
      "mtoImpVenta": 0.23600000000000002,
      "ublVersion": "2.1",
      "details": [
        {
          "codProducto": "P001",
          "unidad": "NIU",
          "descripcion": "impuesto bolsa plastica",
          "cantidad": 1,
          "mtoValorUnitario": 0.2,
          "mtoValorVenta": 0.2,
          "mtoBaseIgv": 0.23600000000000002,
          "porcentajeIgv": 18,
          "igv": 0.036000000000000004,
          "tipAfeIgv": "10",
          "totalImpuestos": 0.036000000000000004,
          "mtoPrecioUnitario": 0.23600000000000002
        }
      ],
      "legends": [
        {
          "code": "1000",
          "value": "SON CIENTO DIECIOCHO CON 00/100 SOLES"
        }
      ]
    };
    this.apisPeru.enviarComprobanteToSunat(dote);
  }

}

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

    var myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDk2MTUzMDAsInVzZXJuYW1lIjoiZnJpZW5kc2NvZGUiLCJjb21wYW55IjoiMjA2MDE4MzEwMzIiLCJleHAiOjQ3NjMyMTUzMDB9.JIikuy-l6I74EB5-DNMlFjdqtIhIwR4CDDc10LLuiUuwt3AdxSbpQlgZbIHsGA7cMFAGkhP0trdZVFp40Z35Ayr9fL-JA4NX6Scd6VdnlIBkf2FT32irpGwkY71bEUnjDxGARWGtFnZwhK3MMLWAdjemGrTP25AqtGK8IjkiFZSKQ90toFxpd1Ije6zigRxrkFl0vS6WsFWwHXG-vmCyBqw_i_qE8MVT1zVemas1RZxaDH3UIhCB7mXxZqEUO8QqcmUB8L9OY6tCFOYm_whDjOdkz4GrxdfWMoAQHwDhEhI85k4fwrdynbGyonH1Invcv5xejz0u99geEJmTns9TdqV0dDjhvE4Prqtb53PwRSpJ6Bpo9lIq_YFoMcJk9duXqS2iVNgFDEc3oa35OeM75x0xfrv5i7uIr_JajjQ1-LLz36hJpc1lt9dwAEPrtGoEoSwImGByBZA7yU19cw_3r429-bHMAjnvdF9tPBPJCfVFfW0SYsLfR_UVXoZNzWk1gYDLUvvQw5PtLh6GVGtphy4sSTElZ1-fZ1Q2lmf8Jh8XSdeE4qDfXhW9YHIBUwn99K_9H80Hd8mi2rqJzig4ftudNZtAU0YqLHq6WohTXWNwf9Fob7b66vlwXHawQ6HGoN046kAebuWKBQeYwJFYzfQJOznEtkw5aiJ2wo9hcaU');
    myHeaders.append('Content-Type', 'application/json');
    const data = {tipoOperacion:'0101',tipoDoc:'03',serie:'B002',correlativo:'1',fechaEmision:'2021-02-01T02:13:00-05:00',tipoMoneda:'PEN',client:{tipoDoc:'1',numDoc:'72244070',rznSocial:'adrian llalli perez',address:{direccion:'Jr. los Sauces 167'},email:'adrian@gmail.com',telephone:'916056564'},company:{ruc:'20601831032',razonSocial:'CLÍNICA VETERINARIA TOOBY E.I.R.L',address:{direccion:'AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'}},mtoOperGravadas:0.2,mtoIGV:0.036000000000000004,totalImpuestos:0.036000000000000004,valorVenta:0.2,mtoImpVenta:0.23600000000000002,ublVersion:'2.1',details:[{codProducto:'P001',unidad:'NIU',descripcion:'impuesto bolsa plastica',cantidad:1,mtoValorUnitario:0.2,mtoValorVenta:0.2,mtoBaseIgv:0.23600000000000002,porcentajeIgv:18,igv:0.036000000000000004,tipAfeIgv:'10',totalImpuestos:0.036000000000000004,mtoPrecioUnitario:0.23600000000000002}],legends:[{code:'1000',value:'SON CIENTO DIECIOCHO CON 00/100 SOLES'}]};
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
        xml: '<?xml version="1.0" encoding="utf-8"?>\n<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"><ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent><ds:Signature Id="SignIMM">\n  <ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>\n    <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>\n  <ds:Reference URI=""><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><ds:DigestValue>D4EUX7hhTcGlU/Z9CnXlplgddLA=</ds:DigestValue></ds:Reference></ds:SignedInfo><ds:SignatureValue>q0j7Sdxt/Ko3nPaEAh6JW+V4aQrNOtYhkJzerAtyD/+Akr9tOrcvv2q8lU7DIe5M/rLpPah0kNQvtkWYx0JmtPgRydOxH1vfedFdhzqJ8d637/tkAvf36TSPXmTmi0o/AGRVoPAZyo7BTphZ7cv7EU3mbfsLzmDWCqloEUPYN8aLHnxCs4w6JhPAzf3bqhjg2krz2esfzdIaGeQyAJPAGww+tW8hNFYDSHxoeGkL7UzhBJhvvPFA7PoK3LGn2fyU3x9FvqqmrVvsg8uW9DL627iGGHHWN9qmNGZqeiphq58nyUIu+5I7Fr5+XhiKZNQACdMnRUG5j/LpWkb4xsbY7Q==</ds:SignatureValue>\n<ds:KeyInfo><ds:X509Data><ds:X509Certificate>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</ds:X509Certificate><ds:X509Certificate>MIIGwzCCBKugAwIBAgIIdTIhS+Uw/fQwDQYJKoZIhvcNAQENBQAwYTELMAkGA1UEBhMCUEUxPDA6BgNVBAoMM1JlZ2lzdHJvIE5hY2lvbmFsIGRlIElkZW50aWZpY2FjacOzbiB5IEVzdGFkbyBDaXZpbDEUMBIGA1UEAwwLRUNFUC1SRU5JRUMwHhcNMTcwODExMDI0OTIzWhcNMjUwODExMDI0OTIzWjBsMQswCQYDVQQGEwJQRTE8MDoGA1UECgwzUmVnaXN0cm8gTmFjaW9uYWwgZGUgSWRlbnRpZmljYWNpw7NuIHkgRXN0YWRvIENpdmlsMR8wHQYDVQQDDBZFQ0VQLVJFTklFQyBDQSBDbGFzcyAxMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAkObO179U75/EHdruSQSxAWx1/iosJ9PN0hqcvv2H/TJbBsH3aUQ+/dXkV43Z91s9BQv9KURZUD7NxwvGV+pyg3+JE8n03LsfjkSxG2Z/LdDjwhxagKkXp1aqYxwNWvRh5WRmRQhR8VhjVVgoLPEKLOZQFRSVyI5jPiKeBVGVrEjeFYYw+m1LGF0raWgvvSOy7sywsM+xobP5sKMTLpEsfaFGYQQbL4+si9FEihvaymo73YHLah/bPDmE3+DoQvjct5mJQW/uzxs4gP3eGqMomEU+omhchCCPFxXr6UhGCpGUdAblhbPhHGy+R46+/8wKj67VQ8qBOlxqQ0RJfvsjQ5W7CPesCFEimL5VHA0rt5AxK4N/A5wd2iffKsOgjKeaUtnt1qulNdfzeoZOyS2+/NObLGaqsLln1vJctICEoDk1QZxvFsa+EAEMVuRy87R4KBRM4+LRMbpEAxSC6Kjq7faf4X+dD9gDAfVQCEvwf40gf1HdoUghJVTuW/Ul8Usv4Cr0G9K3pbzDvswcXkO7WTmTyhbscEV8Y3Yxd8NTBLQoLsfrqttsWjWGd0AnmY2EuPhyvo6s0iJbCBldGHXDYwerjmtxg/cj20IUPm+ofmmKJgYyKnehwp19X/B3NTdTPueRUTfP8bJYyGWqArowAqbkyKj/2rMqguzurBWk0kMCAwEAAaOCAXIwggFuMBIGA1UdEwEB/wQIMAYBAf8CAQAwHwYDVR0jBBgwFoAUIq/zX+7hRX1M737j39JSfMvOe3UwRgYIKwYBBQUHAQEEOjA4MDYGCCsGAQUFBzAChipodHRwOi8vd3d3LnJlbmllYy5nb2IucGUvY3J0L3NoYTIvZWNlcC5jcnQwEQYDVR0gBAowCDAGBgRVHSAAMD0GA1UdJQQ2MDQGCCsGAQUFBwMCBggrBgEFBQcDBAYKKwYBBAGCNxQCAgYIKwYBBQUHAwkGCCsGAQUFBwMBMG4GA1UdHwRnMGUwMKAuoCyGKmh0dHA6Ly9jcmwucmVuaWVjLmdvYi5wZS9hcmwvc2hhMi9lY2VwLmNybDAxoC+gLYYraHR0cDovL2NybDIucmVuaWVjLmdvYi5wZS9hcmwvc2hhMi9lY2VwLmNybDAdBgNVHQ4EFgQUQxVu8NPRaxspM0EtVaxxItE8pV0wDgYDVR0PAQH/BAQDAgEGMA0GCSqGSIb3DQEBDQUAA4ICAQBaZVtF5V2pGCvIXytSfjGCQNot388WBRJUvisy8CMlZnkE2iRFWlcxLvZNaFdt84FqLvNxYaOYkBJxNORU8lIPJRh4J7BQMYQp1fUKFyrKEZBdFxX/nHFKnR0ERJQyLwNqo68nM24VgoC82BgCZCJpe5mref0aJyzsCGAhwbuSiyrpSxiDgRaTLPheRTBkb+M6EEDFPCooRUrex/6VdXWqHSox6HwlcjYxzo5UqjfVjstbUqRRuWs6RSmuPSzhtvLHO+/aqP7yf6sQ+a0OB/pyJS+G5j0BvG+QeiZalX4KUMiteaidaw81ilJg5295GuEJn6NvXwpHPc1uLTM0YagniLy97N7WqCc+bIWlRaK1E5+ixQfrIWyIkUFsWoUCOfHC3IofXJmz6z1UDIeJ6awA2pxFLh8HeVawY/j2E0xY5RW3uoBxuCzlaBTbHPJ/MWjW4aMT8ePsQCygrOMvagTGXO90wI/YaqO2Rq9jbQoJStM3vlUJ79dJZT/fzbeF8ivoN0nh+zE0aUzYr+TI6V0oX6q9Q703ixgE+xVkFissf13og0C3scmPiDBPRQa6vQaSeUcF7Bl2eFk87YdioXcNw8w/dZmNA1IpZc+2vpGn7ueBi0dy7JiEDSGsY9/DnkMzRjFmSe+NHjJXdJaEkD7U77U3e1S3uqETCsAjsyloYQ==</ds:X509Certificate><ds:X509Certificate>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</ds:X509Certificate><ds:X509Certificate>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</ds:X509Certificate></ds:X509Data></ds:KeyInfo></ds:Signature></ext:ExtensionContent></ext:UBLExtension></ext:UBLExtensions><cbc:UBLVersionID>2.1</cbc:UBLVersionID><cbc:CustomizationID>2.0</cbc:CustomizationID><cbc:ID>B001-224</cbc:ID><cbc:IssueDate>2021-01-23</cbc:IssueDate><cbc:IssueTime>05:06:13</cbc:IssueTime><cbc:InvoiceTypeCode listID="0101">03</cbc:InvoiceTypeCode><cbc:Note languageLocaleID="1000"><![CDATA[SON CIENTO VEINTINUEVE SOLES]]></cbc:Note><cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode><cac:Signature><cbc:ID>20601831032</cbc:ID><cac:SignatoryParty><cac:PartyIdentification><cbc:ID>20601831032</cbc:ID></cac:PartyIdentification><cac:PartyName><cbc:Name><![CDATA[CLÍNICA VETERINARIA TOOBY E.I.R.L]]></cbc:Name></cac:PartyName></cac:SignatoryParty><cac:DigitalSignatureAttachment><cac:ExternalReference><cbc:URI>#GREENTER-SIGN</cbc:URI></cac:ExternalReference></cac:DigitalSignatureAttachment></cac:Signature><cac:AccountingSupplierParty><cac:Party><cac:PartyIdentification><cbc:ID schemeID="6">20601831032</cbc:ID></cac:PartyIdentification><cac:PartyName><cbc:Name><![CDATA[VETERINARIAS TOBBY]]></cbc:Name></cac:PartyName><cac:PartyLegalEntity><cbc:RegistrationName><![CDATA[CLÍNICA VETERINARIA TOOBY E.I.R.L]]></cbc:RegistrationName><cac:RegistrationAddress><cbc:ID>030201</cbc:ID><cbc:AddressTypeCode>0000</cbc:AddressTypeCode><cbc:CityName>ANDAHUAYLAS</cbc:CityName><cbc:CountrySubentity>APURIMAC</cbc:CountrySubentity><cbc:District>ANDAHUAYLAS</cbc:District><cac:AddressLine><cbc:Line><![CDATA[AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS]]></cbc:Line></cac:AddressLine><cac:Country><cbc:IdentificationCode>PE</cbc:IdentificationCode></cac:Country></cac:RegistrationAddress></cac:PartyLegalEntity></cac:Party></cac:AccountingSupplierParty><cac:AccountingCustomerParty><cac:Party><cac:PartyIdentification><cbc:ID schemeID="1">73517374</cbc:ID></cac:PartyIdentification><cac:PartyLegalEntity><cbc:RegistrationName><![CDATA[wilmer arcaya layme]]></cbc:RegistrationName><cac:RegistrationAddress><cac:AddressLine><cbc:Line><![CDATA[]]></cbc:Line></cac:AddressLine><cac:Country><cbc:IdentificationCode>PE</cbc:IdentificationCode></cac:Country></cac:RegistrationAddress></cac:PartyLegalEntity><cac:Contact><cbc:Telephone>944217218</cbc:Telephone></cac:Contact></cac:Party></cac:AccountingCustomerParty><cac:TaxTotal><cbc:TaxAmount currencyID="PEN">19.68</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="PEN">109.32</cbc:TaxableAmount><cbc:TaxAmount currencyID="PEN">19.68</cbc:TaxAmount><cac:TaxCategory><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="PEN">109.32</cbc:LineExtensionAmount><cbc:PayableAmount currencyID="PEN">129.00</cbc:PayableAmount></cac:LegalMonetaryTotal><cac:InvoiceLine><cbc:ID>1</cbc:ID><cbc:InvoicedQuantity unitCode="NIU">2</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="PEN">20.34</cbc:LineExtensionAmount><cac:PricingReference><cac:AlternativeConditionPrice><cbc:PriceAmount currencyID="PEN">12</cbc:PriceAmount><cbc:PriceTypeCode>01</cbc:PriceTypeCode></cac:AlternativeConditionPrice></cac:PricingReference><cac:TaxTotal><cbc:TaxAmount currencyID="PEN">3.66</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="PEN">20.34</cbc:TaxableAmount><cbc:TaxAmount currencyID="PEN">3.66</cbc:TaxAmount><cac:TaxCategory><cbc:Percent>18</cbc:Percent><cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:Item><cbc:Description><![CDATA[toallas humedas ok pet x 50 und]]></cbc:Description></cac:Item><cac:Price><cbc:PriceAmount currencyID="PEN">10.17</cbc:PriceAmount></cac:Price></cac:InvoiceLine><cac:InvoiceLine><cbc:ID>2</cbc:ID><cbc:InvoicedQuantity unitCode="NIU">3</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="PEN">88.98</cbc:LineExtensionAmount><cac:PricingReference><cac:AlternativeConditionPrice><cbc:PriceAmount currencyID="PEN">35</cbc:PriceAmount><cbc:PriceTypeCode>01</cbc:PriceTypeCode></cac:AlternativeConditionPrice></cac:PricingReference><cac:TaxTotal><cbc:TaxAmount currencyID="PEN">16.02</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="PEN">88.98</cbc:TaxableAmount><cbc:TaxAmount currencyID="PEN">16.02</cbc:TaxAmount><cac:TaxCategory><cbc:Percent>18</cbc:Percent><cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:Item><cbc:Description><![CDATA[desmotador electronico]]></cbc:Description></cac:Item><cac:Price><cbc:PriceAmount currencyID="PEN">29.66</cbc:PriceAmount></cac:Price></cac:InvoiceLine></Invoice>\n',
        hash: 'D4EUX7hhTcGlU/Z9CnXlplgddLA=',
        sunatResponse: {
          success: true,
          cdrZip: 'UEsDBBQAAgAIAO6AN1IAAAAAAgAAAAAAAAAGAAAAZHVtbXkvAwBQSwMEFAACAAgA7oA3UgAU/ncJBAAA/AsAAB0AAABSLTIwNjAxODMxMDMyLTAzLUIwMDEtMjI0LnhtbLWW23LbNhCG7/MUGPoibVoaIHU0R1JGipwZxbGtynLc9A4mYQk1CdAAdMrTd3kUZdMTKzMd+wJa7H67+BcLqfdxG4VozZTmUvQt55RYiAlfBlws+tbt/LPdtT4O3vWo8oZxHHKfGnCcMR1LoRmCYKE9qvrWSglPUs21J2jEtKdj5vOH3N9b3Yee9pcsot5WB3Uo27VyGtuaI3GfZBRJcb41TCTHgI+AZMLoPdS/938JOgJ3vxZIfw04XCwUW1DD6qCB7ltLY2IP481mc7ppnEq1wC4hBJMzDD6B5ouTwltLGpf+WSJ9CluJPQ1MFpiJNQtlzLA16IG03u3oa6mUfmnKLBUtBazMoHfDF4Kalcp7/qY64d4kYSyYiAc5eIdQ7xMVUoA+If+RanTJzFIGaBgupOJmGb2CdbBDEqzNtr7tO01xcgfeiaCJfhZO2WWFb4aSZlGrHUnFTpSmtl7SluPmyBl7YArGgaHb2aRvWYkRzHNFhX6QKtKZoWr6adoDiYrmBLYuqs9SHwl9i0AAxM8r7435gmlzpGKgyElVp5LzjYYrNvjj5pp0v4vzWHX+8i92/PGx2152H88vye7iTn3ZbK/j6cbstty/vR7h2cUsjvD6R8CDJ/dpvP43NjdyOJyK2eq7M/rnnD6J+HJ0t+n3e7iaJekPLhsEVw0f3rXqjcgiPkwVX8PkoUe2Q+9HzNApjCiMN1PmPRLSoFX8IcNUonoXbJcye3+3yNmYGpqtkqhs1oF8BeMfIH9vyvlZQiBU+M+DU9pE6xVTN0xxGlYtCfh4fCU2ZWXcq1V0z9TxtIPoaoKiXLxXBpdq7XWEdf2bgl8+PrjmiYK325uMB07bcZqNs3az63a6PZxbs92knHEipktcxyaO7TbmpOWRtuc0ctfSZR8x5yAQIV76X3FL7alb8e30jJ35HmweuKcAp+2Rjud2D51zNvW9ij75WRLLze3VcF45Xeko1W5KldlltnQ5CUDG8vumxLjEacCfe9Zq7UH49ahiI7svSUC6qlSS7eBnnvi14mBMuaFhecChMdRfRmnPk/2kuUrQcD+9aVZ4YwcnzzRIbFmimiD8s2S4RucrCd1qNpwOstGY3TPkQ1sSF4VYiOYSWGiq4HtcooChb8Ch4Dm5+nztoTTsNyED6SELW2hNQ6lgaf2e6yRN0VwmAqb+n4bh2gQz5jO+PiJnmzjdhkMa7ptz1qQYS3+VaF1c76KW8lN69fOOQYoRSQbIbRZDsd85GKBPMoDJPJyc1JZ6jZn2FY/Tyr5SNJIhPF9IQCFKoiLDn2hJkeaBRNRnsaEBzXDV4OJY1dr3Jzq4nC9qL/WqC8jE4jEH+xsb0rY7jZbTaXSax/TjIAWu7wiu//E++A9QSwECAAAUAAIACADugDdSAAAAAAIAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAZHVtbXkvUEsBAgAAFAACAAgA7oA3UgAU/ncJBAAA/AsAAB0AAAAAAAAAAQAAAAAAJgAAAFItMjA2MDE4MzEwMzItMDMtQjAwMS0yMjQueG1sUEsFBgAAAAACAAIAfwAAAGoEAAAAAA==',
          cdrResponse: {
            id: 'B001-224',
            code: '0',
            description: 'La Boleta numero B001-224, ha sido aceptada',
            notes: [
              '4317 - Debe consignar el Total Precio de Venta - INFO: 4317 (nodo: "/" valor: "")'
            ]
          }
        }
      },
      idVenta: 'JJa3WunEjd8oVErlYCC6'
    };

    this.apisPeru.enviarNotaDeCreditoAdaptador(venta);

  }
}

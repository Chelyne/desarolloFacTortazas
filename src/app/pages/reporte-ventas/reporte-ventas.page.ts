import { Component, OnInit } from '@angular/core';
import { DbDataService } from 'src/app/services/db-data.service';
import { MenuController, ToastController, PopoverController } from '@ionic/angular';
import { ExportarPDFService } from '../../services/exportar-pdf.service';
import { formatDate } from '@angular/common';
import * as moment from 'moment';
import { PopoverMesesComponent } from '../../components/popover-meses/popover-meses.component';
import { StorageService } from 'src/app/services/storage.service';
import { FormGroup, FormControl } from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { PoppoverEditarComponent } from '../../components/poppover-editar/poppover-editar.component';
import { ReportesService } from '../../services/reportes.service';
import * as FileSaver from 'file-saver';
import { timer } from 'rxjs';

@Component({
  selector: 'app-reporte-ventas',
  templateUrl: './reporte-ventas.page.html',
  styleUrls: ['./reporte-ventas.page.scss'],
})
export class ReporteVentasPage implements OnInit {
  arrayMes = [];
  sede: string;
  ventasDiaForm: FormGroup;

  contador = 0;
  contadorXML = 0;
  constructor( private dataSrvc: DbDataService,
               private excelService: ExportarPDFService,
               private menuCtrl: MenuController,
               private toastController: ToastController,
               private popoverCtrl: PopoverController,
               private storage: StorageService,
               private reportesservice: ReportesService
              ) {
                this.sede = this.storage.datosAdmi.sede;
                this.ventasDiaForm = this.createFormGroup();
              }

  ngOnInit() {
    this.menuCtrl.enable(true);
    // this.ObtenerVentas();
  }
  createFormGroup() {
    return new FormGroup({
      fechadeventa: new FormControl(),
    });
  }
  ReporteProoductosSede(){
    const dataExcel = [];
    const sus = this.dataSrvc.ObtenerListaProductosSinLIMITE(this.storage.datosAdmi.sede).subscribe((data: any) => {
      sus.unsubscribe();
      console.log(data);
      if (isNullOrUndefined(data)){
        this.presentToast('no hay productos de sede: ' + this.sede, 'danger');
      }else{
        for (const datos of data) {
          const formato: any = {
            UID: datos.id,
            'Nombre Producto': datos.nombre.toUpperCase(),
            Codigo: datos.codigo ? datos.codigo : null,
            'Codigo Barra': datos.codigoBarra ? datos.codigoBarra : null,
            Stock: datos.cantStock ? datos.cantStock  : null,
            Categoria: datos.subCategoria ? datos.subCategoria : null,
            Estado: null
          };
          dataExcel.push(formato);
        }
        this.excelService.exportAsExcelFile(dataExcel, 'ReporteProductos' + this.sede);

      }
    });
  }
  ObtenerVentasDia(ev: any) {
    if (isNullOrUndefined(this.ventasDiaForm.value.fechadeventa)) {
      this.presentToast('Ingrese Fecha', 'warning');

    }else {
      this.ventasDiaForm.value.fechadeventa = this.ventasDiaForm.value.fechadeventa.split('-').reverse().join('-');
      console.log(this.ventasDiaForm.value.fechadeventa);
      this.ReporteVentaGeneralDia(ev, this.ventasDiaForm.value.fechadeventa);
    }
  }
  async ReporteVentaGeneralDia(ev: any, dia: any){
    const popover = await this.popoverCtrl.create({
      component: PoppoverEditarComponent,
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        formato: true
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      switch (data.action) {
        case 'a4': console.log('a4'); this.reportesservice.ReporteVentaDiaGeneralPDF(dia); break;
        case 'ticked': console.log('ticked'); this.reportesservice.ReporteTiket(dia); break;
      }
    }
  }
  ObtenerVentasMes(){
    const d = new Date();
    const mes = d.getMonth() + 1;
    const anio = d.getFullYear();
    this.ObtenerVentasMesAnio(mes, anio);
  }
  async ReporteVentaMes(ev: any){
    console.log(ev);
    const popover = await this.popoverCtrl.create({
      component: PopoverMesesComponent,
      event: ev,
      translucent: true,
      mode: 'ios',
      componentProps: {
        mes: true
      }
    });
    await popover.present();

    const { data } = await popover.onWillDismiss();
    console.log(data);
    if (data) {
      const d = new Date();
      const mes = data.action;
      const anio = d.getFullYear();
      // console.log(data);
      this.ObtenerVentasMesAnio(mes, anio);
    }

  }
  // tslint:disable-next-line:member-ordering
  async ObtenerVentasMesAnio(mes: number, anio: number) {
    // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa', this.sede.toLocaleLowerCase());
    this.arrayMes = [];
    let formato: string;
    // tslint:disable-next-line:no-shadowed-variable
    for (let contador = 1 ; contador <= 31; contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + ((mes <= 9 ) ? '0' + mes : mes)  + '-' + anio;
      await this.dataSrvc.listaVentasDia(this.sede.toLocaleLowerCase(), formato).subscribe((res: any) => {
        if (res.length === 0) {
          console.log('no hay datos de dia', contador );
        }else {
          console.log('datos de dia', contador );
          this.arrayMes = [...this.arrayMes, ...res];
          // console.log('fecha', formato, res);
        }
        if (contador === 31) {
        console.log('todos datos', this.arrayMes);
        this.consultaProductosVenta(this.arrayMes).then(() => {
          this.exelVentas(this.arrayMes, mes, anio);
        });
        }
      });
    }
  }

  async obtenerZipXml(mes: number, anio: number) {
    this.arrayMes = [];
    let formato: string;
    // tslint:disable-next-line:no-shadowed-variable
    for (let contador = 1 ; contador <= 31; contador++) {
      formato = ((contador <= 9 ) ? '0' + contador : contador) + '-' + ((mes <= 9 ) ? '0' + mes : mes)  + '-' + anio;
      console.log(formato);
      await this.dataSrvc.listaVentasDia(this.sede.toLocaleLowerCase(), formato).subscribe(async (res: any) => {
        if (res.length === 0) {
          console.log('no hay datos de dia', contador );
        }else {
          console.log('datos de dia', contador );
          this.arrayMes = [...this.arrayMes, ...res];
          // console.log('fecha', formato, res);
        }
        if (contador === 31) {
          console.log('todos datos', this.arrayMes);
          this.saveZip().then(() => {
            console.log('generando ZIP');
          });
          this.saveXml().then(() => {
            console.log('generando XML');
          });
        }
      });
    }
  }

  consultaProductosVenta(data) {
    const promesa = new Promise((resolve, reject) => {
      let contador = 0;
      for (const item of data) {
        const consulta = this.dataSrvc.obtenerProductosDeVenta(item.idListaProductos, this.sede).subscribe((productos) => {
          consulta.unsubscribe();
          console.log('PRODS', productos);
          let  nombres = '';
          for (const item2 of productos.productos) {
            if (item2.producto.subCategoria === 'cortes' || item2.producto.subCategoria === 'servicio') {
              nombres = nombres + item2.producto.nombre.toUpperCase() + ', ';
              item.productos = nombres;
              console.log('nombres:' ,  nombres);
            }
          }
          contador++;
          if (contador === data.length) {
            resolve(productos);
          }
        });
      }
    });
    return promesa;
  }
  async exelVentas(data, mes: number, anio: number) {
    console.log('PRODUCTOS', data);
    // tslint:disable-next-line:prefer-const
    let dataExcel = [];
    if (data.length === 0) {
      console.log('toast de no hay datos');
      this.presentToast('No existe datos del mes ', 'danger');
    }else {
      let contador = 0;
      console.log('datos', data);
      for (const datos of data) {
        contador++;
        // tslint:disable-next-line:prefer-const
        let FechaConsulta = new Date(moment.unix(datos.fechaEmision.seconds).format('D MMM YYYY H:mm'));
        const formato: any = {
          'Nombre/Razon social': datos.cliente.nombre.toUpperCase(),
          'Tipo Doc': datos.cliente.tipoDoc.toUpperCase(),
          'DNI/RUC': datos.cliente.numDoc,
          'Tipo Comprobante': datos.tipoComprobante.toUpperCase(),
          // tslint:disable-next-line:max-line-length
          'Serie Comprobante': datos.serieComprobante,
          // tslint:disable-next-line:max-line-length
          'Num. Comprobante': datos.numeroComprobante,
          // tslint:disable-next-line:max-line-length
          'Serie con Numero': datos.serieComprobante + '-' + this.digitosFaltantes('0', (8 - datos.numeroComprobante.length)) + datos.numeroComprobante,
          'Monto Pagado': datos.totalPagarVenta,
          'Metodo Pago': datos.tipoPago.toUpperCase(),
          'Fecha Emision': formatDate(FechaConsulta, 'dd-MM-yyyy', 'en'),
          'Cant. bolsa': datos.cantidadBolsa,
          'Sede: ': datos.vendedor.sede,
          'Estado Comprobante': datos.estadoVenta,
          'Servicio ': datos.productos,
        };
        dataExcel.push(formato);
        if (contador === data.length){
          this.excelService.exportAsExcelFile(dataExcel, 'ReporteVentas ' + mes + '-' + anio);
        }
      }
    }

  }

  digitosFaltantes(caracter: string, num: number) {
    let final = '';
    for ( let i = 0; i < num; i++) {
      final = final + caracter;
    }
    return final;
  }
  async presentToast(mensaje: string, colors?: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: colors,
      position: 'top'
    });
    toast.present();
  }

  // async saveZip(cdrZip, nombre) {
  //   const data = await this.base64ToBlob(cdrZip);
  //   // this.base64ToBlob(cdrZip).then((data: any) => {
  //   //   FileSaver.saveAs(data, nombre);
  //   // });
  //   await FileSaver.saveAs(data, nombre);
  // }


  async saveZip() {
    const lista = [];
    this.arrayMes.forEach(element => {
      // tslint:disable-next-line:max-line-length
      if ((element.tipoComprobante === 'boleta' || element.tipoComprobante === 'factura') && element.cdr && (element.cdr.sunatResponse.success === true)) {
        lista.push(element);
      }
    });
    console.log('FUNCION', this.contador, lista.length);
    const promesa = await new Promise<void>((resolve, reject) => {
      if (this.contador < lista.length) {
        console.log('arrayMes', this.arrayMes);
        console.log('UNO', this.arrayMes[this.contador]);
        if (lista[this.contador] && lista[this.contador].cdr) {
          console.log(lista[this.contador]);
          const binaryString = window.atob(lista[this.contador].cdr.sunatResponse.cdrZip);
          const binaryLen = binaryString.length;
          const ab = new ArrayBuffer(binaryLen);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < binaryLen; i++) {
            ia[i] = binaryString.charCodeAt(i);
          }
          // tslint:disable-next-line:prefer-const
          let bb: any = new Blob([ab]);
          bb.lastModifiedDate = new Date();
          bb.name = 'archive.zip';
          // bb.type = 'zip';
          // return bb;
          FileSaver.saveAs(bb, lista[this.contador].serieComprobante + '-' + lista[this.contador].numeroComprobante + '.zip');
          this.contador ++;
          timer(2000).subscribe(() => {
            this.saveZip();
          });
        }
      } else {
        console.log('FIN');
        resolve();
        return promesa;
      }
    });
  }


  async saveXml() {
    const lista = [];
    this.arrayMes.forEach(element => {
      // tslint:disable-next-line:max-line-length
      if ((element.tipoComprobante === 'boleta' || element.tipoComprobante === 'factura') && element.cdr && (element.cdr.sunatResponse.success === true)) {
        lista.push(element);
      }
    });
    const promesa = await new Promise<void>((resolve, reject) => {
      if (this.contadorXML < lista.length) {
        // const doc =  {
        //   title: 'prueba',
        // tslint:disable-next-line:max-line-length
        //   xml: '<?xml version="1.0" encoding="utf-8"?><Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2" xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"><ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent><ds:Signature Id="SignIMM">  <ds:SignedInfo><ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>    <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>  <ds:Reference URI=""><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/><ds:DigestValue>y8tuVCmRWI0MwTuDacdaNW1b94U=</ds:DigestValue></ds:Reference></ds:SignedInfo><ds:SignatureValue>XiCuMWRtp7PE4yUXqknBqkFgBq2D41VKsQQGyGBoIwDJg3h4UctWWjnT3I/He5wgCjvaXBcOmxIxJ/JfoEKYzolOn8GoXyB0A+g1brbkrgNc4Px5xQgSlV3WtvulSW0rwARKOgkKVnctt2ShWlnEGWRNV5Qbf+K0ul4mVcfUg7LDaGOsqupkqxB4Xbws72qTOJ3eF8P1NPbhU0Q9VpHUHBvloCy3j+4h/NYVn9fCuKcmAYOvncKmLPI2ojQ9ViEHEdL0BDBx/yQSahC86yZa3Z5skjrCtsCGUTC3SHWYe2eBg7DS0bEAfsMn00FYCFjD27kuu961Zh1fz2uwP6UHrw==</ds:SignatureValue><ds:KeyInfo><ds:X509Data><ds:X509Certificate>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</ds:X509Certificate><ds:X509Certificate>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</ds:X509Certificate><ds:X509Certificate>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</ds:X509Certificate><ds:X509Certificate>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</ds:X509Certificate></ds:X509Data></ds:KeyInfo></ds:Signature></ext:ExtensionContent></ext:UBLExtension></ext:UBLExtensions><cbc:UBLVersionID>2.1</cbc:UBLVersionID><cbc:CustomizationID>2.0</cbc:CustomizationID><cbc:ID>B001-358</cbc:ID><cbc:IssueDate>2021-01-25</cbc:IssueDate><cbc:IssueTime>06:15:33</cbc:IssueTime><cbc:InvoiceTypeCode listID="0101">03</cbc:InvoiceTypeCode><cbc:Note languageLocaleID="1000"><![CDATA[SON CINCUENTA Y DOS SOLES]]></cbc:Note><cbc:DocumentCurrencyCode>PEN</cbc:DocumentCurrencyCode><cac:Signature><cbc:ID>20601831032</cbc:ID><cac:SignatoryParty><cac:PartyIdentification><cbc:ID>20601831032</cbc:ID></cac:PartyIdentification><cac:PartyName><cbc:Name><![CDATA[CLÍNICA VETERINARIA TOOBY E.I.R.L]]></cbc:Name></cac:PartyName></cac:SignatoryParty><cac:DigitalSignatureAttachment><cac:ExternalReference><cbc:URI>#GREENTER-SIGN</cbc:URI></cac:ExternalReference></cac:DigitalSignatureAttachment></cac:Signature><cac:AccountingSupplierParty><cac:Party><cac:PartyIdentification><cbc:ID schemeID="6">20601831032</cbc:ID></cac:PartyIdentification><cac:PartyName><cbc:Name><![CDATA[VETERINARIAS TOBBY]]></cbc:Name></cac:PartyName><cac:PartyLegalEntity><cbc:RegistrationName><![CDATA[CLÍNICA VETERINARIA TOOBY E.I.R.L]]></cbc:RegistrationName><cac:RegistrationAddress><cbc:ID>030201</cbc:ID><cbc:AddressTypeCode>0000</cbc:AddressTypeCode><cbc:CityName>ANDAHUAYLAS</cbc:CityName><cbc:CountrySubentity>APURIMAC</cbc:CountrySubentity><cbc:District>ANDAHUAYLAS</cbc:District><cac:AddressLine><cbc:Line><![CDATA[AV. PERU NRO. 236 (FRENTE A PARQ LAMPA DE ORO C1P BLANCO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS]]></cbc:Line></cac:AddressLine><cac:Country><cbc:IdentificationCode>PE</cbc:IdentificationCode></cac:Country></cac:RegistrationAddress></cac:PartyLegalEntity></cac:Party></cac:AccountingSupplierParty><cac:AccountingCustomerParty><cac:Party><cac:PartyIdentification><cbc:ID schemeID="1">00000000</cbc:ID></cac:PartyIdentification><cac:PartyLegalEntity><cbc:RegistrationName><![CDATA[cliente varios]]></cbc:RegistrationName><cac:RegistrationAddress><cac:AddressLine><cbc:Line><![CDATA[jr. prueba]]></cbc:Line></cac:AddressLine><cac:Country><cbc:IdentificationCode>PE</cbc:IdentificationCode></cac:Country></cac:RegistrationAddress></cac:PartyLegalEntity><cac:Contact><cbc:Telephone>999999999</cbc:Telephone><cbc:ElectronicMail>cliente@gmail.com</cbc:ElectronicMail></cac:Contact></cac:Party></cac:AccountingCustomerParty><cac:TaxTotal><cbc:TaxAmount currencyID="PEN">7.93</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="PEN">44.07</cbc:TaxableAmount><cbc:TaxAmount currencyID="PEN">7.93</cbc:TaxAmount><cac:TaxCategory><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:LegalMonetaryTotal><cbc:LineExtensionAmount currencyID="PEN">44.07</cbc:LineExtensionAmount><cbc:PayableAmount currencyID="PEN">52.00</cbc:PayableAmount></cac:LegalMonetaryTotal><cac:InvoiceLine><cbc:ID>1</cbc:ID><cbc:InvoicedQuantity unitCode="NIU">1</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="PEN">5.93</cbc:LineExtensionAmount><cac:PricingReference><cac:AlternativeConditionPrice><cbc:PriceAmount currencyID="PEN">7</cbc:PriceAmount><cbc:PriceTypeCode>01</cbc:PriceTypeCode></cac:AlternativeConditionPrice></cac:PricingReference><cac:TaxTotal><cbc:TaxAmount currencyID="PEN">1.07</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="PEN">5.93</cbc:TaxableAmount><cbc:TaxAmount currencyID="PEN">1.07</cbc:TaxAmount><cac:TaxCategory><cbc:Percent>18</cbc:Percent><cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:Item><cbc:Description><![CDATA[pate ricocan cachorro x 330gr]]></cbc:Description></cac:Item><cac:Price><cbc:PriceAmount currencyID="PEN">5.93</cbc:PriceAmount></cac:Price></cac:InvoiceLine><cac:InvoiceLine><cbc:ID>2</cbc:ID><cbc:InvoicedQuantity unitCode="NIU">1</cbc:InvoicedQuantity><cbc:LineExtensionAmount currencyID="PEN">38.14</cbc:LineExtensionAmount><cac:PricingReference><cac:AlternativeConditionPrice><cbc:PriceAmount currencyID="PEN">45</cbc:PriceAmount><cbc:PriceTypeCode>01</cbc:PriceTypeCode></cac:AlternativeConditionPrice></cac:PricingReference><cac:TaxTotal><cbc:TaxAmount currencyID="PEN">6.86</cbc:TaxAmount><cac:TaxSubtotal><cbc:TaxableAmount currencyID="PEN">38.14</cbc:TaxableAmount><cbc:TaxAmount currencyID="PEN">6.86</cbc:TaxAmount><cac:TaxCategory><cbc:Percent>18</cbc:Percent><cbc:TaxExemptionReasonCode>10</cbc:TaxExemptionReasonCode><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory></cac:TaxSubtotal></cac:TaxTotal><cac:Item><cbc:Description><![CDATA[vacuna da2l(3) plus 5(4)]]></cbc:Description></cac:Item><cac:Price><cbc:PriceAmount currencyID="PEN">38.14</cbc:PriceAmount></cac:Price></cac:InvoiceLine></Invoice>'
        // };
        const fileToExport = new Blob([lista[this.contadorXML].cdr.xml], {type: 'text/xml'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(fileToExport);
        a.target = '_blank';
        a.download = lista[this.contadorXML].serieComprobante + '-' + lista[this.contadorXML].numeroComprobante + '.xml';
        a.click();
        this.contadorXML ++;
        timer(2000).subscribe(() => {
          this.saveXml();
        });
      } else {
        console.log('FIN XML');
        resolve();
        return promesa;
      }
    });
  }

}

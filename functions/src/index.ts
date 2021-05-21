/* eslint-disable object-curly-spacing */
/* eslint-disable no-useless-catch */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable require-jsdoc */
/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { RuntimeOptions } from 'firebase-functions';
// import * as moment from 'moment';
admin.initializeApp();
const afs = admin.firestore();

const fetch = require('node-fetch');


/* -------------------------------------------------------------------------- */
/*                            funciones principales                           */
/* -------------------------------------------------------------------------- */
// ANCHOR-GGG
const runtimeOpts: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '128MB'
};

export const testFecha = functions.https.onRequest((request, response) => {
  console.log('================================== TEST FECHAS =======================================');
  console.log('FechaActual usando diaLimaPeru: ', diaLimaPeru());
  console.log('FechaActual formatearDateTime sin parametro', formatearDateTime());
  console.log('FechaActual formatearDateTime con parametro', formatearDateTime('DD-MM-YYYYTHH:mm:ss'));

  assertString('Fecha String: ', '05-04-2014 13:23:25', formatearDateTime('DD-MM-YYYY HH:mm:ss', '2014-4-5 13:23:25'));
  assertString('Fecha Date: ', '2000/12/03 T 13:54:34', formatearDateTime('YYYY/MM/DD T HH:mm:ss', new Date('2000-12-3 13:54:34')));
  assertString('Fecha Second: ', '2021/03/25 T 18:07:48', formatearDateTime('YYYY/MM/DD T HH:mm:ss', {seconds: 1616713668}));
  console.log('================================== END TEST FECHAS =======================================');

  return console.log('Test Fechas exito');
});

export function assertString(testName: string, valor1: string, valor2: string) {
  if (valor1 === valor2) {
    console.log(testName, true);
  } else {
    console.log(testName, `expected: ${valor1}`, `Pero se obtuvo: ${valor2}`);
  }
}

// tslint:disable-next-line: max-line-length
export const activarToProduction = functions.runWith(runtimeOpts).pubsub.schedule('30 19 * * *').timeZone('America/Lima').onRun( async (context) => {
  const apiPeruService = new ApiPeruService();

  /** obtener enviroment de empresa */
  const enviroment = await apiPeruService.obtenerEnviromentFromApisPeru();

  if (enviroment === 'beta'){
    const resp = await apiPeruService.toggleEnviromentEmpresa();

    if (resp === 'produccion'){
      console.log('Enviroment cambiado a: produccion');
    } else {
      console.log('Enviroment sigue en: beta');

    }
  }

  /** si el enviroment es beta, cambiar a proguccion */

  return true;
});

// tslint:disable-next-line: max-line-length
export const dectiveToProduction = functions.runWith(runtimeOpts).pubsub.schedule('30 19 * * *').timeZone('America/Lima').onRun( async (context) => {
  const apiPeruService = new ApiPeruService();

  /** obtener enviroment de empresa */
  const enviroment = await apiPeruService.obtenerEnviromentFromApisPeru();

  if (enviroment === 'produccion'){
    const resp = await apiPeruService.toggleEnviromentEmpresa();

    if (resp === 'beta'){
      console.log('Enviroment cambiado a: Beta');
    } else {
      console.log('Enviroment sigue en: produccion');

    }
  }

  /** si el enviroment es beta, cambiar a proguccion */

  return true;
});






export const sender =  functions.runWith(runtimeOpts).pubsub.schedule('30 19 * * *').timeZone('America/Lima').onRun( async (context) => {

// export const sender = functions.runWith(runtimeOpts).https.onRequest(async (request, response) => {

  console.log('===================================START SEND TO SUNAT==========================================');

  const apiPeruService = new ApiPeruService();

  for (const sede of LISTA_SEDE) {
    console.log(`=================================== ENVIAR SUNAT SEDE: ${sede}======================================`);
    console.log(`=================================== ENVIAR SUNAT SEDE: ${sede}======================================`);

    apiPeruService.setSede(sede);

    const fechaActual = formatearDateTime('DD-MM-YYYY');

    const ArrayDeRespuestas: any[] = [];
    let listaDeVentas: VentaInterface[] = await obtenerVentasPorDia(sede, fechaActual).catch(() => []);
    console.log('lista de ventas', listaDeVentas.length, JSON.stringify(listaDeVentas));

    if (!listaDeVentas.length) {
      const mensaje = `No existen ventas en la sede : ${sede}, el día: ${fechaActual}.`;
      ArrayDeRespuestas.push(mensaje);
    }


    /** ENVIAR COMPROBANTES */
    for (const venta of listaDeVentas) {

      if (venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura') {
        console.log('___ENVIAR COMPROBANTE____________________________________', venta.idVenta);
        const resp: any = await apiPeruService.enviarASunatAdaptador(venta).catch(err => err);
        console.log('*** FIN ENVIAR COMPROBANTE*******************************', resp);

        ArrayDeRespuestas.push(ConstruirMensaje(resp, venta, sede, 'comprobante'));
      }
    }

    listaDeVentas = await obtenerVentasPorDia(sede, fechaActual).catch(() => []);

    /** ENVIAR NOTA DE CREDITO */
    console.log('ENVIAR COMPROBANTES ANULADOS____________________________________________________');
    for (const venta of listaDeVentas) {
      if ((venta.tipoComprobante === 'boleta' || venta.tipoComprobante === 'factura') && venta.estadoVenta === 'anulado') {
        console.log('COMPROBANTE ANULADO: ', venta.idVenta, 'ES UN COMPROBANTE ANULADO');
        const resp: any = await apiPeruService.enviarNotaDeCreditoAdaptador(venta).catch(err => err);
        console.log('*** FIN ENVIAR COMPROBANTE*******************************', resp);

        ArrayDeRespuestas.push(ConstruirMensaje(resp, venta, sede, 'N.CREDITO'));
      }
    }
    console.log('Array de respuesta', ArrayDeRespuestas);

    /** GUARDAR ARRAY DE ERRORES */
    if (ArrayDeRespuestas.length) {
      const respGuarda = await guardarErroresEnVentaPorDia(sede, fechaActual, ArrayDeRespuestas).catch(() => 'fail');
      console.log('GUARDO LAS RESPUESTAS--------------------', respGuarda);
    } else {
      await guardarErroresEnVentaPorDia(sede, fechaActual, ['Comprobantes enviados con exito']).catch(() => 'fail');
    }
  }


  console.log('==================================================', 'END:');

  // /** Descomentar si es http */
  // response.send('succesful timer update');
  // return console.log('successful timer update');

  /** Descomentar si es pubsub */
  return true;

});

export function ConstruirMensaje(input: any, venta: VentaInterface, sede: string, tipoComprobante: string) {
  /** INPUT : string | {success?: boolean, observaciones?: any, typoObs?: string} */

  const fechaActual = formatearDateTime('DD-MM-YYYY');

  /** si es string entonces ocurrio un error */
  if (typeof input === 'string') {
    return `ERROR EN: sede: ${sede}, ${tipoComprobante}: ${venta.serieComprobante}-${venta.numeroComprobante}, ${fechaActual}: ${input}`;
  }

  if (
    input.success
  ) {
    if (!Object.entries(input.observaciones).length && !input.observaciones.length) {
      // exito 100%
      return `EXITO EN: sede: ${sede}, ${tipoComprobante}: ${venta.serieComprobante}-${venta.numeroComprobante}, ${fechaActual}`;
    } else {
      // exito con errores menores
      return {
        mensaje: `EXITO CON ERRORES MENORE: sede: ${sede}, ${tipoComprobante}: ${venta.serieComprobante}-${venta.numeroComprobante}, ${fechaActual}`,
        respuesta: input
      };
    }
  } else {
    return {
      mensaje: `ERROR EN EL CDR OBTENIDO: sede: ${sede}, ${tipoComprobante}: ${venta.serieComprobante}-${venta.numeroComprobante}, ${fechaActual}`,
      respuesta: input
    };
  }

}


// export const pubsubScheduled = functions.pubsub.schedule('every 1 minutes').onRun(context => {
//     console.log('Resource', JSON.stringify(context.resource));
//     return true;
//  });

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                            CONFIGURACION GENERAL                           */
/* -------------------------------------------------------------------------- */
// export const GENERAL_CONFIG = {
//     datosApiPeru: {
//         usuario: 'friendscode',
//         password: 'friends2019peru'
//     },
//     datosEmpresa: {
//         logo: '../../../assets/img/logo_app.png',
//         ruc: '20601831032',
//         razon_social: 'CLÍNICA VETERINARIA TOOBY E.I.R.L',
//         nombreComercial: 'VETERINARIAS TOBBY',
//         token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDk2MTUzMDAsInVzZXJuYW1lIjoiZnJpZW5kc2NvZGUiLCJjb21wYW55IjoiMjA2MDE4MzEwMzIiLCJleHAiOjQ3NjMyMTUzMDB9.JIikuy-l6I74EB5-DNMlFjdqtIhIwR4CDDc10LLuiUuwt3AdxSbpQlgZbIHsGA7cMFAGkhP0trdZVFp40Z35Ayr9fL-JA4NX6Scd6VdnlIBkf2FT32irpGwkY71bEUnjDxGARWGtFnZwhK3MMLWAdjemGrTP25AqtGK8IjkiFZSKQ90toFxpd1Ije6zigRxrkFl0vS6WsFWwHXG-vmCyBqw_i_qE8MVT1zVemas1RZxaDH3UIhCB7mXxZqEUO8QqcmUB8L9OY6tCFOYm_whDjOdkz4GrxdfWMoAQHwDhEhI85k4fwrdynbGyonH1Invcv5xejz0u99geEJmTns9TdqV0dDjhvE4Prqtb53PwRSpJ6Bpo9lIq_YFoMcJk9duXqS2iVNgFDEc3oa35OeM75x0xfrv5i7uIr_JajjQ1-LLz36hJpc1lt9dwAEPrtGoEoSwImGByBZA7yU19cw_3r429-bHMAjnvdF9tPBPJCfVFfW0SYsLfR_UVXoZNzWk1gYDLUvvQw5PtLh6GVGtphy4sSTElZ1-fZ1Q2lmf8Jh8XSdeE4qDfXhW9YHIBUwn99K_9H80Hd8mi2rqJzig4ftudNZtAU0YqLHq6WohTXWNwf9Fob7b66vlwXHawQ6HGoN046kAebuWKBQeYwJFYzfQJOznEtkw5aiJ2wo9hcaU',
//         apisPeruId: 401,
//     },
//     sedes: {
//         andahuaylas: {
//             direccion: {
//                 ubigueo: '030201',
//                 direccion : 'AV. PERU NRO. 236 (FRENTE Al PARQUE LAMPA DE ORO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS',
//                 direccionCorta: 'Av. Peru 236 Andahuaylas Apurimac',
//                 referencia: 'Parque Lampa de Oro',
//                 codigoPais: 'PE',
//                 departamento: 'APURIMAC',
//                 provincia: 'ANDAHUAYLAS',
//                 distrito: 'ANDAHUAYLAS'
//             },
//             telefono: '983905066',
//             caja1: {
//                 boleta: 'B001',
//                 factura: 'F001',
//                 notaVenta: 'NV01'
//             }
//         },
//         abancay: {
//             direccion: {
//                 ubigueo: '030101',
//                 direccion : 'AV.SEOANE NRO. 100 (PARQUE EL OLIVO) APURIMAC - ABANCAY - ABANCAY',
//                 direccionCorta: 'Av. Seoane 100 Abancay Apurimac',
//                 referencia: 'Parque el Olivo',
//                 codigoPais: 'PE',
//                 departamento: 'APURIMAC',
//                 provincia: 'ABANCAY',
//                 distrito: 'ABANCAY'
//             },
//             telefono: '988907777',
//             caja1: {
//                 boleta: 'B002',
//                 factura: 'F002',
//                 notaVenta: 'NV02'
//             }
//         }
//     }
// };

export const GENERAL_CONFIG = {
  datosApiPeru: {
    usuario: 'hz',
    password: '123456'
  },
  datosEmpresa: {
    ruc: '20722440881',
    razon_social: 'EMPRESA DE EJEMPLO E.I.R.L',
    nombreComercial: 'EMPRESA DE EJEMPLO',
    token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDkxNzE3NDQsInVzZXJuYW1lIjoiaHoiLCJjb21wYW55IjoiMjA3MjI0NDA4ODEiLCJleHAiOjQ3NjI3NzE3NDR9.DfrmovRyJGC0UR3FZblxmeUMKDGA5M9_FfFm9SIqCj-JvjTkIz8IqIWNmTnC7nZN2WiXg_yik4rv3vDi29g5d9b-YdKGL05QeSLDLgenD-W9AL3YiE_U0uSrGtPv9PvETwCcn3RoaGG3R9atB28geSPFzkcEccjyJRckyMNYRgZHuq9KLdu6mhKHdCOMhmxcMIt9OIO577QQpQkYljFiY0WC7cSlRjJyTSH2QxDAOfbz-PKOrs2fBJBi2X5cE4JmH0JeHhDikUY1cUcmo3_HOrV-IZk2hn9lcAZ-tfzvIvLeReTpA_quh9UiOs4Xy5Fwo93dj4fbSvRetN5RqylfHpnETzAKSZrj_AhdTmdTPWFZkNkoIB6eazqE7CKmh8URc_xQM3N3WEB-myZPyX8LRQ25xkE1DJKV9zxzuLDiUgi7ggGTQW_pC67uHi0ykeWD2D0KrY4eQanRdecBYfJyZ7LktOe1fUy-vMeBeYsniigVOY2u2s5e1ZG37gOmdDJJX_TC6GCRRfolor1M3z6B1a4UAiSpwGUcYxvKIMl9OgbmO1slCKnyx-S9KccF6PlapEPRkee_blEc4Gq39_sx2Eo6HxSyo27BQ80DpSTj2AsRTFtKVWc5mDvt7CnQLPc8rMJvtqwtrhdNxrVC-FHgItRHsWQ7mTUUYOWo2AcBH3c',
    apisPeruId: 354
  },
  sedes: {
    andahuaylas: {
      direccion: {
        ubigueo: '030201',
        direccion: 'AV. PERU NRO. 236 (FRENTE Al PARQUE LAMPA DE ORO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS',
        codigoPais: 'PE',
        departamento: 'APURIMAC',
        provincia: 'ANDAHUAYLAS',
        distrito: 'ANDAHUAYLAS'
      }
    },
    abancay: {
      direccion: {
        ubigueo: '030101',
        direccion: 'AV.SEOANE NRO. 100 (PARQUE EL OLIVO) APURIMAC - ABANCAY - ABANCAY',
        codigoPais: 'PE',
        departamento: 'APURIMAC',
        provincia: 'ABANCAY',
        distrito: 'ABANCAY'
      }
    }
  }
};



const LISTA_SEDE = ['andahuaylas', 'abancay'];
// const LISTA_SEDE = ['andahuaylas'];
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                              FORMATEAR FECHAS                              */
/* -------------------------------------------------------------------------- */
export function diaLimaPeru() {
  const hoy: string = new Date().toLocaleString('en-GB', {timeZone: 'America/Lima', hour12: false});
  // const hoy: string = new Date().toLocaleString('ar-EG', { timeZone: 'America/Lima', hour12: false });
  return hoy.replace(',', '');
}

export function formatearDateTime(
  formatDateTime: string = 'YYYY-MM-DDTHH:mm:ss',
  DateTime: string | { seconds?: number, nanoseconds?: number } | Date = diaLimaPeru()
): string {
  // console.log('==================================================');
  // console.log(diaLimaPeru());


  if (typeof (DateTime) === 'string') {
    // console.log('FECHA INPUT', DateTime);
    DateTime = formatearFechaString(DateTime);
    // console.log('FECHA FORMATEADA', DateTime);

    if (DateTime === 'INVALID_DATA_TIME') {
      return 'INVALID_DATA_TIME';
    }

    const fechaSalida = formatearFecha(new Date(DateTime), formatDateTime);

    // console.log('FECHA SALIDA', fechaSalida);
    return fechaSalida;
  }

  if (DateTime instanceof Date) {
    if (DateTime.toString() === 'Invalid Date') {
      return 'INVALID_DATA_TIME';
    }
    return formatearFecha(DateTime, formatDateTime);
  }

  if (DateTime.seconds) {
    const fecha = new Date(DateTime.seconds * 1000);

    // TODO, descomentar al subir
    let fecha2 = fecha.toLocaleString('en-GB', {timeZone: 'America/Lima', hour12: false});
    // let fecha2 = fecha.toLocaleString('ar-EG', { timeZone: 'America/Lima', hour12: false });

    fecha2 = fecha2.replace(',', '');
    // return formatearFecha(fecha, formatDateTime);
    return formatearDateTime(formatDateTime, fecha2);
  }
  else {
    return 'INVALID_DATA_TIME';
  }
}

function formatearFecha(fecha: Date, formato: string) {
  // const dia = fecha.getUTCDate();
  // const mes = fecha.getUTCMonth() + 1;
  // const anio = fecha.getUTCFullYear();
  // const hora = fecha.getUTCHours();
  // const minutos = fecha.getUTCMinutes();
  // const segundos = fecha.getUTCSeconds();


  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  const anio = fecha.getFullYear();
  const hora = fecha.getHours();
  const minutos = fecha.getMinutes();
  const segundos = fecha.getSeconds();

  const formatoMes = ((mes <= 9) ? '0' + mes : mes);
  const formatoDia = ((dia <= 9) ? '0' + dia : dia);
  const formatohora = ((hora <= 9) ? '0' + hora : hora);
  const formatominutos = ((minutos <= 9) ? '0' + minutos : minutos);
  const formatosegundos = ((segundos <= 9) ? '0' + segundos : segundos);
  // console.log('arraydia', formatoDia);
  const arrayFecha = [formatoDia, formatoMes, anio, formatohora, formatominutos, formatosegundos];
  const arraTag = ['DD', 'MM', 'YYYY', 'HH', 'mm', 'ss'];
  // tslint:disable-next-line:forin
  for (const index in arrayFecha) {
    // console.log('entra array', index);
    const regex = new RegExp(arraTag[index], 'g'); // correct way
    formato = formato.replace(regex, `${arrayFecha[index]}`);
    // replace(/arraTag[index]/g,`${arrayFecha[index]}`);
  }

  return formato;
}

export function formatearFechaString(DateTime: string) {
  /**
   * INPUTS:
   * DD/MM/YYYY 00:00:00.000
   * DD/MM/YYYYT00:00:00,000
   * YYYY/MM/DD T00:00:00,000
   * YYYY/MM/DD T00:00:00,000
   * YYYY-MM-DD T00:00:00,000
   *
   * OUTPUTS
   * YYYY-MM-DD HH:mm:ss
   * MM-DD-YYYY HH:mm:ss
   * YYYY-MM-DD HH:mm:ss
   */

  DateTime = DateTime.toUpperCase();
  /** Paso 1, separar por ESPACIO O T */
  let dateTimeSplip = DateTime.split(' ');
  if (dateTimeSplip.length === 1) {
    dateTimeSplip = DateTime.split('T');
  }

  if (dateTimeSplip.length === 1) {
    dateTimeSplip[1] = '00:00:00';
  }

  /** Paso 2, separar la fecha por - o / */
  let fecha = dateTimeSplip[0].split('-');
  if (fecha.length === 1) {
    fecha = dateTimeSplip[0].split('/');
  }

  /** Paso 3, si alguna parte de la fecha es string: INVALID_DATA_TIME / */
  for (const fechaItem of fecha) {
    if (isNaN(parseInt(fechaItem, 10))) {
      return 'INVALID_DATA_TIME';
    }
  }

  /** Paso 4, valida y organizar fecha */
  let fechaFinal = '';
  if (fecha[0].length === 4 && fecha[1].length <= 2 && fecha[2].length <= 2) {
    dateTimeSplip[0] = fecha.join('-');
    fechaFinal = dateTimeSplip.join(' ');
  } else if (fecha[2].length === 4 && fecha[1].length <= 2 && fecha[0].length <= 2) {
    const dia = fecha[0];
    fecha[0] = fecha[2];
    fecha[2] = dia;

    dateTimeSplip[0] = fecha.join('-');
    fechaFinal = dateTimeSplip.join(' ');
  }

  if (DatetimeStringIsValid(fechaFinal)) {
    return fechaFinal;
  }
  else {
    return 'INVALID_DATA_TIME';
  }
}

export function DatetimeStringIsValid(dateTime: string): boolean {
  const fecha = new Date(dateTime);
  if (fecha.toString() === 'Invalid Date') {
    return false;
  }
  return true;
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                              REDONDEO DECIMAL                              */
/* -------------------------------------------------------------------------- */
export function redondeoDecimal(numero: number, decimal: number): number {
  decimal = Math.trunc(decimal);
  return Math.round(numero * 10 ** decimal) / 10 ** decimal;
}
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                               MONTO A LETRAS                               */
/* -------------------------------------------------------------------------- */

export function MontoALetras(num: number) {
  const data = {
    numero: num,
    enteros: Math.floor(num),
    centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
    letrasCentavos: '',
    letrasMonedaPlural: 'SOLES', // 'PESOS', 'Dólares', 'Bolívares', 'etcs'
    letrasMonedaSingular: 'SOL', // 'PESO', 'Dólar', 'Bolivar', 'etc'
    letrasMonedaCentavoPlural: 'CÉNTIMOS',
    letrasMonedaCentavoSingular: 'CÉNTIMO'
  };

  if (data.centavos > 0) {
    // Convierte los centimos a letras
    data.letrasCentavos = `CON ${data.centavos}/100 `;
  }

  if (data.enteros === 0) {
    return 'SON CERO ' + data.letrasCentavos + data.letrasMonedaPlural;
  }
  if (data.enteros === 1) {
    if (data.centavos > 0) {
      return 'SON ' + 'UNO' + ' ' + data.letrasCentavos + data.letrasMonedaPlural;
    } else {
      return 'ES ' + 'UN' + ' ' + data.letrasCentavos + data.letrasMonedaSingular;
    }
  } else {
    return 'SON ' + Millones(data.enteros) + ' ' + data.letrasCentavos + data.letrasMonedaPlural;
  }
} // NumeroALetras()

function Unidades(num: number) {

  switch (num) {
    case 1: return 'UN'; // CENTAVOS > 0?'UN0':'UN';
    case 2: return 'DOS';
    case 3: return 'TRES';
    case 4: return 'CUATRO';
    case 5: return 'CINCO';
    case 6: return 'SEIS';
    case 7: return 'SIETE';
    case 8: return 'OCHO';
    case 9: return 'NUEVE';
  }

  return '';
}// Unidades()

function Decenas(num: number): any {

  const decena = Math.floor(num / 10);
  const unidad = num - (decena * 10);

  switch (decena) {
    case 1:
      switch (unidad) {
        case 0: return 'DIEZ';
        case 1: return 'ONCE';
        case 2: return 'DOCE';
        case 3: return 'TRECE';
        case 4: return 'CATORCE';
        case 5: return 'QUINCE';
        default: return 'DIECI' + Unidades(unidad);
      }
    case 2:
      switch (unidad) {
        case 0: return 'VEINTE';
        default: return 'VEINTI' + Unidades(unidad);
      }
    case 3: return DecenasY('TREINTA', unidad);
    case 4: return DecenasY('CUARENTA', unidad);
    case 5: return DecenasY('CINCUENTA', unidad);
    case 6: return DecenasY('SESENTA', unidad);
    case 7: return DecenasY('SETENTA', unidad);
    case 8: return DecenasY('OCHENTA', unidad);
    case 9: return DecenasY('NOVENTA', unidad);
    case 0: return Unidades(unidad);
  }
} // Unidades()

function DecenasY(strSin: string, numUnidades: number) {
  if (numUnidades > 0) {
    return strSin + ' Y ' + Unidades(numUnidades);
  }
  return strSin;
} // DecenasY()

function Centenas(num: number) {
  const centenas = Math.floor(num / 100);
  const decenas = num - (centenas * 100);

  switch (centenas) {
    case 1:
      if (decenas > 0) {
        return 'CIENTO ' + Decenas(decenas);
      }
      return 'CIEN';
    case 2: return 'DOSCIENTOS ' + Decenas(decenas);
    case 3: return 'TRESCIENTOS ' + Decenas(decenas);
    case 4: return 'CUATROCIENTOS ' + Decenas(decenas);
    case 5: return 'QUINIENTOS ' + Decenas(decenas);
    case 6: return 'SEISCIENTOS ' + Decenas(decenas);
    case 7: return 'SETECIENTOS ' + Decenas(decenas);
    case 8: return 'OCHOCIENTOS ' + Decenas(decenas);
    case 9: return 'NOVECIENTOS ' + Decenas(decenas);
  }

  return Decenas(decenas);
}// Centenas()

function Seccion(num: any, divisor: any, strSingular: any, strPlural: any) {
  const cientos = Math.floor(num / divisor);
  const resto = num - (cientos * divisor);

  let letras = '';

  if (cientos > 0) {
    if (cientos > 1) {
      letras = Centenas(cientos) + ' ' + strPlural;
    } else {
      letras = strSingular;
    }
  }

  if (resto > 0) {
    letras += '';
  }

  return letras;
} // Seccion()

function Miles(num: number) {
  const divisor = 1000;
  const cientos = Math.floor(num / divisor);
  const resto = num - (cientos * divisor);

  const strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
  const strCentenas = Centenas(resto);

  if (strMiles === '') {
    return strCentenas;
  }

  return strMiles + ' ' + strCentenas;
}// Miles()

function Millones(num: number) {
  const divisor = 1000000;
  const cientos = Math.floor(num / divisor);
  const resto = num - (cientos * divisor);
  const strMillones = Seccion(num, divisor, 'UN MILLON', 'MILLONES');
  const strMiles = Miles(resto);

  if (strMillones === '') {
    return strMiles;
  }

  return strMillones + ' ' + strMiles;
}// Millones()
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

// ANCHOR -  DATABASE
/* -------------------------------------------------------------------------- */
/*                              FUNCIONES DATABASE                            */
/* -------------------------------------------------------------------------- */

export async function obtenerProductosDeVenta(idProductoVenta: string, sede: string) {
  // console.log('Id de un producto de venta en productVEnta', idProductoVenta);
  return afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('productosVenta').doc(idProductoVenta).get()
    .then((doc: any) => {
      if (doc.exists) {
        return doc.data().productos;
      } else {
        // console.log('No such document!');
        return [];
      }
    }).catch(err => {
      console.log('Error al obtener items de Venta: ', err);
      throw String('fail');
    });
}

export async function obtenerCorrelacionPorTypoComprobante(typoDocumento: string, sede: string) {
  return afs.collection('sedes').doc(sede.toLocaleLowerCase())
    .collection('serie').where('tipoComprobante', '==', typoDocumento).limit(1).get()
    .then((querySnapshot) => {
      let serie: ContadorDeSerieInterface = {};
      querySnapshot.forEach((doc) => {
        serie = { ...doc.data() };
        serie.id = doc.id;
      });
      return serie;
    }).catch(err => {
      console.log('no se pudo obtener serie', err);
      throw String('fail');
    });
}

export async function incrementarCorrelacionTypoDocumento(idSerie: string, sede: string, correlacionActual: number) {

  return afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('serie')
    .doc(idSerie).update({ correlacion: correlacionActual })
    .then(() => 'exito')
    .catch(err => {
      throw String('fail');
    });

}

export async function guardarCDR(idVenta: string, fechaEmision: any, sede: string, cdrVenta: CDRInterface) {

  const fecha = formatearDateTime('DD-MM-YYYY', fechaEmision);

  if (fecha === 'INVALID_DATA_TIME') {
    throw String('La fecha de emision no es valida');
  }

  return afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').doc(idVenta).update({ cdr: cdrVenta })
    .then(() => 'exito').catch(err => {
      console.log('Error al guardar CDR', err);
      throw String('fail');
    });

}

export async function guardarCDRAnulado(
  idVenta: string,
  fechaEmision: any,
  sede: string,
  cdrAnulacion: CDRInterface,
  fechaAnulacion: string,
  DatosSerie: { serie?: string, correlacion?: number }
) {

  const fecha = formatearDateTime('DD-MM-YYYY', fechaEmision);

  if (fecha === 'INVALID_DATA_TIME') {
    throw String('La fecha de emision no es valida');
  }

  const obj = {
    cdr: cdrAnulacion,
    fechaDeAnulacion: fechaAnulacion,
    serie: DatosSerie.serie,
    correlacion: DatosSerie.correlacion
  };

  return afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').doc(idVenta).update({ cdrAnulado: obj })
    .then(() => 'exito').catch(err => {
      throw String('fail');
    });
}

export async function obtenerVentasPorDia(sede: string, fecha: string) {
  return afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas').doc(fecha)
    .collection('ventasDia').get()
    .then((querySnapshot) => {
      const datos: any[] = [];
      querySnapshot.forEach((doc) => {
        // console.log(doc.id, ' => ', doc.data());
        datos.push({ ...doc.data(), idVenta: doc.id });
      });
      return datos;
    }).catch(err => {
      console.log('no se pudo obtener las ventas', err);
      throw String('fail');
    });
}

// NOTE: función especial,
// QUEST: quizá sea necesario incluirlo en el archivo principal
export function guardarErroresEnVentaPorDia(sede: string, fecha: string, ArrayDeErrores: any[]) {
  return afs.collection('sedes').doc(sede.toLocaleLowerCase()).collection('ventas')
    .doc(fecha).set({ ErroresEnVenta: ArrayDeErrores })
    .then(() => 'exito').catch(err => {
      throw String('fail');
    });
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*                               Clase apis peru                              */
/* -------------------------------------------------------------------------- */

class ApiPeruService {
  // STUB -
  sede = '';

  datosDeEmpresaOnFirebase: EmpresaInterface = {};

  datosApiPeru: DatosApiPeruInterface = {};
  datosEmpresa: DatosEmpresaInterface = {};
  sedeDireccion: AddressInterface = {};

  FACTOR_ICBPER = 0.3;

  enviroment = '';

  constructor(
    // private dataApi: DbDataService,
  ) {
    // TODO : DESCOMENTAR LINEA ABAJO
    // this.obtenerDatosDeLaEmpresa();
    // this.sede = storage.datosAdmi.sede.toLocaleLowerCase();
    // this.setApiPeruConfig(GENERAL_CONFIG);
  }

  saludo() {
    return 'hola';
  }

  getSede() {
    return this.sede;
  }

  setSede(sede: string) {
    this.sede = sede.toLowerCase();
    // console.log(JSON.stringify(GENERAL_CONFIG));
    this.setApiPeruConfig(GENERAL_CONFIG);
  }

  setApiPeruConfig(config: ApiPeruConfigInterface) {

    this.datosApiPeru = config.datosApiPeru ?? {};

    this.datosEmpresa = config.datosEmpresa ?? {};

    const sedesFromConfig: any = config.sedes;

    const sedeActual: any = sedesFromConfig[this.sede];

    if (sedeActual.direccion) {
      this.sedeDireccion = this.formatearDireccion(sedeActual.direccion);
    } else {
      this.sedeDireccion = {};
    }

    this.datosEmpresa.telefono = sedeActual.telefono ?? '';
    this.datosEmpresa.email = sedeActual.email ?? '';

    // console.log('SEDE_DIRECCION', JSON.stringify(this.sedeDireccion));

    // console.log('sedeDireccion', this.sedeDireccion);
  }

  formatearDireccion(objDireccion: any): AddressInterface {
    return {
      ubigueo: objDireccion.ubigueo ?? '',
      codigoPais: objDireccion.codigoPais ?? '',
      departamento: objDireccion.departamento ?? '',
      provincia: objDireccion.provincia ?? '',
      distrito: objDireccion.distrito ?? '',
      direccion: objDireccion.direccion ?? '',
    };
  }


  /* -------------------------------------------------------------------------- */
  /*                           configuraciones apiperu                          */
  /* -------------------------------------------------------------------------- */

  async login(){
    /**
     *  @objetivo : obtener un UserToken de apis peru
     *  @note   : Un UserToken tiene una duración de 24 horas.
     *  @nota   : Si llega a apisPeru responde con un resolve
     *  @return : Promesa<{token: string}>
     */

    const myHeaders = {
      'Content-Type': 'application/json'
    };

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
      .then( (tokenResponse: any) => tokenResponse.json())
      // .then(result => result.token)
      .catch((error: any) => {
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

  async obtenerEmpresaPorId(){
    const myHeaders = new Headers();
    myHeaders.append('Authorization', 'Bearer '.concat(await this.obtenerUserApiperuToken()));

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    return fetch(`https://facturacion.apisperu.com/api/v1/companies/${this.datosEmpresa.apisPeruId}`, requestOptions)
      .then((response: any) => response.json())
      .then((apisPeruEmpresa: any) => apisPeruEmpresa)
      .catch((error: any) => {
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
      .then((response: any) => response.json())
      .then((empresaModificada: any) => empresaModificada)
      .catch((error: any) => {
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




  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */



  /* ------------------------------------------------------------------------------------------------ */
  /*                                     ENVIAR COMPROBANTE A SUNAT                                   */
  /* ------------------------------------------------------------------------------------------------ */
  async enviarASunatAdaptador(venta: VentaInterface) {
    if (venta.cdr && venta.cdr?.sunatResponse?.success === true) {
      throw String('ya fue enviado');
    } else {

      if (!venta.idVenta || !venta.idListaProductos) {
        throw String('Venta sin ID o IDlistaProductos');
      }

      let productos: any;
      productos = await this.obtenerProductosDeVenta(venta.idListaProductos).catch(err => err);

      if (productos === 'fail') {
        throw String('Error de Conexion a Intenet, no se encontro lista de productos');
      }

      // console.log('PRODUCTOS_DE_VENTA: ', productos);

      if (!productos.length) {
        throw String(`no se encontro productos por idListaProductos: ${venta.idListaProductos}`);
      }

      venta.listaItemsDeVenta = productos;


      const ventaFormateada: ComprobanteInterface = this.intentarFormatearVenta(venta);
      // const ventaFormateada: ComprobanteInterface = this.formatearVenta(venta);

      // console.log('%cENVIAR COMPROBANTE A SUNAT:', 'color:white; background-color:DodgerBlue;padding:20px');
      // console.log('VENTA_FORMATEADA', JSON.stringify(ventaFormateada));

      const cdrRespuesta = await this.enviarComprobanteASunat(ventaFormateada)
        .catch((error: any) => {
          // console.log('No se envio comprobante a la SUNAT', error);
          return 'fail';
        });

      if (cdrRespuesta === 'fail') {
        throw String('COMPROBANTE NO ENVIADO A SUNAT');
      }

      // console.log('Cdr', JSON.stringify(cdrRespuesta));

      /** ANALISIS DE CDR */
      const cdrStatusForResponse: { success?: boolean, observaciones?: any, typoObs?: string } = {};
      cdrStatusForResponse.success = cdrRespuesta.sunatResponse.success ?? false;

      if (cdrRespuesta.sunatResponse.error) {
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
      ) {
        // console.log('%cOBSERVACIONES:', 'color:white; background-color:red;padding:20px');
        // console.log(JSON.stringify(cdrStatusForResponse.observaciones));
      }

      // un for de tres intentos para guardar cdr
      let seGuardoCdr = '';
      for (let i = 0; i < 3; i++) {

        seGuardoCdr = await this.guardarCDR(venta.idVenta, venta.fechaEmision, cdrRespuesta).then(exito => exito)
          .catch(err => {
            // console.log('err');
            return 'fail';
          });

        if (seGuardoCdr === 'exito') {
          break;
        }
      }

      if (seGuardoCdr === 'fail') {
        // console.log(`Se obtuvo el cdr pero no se pudo guardar, con Success: ${cdrRespuesta.sunatResponse.success}`);
        throw String('NO SE GUARDO EL CDR');
      }

      return cdrStatusForResponse;
      // return 'exito';
    }
  }

  async guardarCDR(idVenta: string, fechaEmision: any, cdrRespuesta: CDRInterface) {
    return guardarCDR(idVenta, fechaEmision, this.sede, cdrRespuesta)
      .then(exito => exito)
      .catch(err => {
        throw err;
      });
  }

  /* ************************************************************************************************ */


  /* ------------------------------------------------------------------------------------------------ */
  /*                                            FORMATEADORES                                         */
  /* ------------------------------------------------------------------------------------------------ */
  // REFACTOR -
  async obtenerProductosDeVenta(idListaProductos: string) {
    if (!idListaProductos) {
      return [];
    }
    return obtenerProductosDeVenta(idListaProductos, this.sede).catch(err => {
      throw err;
    });
  }

  // NOTE - Esta es la función más importante que se encarga de enviar una factura a sunat
  enviarComprobanteASunat(ventaFormateada: ComprobanteInterface) {
    // const myHeaders = new Headers();
    // myHeaders.append('Authorization', 'Bearer '.concat(this.datosEmpresa.token ?? ''));
    // myHeaders.append('Content-Type', 'application/json');

    const myHeaders = {
      Authorization: 'Bearer '.concat(this.datosEmpresa.token ?? ''),
      'Content-Type': 'application/json'
    };

    let raw: string;

    raw = JSON.stringify(ventaFormateada);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/invoice/send', requestOptions)
      .then((response: any) => response.json())
      .then((cdr: any) => cdr)
      .catch((error: any) => {
        throw error;
      });
  }

  intentarFormatearVenta(venta: VentaInterface): ComprobanteInterface {
    try {
      const ventaFormateada = this.formatearVenta(venta);
      if (ventaFormateada.fechaEmision === 'INVALID_DATA_TIME') {
        throw String('FECHA DE EMESION INVALIDO');
      }
      return ventaFormateada;
    } catch (error) {
      throw error;
    }
  }

  formatearVenta(venta: VentaInterface): ComprobanteInterface {

    if (!venta.serieComprobante || !venta.numeroComprobante) {
      throw String('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');
    }

    if (!venta.listaItemsDeVenta) {
      throw String('VENTA INCONSISTE, NO EXISTE ITEMS DE VENTA');
    }

    if (!venta.totalPagarVenta) {
      throw String('VENTA INCONSISTENTE, TOTAL PAGAR VENTA NO DEFINIDO');
    }

    const productFormat = this.formatearDetalles(venta.listaItemsDeVenta);

    let icb: number;
    let cantidaBolsas = 0;
    if (venta.cantidadBolsa && venta.cantidadBolsa > 0) {
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

    ventaFormateada = {
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

    if (icb > 0) {
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

    /** agregar el descuento */
    if (venta.descuentoVenta && venta.descuentoVenta > 0) {

      const descuentos: ChangeInterface[] = [{
        codTipo: '02',
        montoBase: venta.descuentoVenta,
        factor: 1,
        monto: venta.descuentoVenta
      }];

      ventaFormateada.descuentos = descuentos;
    }



    return ventaFormateada;
  }

  obtenerDetalleBolsaGratuita(cantidaBolsas: number): SaleDetailInterface {
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
      icbper: redondeoDecimal(this.FACTOR_ICBPER * cantidaBolsas, 2), /* (cantidad)(factor ICBPER), */
      totalImpuestos: redondeoDecimal(this.FACTOR_ICBPER * cantidaBolsas + igvTotal, 2), /** icbper+igv */
    };

    return detailBolsa;
  }

  formatearDetalles(itemsDeVenta: ItemDeVentaInterface[]): SaleDetailInterface[] {
    const listaFormateda: SaleDetailInterface[] = [];

    for (const itemDeVenta of itemsDeVenta) {
      listaFormateda.push(this.formatearDetalleVenta(itemDeVenta));
    }
    return listaFormateda;
  }

  formatearDetalleVenta(itemDeVenta: ItemDeVentaInterface): SaleDetailInterface {
    if (!itemDeVenta.cantidad || !itemDeVenta.producto?.precio) {
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

  obtenerCodigoComprobante(typoComprobante: string) {

    if (typoComprobante.toLowerCase() === 'factura') {
      return '01';
    } else if (typoComprobante.toLowerCase() === 'boleta') {
      return '03';
    } else {
      // console.log('Comprobante no valido');
      // return 'TYPO COMPROBANTE INVALID';
      throw String('TYPO COMPROBANTE INVALID');
    }
  }

  formatearCliente(cliente: ClienteInterface): ClientInterface {
    if (!cliente.numDoc) {
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

  ObtenerCodigoTipoDoc(typoDoc: string) {
    if (typoDoc === 'dni') {
      return '1';
    } else if (typoDoc === 'ruc') {
      return '6';
    } else {
      throw String('TYPO DE DOCUMENTO DEL CLIENTE INVALIDO');
    }
  }

  formatearEmpresa(empresa: DatosEmpresaInterface, direccion: AddressInterface): CompanyInterface {
    if (!empresa.ruc) {
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

  formatearFormaDePago() {
    return {
      moneda: 'PEN',
      tipo: 'Contado'
    };
  }

  ObtenerCodigoMedida(medida: string) {
    if (!medida) {
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


  /* ************************************************************************************************ */


  /* ------------------------------------------------------------------------------------------------ */
  /*                                      ENVIAR NOTA DE CREDITO                                      */
  /* ------------------------------------------------------------------------------------------------ */
  async enviarNotaDeCreditoAdaptador(venta: VentaInterface) {
    if (venta.cdrAnulado && venta.cdrAnulado?.cdr?.sunatResponse?.success === true) {
      throw String(`Ya se ha emitido la Nota de Credito para el comprobante: ${venta.serieComprobante}-${venta.numeroComprobante}`);
    }

    if (venta.cdr && venta.cdr?.sunatResponse?.success === true) {
      if (!venta.idVenta || !venta.idListaProductos) {
        throw String('Venta sin ID o IDlistaProductos');
      }

      let productos: any;
      productos = await this.obtenerProductosDeVenta(venta.idListaProductos).catch(err => err);

      if (productos === 'fail') {
        throw String('Error de Conexion a Intenet, no se encontro lista de productos');
      }

      // console.log('PRODUCTOS_DE_VENTA: ', productos);

      if (!productos.length) {
        throw String(`no se encontro productos por idListaProductos: ${venta.idListaProductos}`);
      }
      venta.listaItemsDeVenta = productos;

      let DatosSerie: { serie: string, correlacion: number };
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

        if (serie === 'fail') {
          throw String('No se pudo obtener la serie para Nota de Credito');
        }

        IdSerie = serie.id;
        DatosSerie = {
          serie: serie.serie,
          correlacion: serie.correlacion + 1
        };
      }


      // console.log('se usará la correlacion: ', DatosSerie.correlacion);

      // const notaCreditoFormateado = this.formatearNotaDeCredito(venta, DatosSerie);
      const notaCreditoFormateado = this.intentarFormatearNotaDeCredito(venta, DatosSerie);
      // notaCreditoFormateado.formaPago = this.formatearFormaDePago();

      // console.log('%cENVIAR NOTA DE CREDITO FORMATEADO A SUNAT:', 'color:white; background-color:purple;padding:20px');
      // console.log('NOTA DE CREDITO FORMATEADO', JSON.stringify(notaCreditoFormateado));
      const fechaEmisionNotaCredito = notaCreditoFormateado.fechaEmision ?? '';

      const cdrRespuesta = await this.enviarNotaCreditoASunat(notaCreditoFormateado).catch(err => 'fail');


      if (cdrRespuesta === 'fail') {
        throw String('COMPROBANTE NO ENVIADO A SUNAT');
      }

      // console.log('CDR NOTA DE CREDITO', JSON.stringify(cdrRespuesta));


      /** ANALISIS DE CDR */
      const cdrStatusForResponse: { success?: boolean, observaciones?: any, typoObs?: string } = {};
      cdrStatusForResponse.success = cdrRespuesta.sunatResponse.success ?? false;

      if (cdrRespuesta.sunatResponse.error) {
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
      ) {
        // console.log('%cOBSERVACIONES:', 'color:white; background-color:red;padding:20px');
        // console.log(JSON.stringify(cdrStatusForResponse.observaciones));
      }

      let respIncremtarCorrelacion = true;
      // tslint:disable-next-line: no-shadowed-variable
      let guardarCDRAnulado = true;

      if (IdSerie) {
        await (
          this.incrementarCorrelacionNotaCredito(IdSerie, DatosSerie).catch(() => {
            respIncremtarCorrelacion = false;
          }),
          this.guardarCDRAnulado(venta.idVenta, venta.fechaEmision, cdrRespuesta, fechaEmisionNotaCredito, DatosSerie).catch(() => {
            guardarCDRAnulado = false;
          })
        );
        if (!respIncremtarCorrelacion) {
          throw String('NO INCREMENTO LA CORRELACION');
        }
      } else {
        await this.guardarCDRAnulado(venta.idVenta, venta.fechaEmision, cdrRespuesta, fechaEmisionNotaCredito, DatosSerie).catch(() => {
          guardarCDRAnulado = false;
        });
      }

      if (!guardarCDRAnulado) {
        throw String('NO SE GUARDO EL CDR');
      }

      return cdrStatusForResponse;
      return 'exito';

    } else {
      throw String(`El comprobante: ${venta.serieComprobante}-${venta.numeroComprobante}, aun no ha sido enviado a SUNAT`);
    }
  }

  async incrementarCorrelacionNotaCredito(IdSerie: any, DatosSerie: { serie: string, correlacion: number }) {
    let seGuardoCdr: string;
    for (let i = 0; i < 3; i++) {
      seGuardoCdr = await incrementarCorrelacionTypoDocumento(IdSerie, this.sede, DatosSerie.correlacion)
        .catch(() => 'fail');

      if (seGuardoCdr === 'exito') {
        // console.log('SE GUARDO EN EL INTENTO Incrementar: ', i);
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
    DatosSerie?: { serie: string, correlacion: number }
  ) {
    let seGuardoCdr: string;
    for (let i = 0; i < 3; i++) {
      seGuardoCdr = await guardarCDRAnulado(
        idVenta, fechaEmisionVenta, this.sede, cdrRespuesta, fechaEmisionNotaCredito, DatosSerie ?? {})
        .catch(() => 'fail');

      if (seGuardoCdr === 'exito') {
        // console.log('SE GUARDO EN EL INTENTO cdrAnulado: ', i);
        return 'exito';
      }
    }
    throw String('fail');
  }


  async obtenerSerie(typoDocumento: string) {
    const valor = await obtenerCorrelacionPorTypoComprobante(typoDocumento, this.sede)
      .then((serie: any) => serie).catch(() => 'fail');
    // console.log(valor);

    if (valor === 'fail') {
      throw String('fail');
    }

    if (Object.entries(valor).length === 0) {
      throw String('NO SE ENCONTRO SERIE EN BASEDATOS');
    }

    return valor;
  }


  async enviarNotaCreditoASunat(notaCreditoFormateado: NotaDeCreditoInterface) {
    // const myHeaders = new Headers();
    // myHeaders.append('Authorization', 'Bearer '.concat(this.datosEmpresa.token ?? ''));
    // myHeaders.append('Content-Type', 'application/json');

    const myHeaders = {
      Authorization: 'Bearer '.concat(this.datosEmpresa.token ?? ''),
      'Content-Type': 'application/json'
    };

    let raw: string;
    raw = JSON.stringify(notaCreditoFormateado);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    };

    return fetch('https://facturacion.apisperu.com/api/v1/note/send', requestOptions)
      .then((response: any) => response.json())
      .then((cdr: any) => cdr)
      .catch((error: any) => {
        throw error;
      });
  }

  intentarFormatearNotaDeCredito(venta: VentaInterface, serieNotaCred: { serie: string, correlacion: number }): ComprobanteInterface {
    try {
      const ventaFormateada = this.formatearNotaDeCredito(venta, serieNotaCred);
      if (ventaFormateada.fechaEmision === 'INVALID_DATA_TIME') {
        throw String('FECHA DE EMESION INVALIDO');
      }
      return ventaFormateada;
    } catch (error) {
      throw error;
    }
  }

  formatearNotaDeCredito(venta: VentaInterface, serieNotaCred: { serie: string, correlacion: number }): NotaDeCreditoInterface {

    if (!venta.listaItemsDeVenta) {
      throw String('VENTA INCONSISTE, NO EXISTE ITEMS DE VENTA');
    }
    if (!venta.totalPagarVenta) {
      throw String('VENTA INCONSISTENTE, TOTAL PAGAR VENTA NO DEFINIDO');
    }
    if (!venta.serieComprobante || !venta.numeroComprobante) {
      throw String('VENTA INCONSISTENTE, DATOS DE SERIE INVALIDOS');
    }

    const productFormat = this.formatearDetalles(venta.listaItemsDeVenta);


    let icb: number;
    let cantidadBolsas = 0;
    if (venta.cantidadBolsa && venta.cantidadBolsa > 0) {
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
      company: this.formatearEmpresa(this.datosEmpresa, this.sedeDireccion),
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

    if (icb > 0) {
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

  /* ************************************************************************************************ */
}


/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                                 interfaces                                 */
/* -------------------------------------------------------------------------- */

/* ----------- /src/app/services/api/apiPeruInterfaces.ts/* ----------- */

export interface ApiPeruConfigInterface {
  datosApiPeru?: DatosApiPeruInterface;
  datosEmpresa?: DatosEmpresaInterface;
  sedes?: {};
}

export interface DatosApiPeruInterface {
  usuario?: string;
  password?: string;
}

export interface DatosEmpresaInterface {
  ruc?: string; // NOTE: obligatorio
  razon_social?: string; // NOTE: obligatorio
  nombreComercial?: string; // NOTE: obligatorio
  token?: string;
  apisPeruId?: number;
  email?: string;
  telefono?: string;
}

export interface DatosSede {
  direccion: AddressInterface;
}
/* *********** /src/app/services/api/apiPeruInterfaces.ts/ *********** */

/* ----------- ./../../src/app/models/comprobante/comprobante.ts/* ----------- */
// Datos de la interfaz
export interface ComprobanteInterface {
  tipoDoc?: string;
  serie?: string;
  correlativo?: string;
  fechaEmision?: string; //  <date-time>
  client?: ClientInterface;
  company?: CompanyInterface;
  tipoMoneda?: string;
  sumOtrosCargos?: number;
  mtoOperGravadas?: number;
  mtoOperInafectas?: number;
  mtoOperExoneradas?: number;
  mtoOperExportacion?: number;
  mtoIGV?: number;
  mtoISC?: number;
  mtoOtrosTributos?: number;
  icbper?: number;
  mtoImpVenta?: number;
  details?: SaleDetailInterface[];
  legends?: LegendInterface[];
  guias?: DocumentInterface[];
  relDocs?: DocumentInterface[];
  observacion?: string;
  compra?: string;
  mtoBaseIsc?: number;
  mtoBaseOth?: number;
  totalImpuestos?: number;
  ublVersion?: string;   // NOTE - debe inicializarse con '2.1'
  tipoOperacion?: string;
  fecVencimiento?: string; // <date-time>
  sumDsctoGlobal?: number;
  mtoDescuentos?: number;
  mtoOperGratuitas?: number;
  mtoIGVGratuitas?: number;
  totalAnticipos?: number;
  perception?: SalePerceptionInterface;
  guiaEmbebida?: EmbededDespatchInterface;
  anticipos?: PrepaymentInterface[];
  detraccion?: DetractionInterface;
  seller?: ClientInterface;
  direccionEntrega?: AddressInterface;
  descuentos?: ChangeInterface[];
  cargos?: ChangeInterface[];
  mtoCargos?: number;
  valorVenta?: number;
  subTotal?: number;
  formaPago?: PayWayInterface;
}

export interface NotaDeCreditoInterface {
  tipoDoc?: string;
  serie?: string;
  correlativo?: string;
  fechaEmision?: string; // fecha
  client?: ClientInterface;
  company?: CompanyInterface;
  tipoMoneda?: string;
  sumOtrosCargos?: number;
  mtoOperGravadas?: number;
  mtoOperInafectas?: number;
  mtoOperExoneradas?: number;
  mtoOperExportacion?: number;
  mtoIGV?: number;
  mtoISC?: number;
  mtoOtrosTributos?: number;
  icbper?: number;
  mtoImpVenta?: number;
  details?: SaleDetailInterface[];
  legends?: LegendInterface[];
  guias?: DocumentInterface[];
  relDocs?: DocumentInterface[];
  compra?: string;
  mtoBaseIsc?: number;
  mtoBaseOth?: number;
  totalImpuestos?: number;
  ublVersion?: string;
  codMotivo?: string;
  desMotivo?: string;
  tipDocAfectado?: string;
  numDocfectado?: string;
  mtoOperGratuitas?: number;
  perception?: SalePerceptionInterface;
  subTotal?: number;
}

export interface ClientInterface {
  tipoDoc?: string;
  numDoc?: string;
  rznSocial?: string;
  address?: AddressInterface;
  email?: string;
  telephone?: string;
}

export interface CompanyInterface {
  ruc?: string;
  razonSocial?: string;
  nombreComercial?: string;
  address?: AddressInterface;
  email?: string;
  telephone?: string;
}

export interface AddressInterface {
  ubigueo?: string;
  codigoPais?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  urbanizacion?: string;
  direccion?: string;
  codLocal?: string;
}

export interface SaleDetailInterface {
  unidad?: string;
  cantidad?: number;
  codProducto?: string;
  codProdSunat?: string;
  codProdGS1?: string;
  descripcion?: string;
  mtoValorUnitario?: number;
  descuento?: number;
  igv?: number;
  tipAfeIgv?: string;
  isc?: number;
  tipSisIsc?: string;
  totalImpuestos?: number;
  mtoPrecioUnitario?: number;
  mtoValorVenta?: number;
  mtoValorGratuito?: number;
  mtoBaseIgv?: number;
  porcentajeIgv?: number;
  mtoBaseIsc?: number;
  porcentajeIsc?: number;
  mtoBaseOth?: number;
  porcentajeOth?: number;
  otroTributo?: number;
  icbper?: number;
  factorIcbper?: number;
  cargos?: ChangeInterface[];
  descuentos?: ChangeInterface[];
  atributos?: DetailAttributeInterface[];
}

export interface ChangeInterface {
  codTipo?: string;
  factor?: number; /** este era string, quisa debe ser number */
  monto?: number;
  montoBase?: number;
}

export interface DetailAttributeInterface {
  code?: string;
  name?: string;
  value?: string;
  fecInicio?: string; //  <date-time>;
  fecFin?: string; // <date-time>;
  duracion?: number; // Integer
}

export interface LegendInterface {
  code?: string;
  value?: string;
}

export interface DocumentInterface {
  tipoDoc?: string;
  nroDoc?: string;
}

export interface SalePerceptionInterface {
  codReg?: string;
  porcentaje?: number;
  mtoBase?: number;
  mto?: number;
  mtoTotal?: number;
}

export interface EmbededDespatchInterface {
  llegada?: DirectionInterface;
  partida?: DirectionInterface;
  transportista?: ClientInterface;
  nroLicencia?: string;
  transpPlaca?: string;
  transpCodeAuth?: string;
  transpMarca?: string;
  modTraslado?: string;
  pesoBruto?: number;
  undPesoBruto?: string;
}

export interface DirectionInterface {
  ubigueo?: string;
  direccion?: string;
}

export interface PrepaymentInterface {
  tipoDocRel?: string;
  nroDocRel?: string;
  total?: number;
}

export interface DetractionInterface {
  percent?: number;
  mount?: number;
  ctaBanco?: string;
  codMedioPago?: string;
  codBienDetraccion?: string;
  valueRef?: number;
}

export interface PayWayInterface {
  moneda?: string;
  tipo?: string;
  cuotas?: CuotasInterface[];
}

export interface CuotasInterface {
  moneda?: string;
  monto?: number;
  fechaPago?: string; /** Datetime */
}



// expmple:     "formaPago": {
//     "moneda": "PEN",
//     "tipo": "Credito",
//         "monto": 15.92
//   },
//     "cuotas": [
//     {
//       "moneda": "PEN",
//       "monto": 10,
//       "fechaPago": "2020-03-19T11:39:00-05:00"
//     },
//     {
//       "moneda": "PEN",
//       "monto": 5.92,
//       "fechaPago": "2020-04-19T11:39:00-05:00"
//     }
//   ],
// }

/* *********** ./../../src/app/models/comprobante/comprobante.ts/*  *********** */


/* ----------- ./../../src/app/models/api-peru/cdr-interface.ts/* ------------ */

export interface CDRInterface {
  xml?: string;
  hash?: string;
  sunatResponse?: SunatResponseInterface;
}

export interface SunatResponseInterface {
  success?: boolean;
  error?: {
    code?: string;
    message?: string
  };
  cdrZip?: string;
  cdrResponse?: CdrResponseInterface;

}

export interface CdrResponseInterface {
  accepted?: boolean;
  id?: string;
  code?: string;
  description?: string;
  notes?: string[];
}

/* *********** ./../../src/app/models/api-peru/cdr-interface.ts/*  *********** */



/* ----------- ./../../src/app/models/api-peru/empresa.ts/* ----------- */

export interface EmpresaInterface {
  id?: string;
  plan?: string | any;
  environment?: string | any;
  sol_user?: string;
  sol_pass?: string;
  ruc?: string;
  razon_social?: string;
  direccion?: string;
  certificado?: string;
  logo?: string;
  token?: CodeInterface;
}

export interface CodeInterface {
  code: string;
}
/* *********** ./../../src/app/models/api-peru/empresa.ts/*  *********** */


/* ----------- ./../../src/app/models/venta/venta.ts/* ----------- */

export interface VentaInterface {
  idVenta?: string;
  fechaEmision?: string | { seconds?: number, nanoseconds?: number } | Date;
  tipoComprobante?: string;
  serieComprobante?: string;
  numeroComprobante?: string;
  cliente?: ClienteInterface;
  vendedor?: AdmiInterface;
  idListaProductos?: string;
  listaItemsDeVenta?: ItemDeVentaInterface[];
  enviado?: boolean; // true o false
  cdrStatus?: string; // ? NOTE: Este item esta en el cdr ya no se usa
  cdr?: CDRInterface;
  bolsa?: boolean;
  cantidadBolsa?: number;
  tipoPago?: string;
  totalPagarVenta?: number; /** importe obtenido en la venta */
  descuentoVenta?: number; /** diferencia MontoNeto - totalPagarVenta */
  montoNeto?: number; /** Sumatoria de totales de items de venta */
  igv?: number; /** totalPagarVenta - montoBase */
  montoBase?: number; /** 1.18*totalPagarVenta */
  estadoVenta?: 'registrado' | 'anulado' | 'enviado'; // string
  montoPagado?: number; /** Monto con el que pago el cliente */
  // cdrAnulado?: CDRInterface;
  // fechaDeAnulacion?: string|{seconds?: number, nanoseconds?: number }|Date;
  cdrAnulado?: CDRAnuladoInteface;
}

export interface CDRAnuladoInteface {
  cdr?: CDRInterface;
  fechaDeAnulacion?: string | { seconds?: number, nanoseconds?: number } | Date;
  serie?: string;
  correlacion?: number;
}

/* *********** ./../../src/app/models/venta/venta.ts/*  *********** */


/* ----------- ./../../src/app/models/venta/item-de-venta.ts/* ----------- */

export interface ItemDeVentaInterface {
  idProducto?: string; /** NOTE - debe denominarse: idItemVenta */
  producto?: ProductoInterface;

  cantidad?: number;
  /** en caso de que tuviera variantes */
  precio?: number;
  factor?: number;
  medida?: string;

  montoNeto?: number; /** Monto sin descuentos: cantidad*producto.precio */
  descuentoProducto?: number;
  porcentajeDescuento?: number;
  totalxprod?: number; /** Importe por itemDeVenta: montoNeto-Descuento */
}

/* *********** ./../../src/app/models/venta/item-de-venta.ts/*  ********** */


/* ----------- ./../../src/app/models/ProductoInterface.ts/* ------------ */
export interface ProductoInterface {
  id?: string;
  img?: string;
  nombre?: string;
  arrayNombre?: string[];

  cantidad?: number; /** NOTE , numero de unidades en una venta */
  /** la cantidad: se denomina factor y no es necesario */

  precio?: number;
  precioCompra?: number;
  sede?: string;
  medida?: string;    /** Unidad, litros, gramos, kilos */
  cantStock?: number;
  tallas?: any;   // !USAR LUEGO
  nombreTalla?: string;   // !USAR LUEGO
  categoria?: string;
  subCategoria?: string;
  descripcionProducto?: string;
  marca?: string;
  codigo?: string;
  codigoBarra?: string;
  fechaRegistro?: string | { seconds?: number, nanoseconds?: number } | Date;
  fechaDeVencimiento?: string | { seconds?: number, nanoseconds?: number } | Date;
  variantes?: VariantesInterface[];
}

export interface VariantesInterface {
  medida?: string;
  factor?: number;
  precio?: number;
}

/* *********** ./../../src/app/models/ProductoInterface.ts/*  *********** */


/* ----------- ./../../src/app/models/cliente-interface.ts/* ------------ */

export interface ClienteInterface {
  id?: string;
  nombre?: string;
  tipoDoc?: string;
  numDoc?: string;
  direccion?: string;
  email?: string;
  celular?: string;
}

/* *********** ./../../src/app/models/cliente-interface.ts/*  *********** */



/* ----------- ./../../src/app/models/AdmiInterface.ts/* ------------ */

export interface AdmiInterface {
  id?: string;
  correo?: string;
  nombre?: string;
  apellidos?: string;
  foto?: string;
  sede?: string;
  celular?: number | string;
  password?: string;
  dni?: string;
  rol?: string;
  token?: string;
}

/* *********** ./../../src/app/models/AdmiInterface.ts/*  *********** */



/* ----------- ./../../src/app/models/serie.ts/* ------------ */
export interface ContadorDeSerieInterface {
  id?: string; // idSerie NO
  tipoComprobante?: string;
  serie?: string;
  disponible?: boolean;
  correlacion?: number; // Entero
  sede?: number;
}
/* *********** ./../../src/app/models/serie.ts/*  *********** */








/* ----------- ./../../src/app/models/venta/venta.ts/* ------------ */
/* *********** ./../../src/app/models/venta/venta.ts/*  *********** */





/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */


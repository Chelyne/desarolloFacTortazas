import * as moment from 'moment';
import { FECHA_DE_DEPLOY } from '../../config/otherConfig';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';

export function redondeoDecimal(numero: number, decimal: number): number{
    decimal = Math.trunc(decimal); /** Obtiene la parte entera por si DECIMAL no es entero */
    return Math.round(numero * 10 ** decimal) / 10 ** decimal;
}

export function completarCeros(numeracion: string | number, maxCeros = 8): string {
    if (!numeracion) {
        return '0'.repeat(maxCeros);
    }
    numeracion = String(numeracion);
    if (numeracion.length < maxCeros) {
        return '0'.repeat(maxCeros - numeracion.length).concat(numeracion);
    }
    return numeracion;
}


/* -------------------------------------------------------------------------- */
/*                            FORMATEAR FECHA                                 */
/* -------------------------------------------------------------------------- */

export function formatearDateTime(
    formatDateTime: string = 'YYYY-MM-DDTHH:mm:ss',
    DateTime: string|{seconds?: number, nanoseconds?: number }|Date = new Date()
){
    if (typeof(DateTime) === 'string'){
        DateTime = formatearFechaString(DateTime);

        const fecha = Date.parse(DateTime);

        if (!moment(fecha).isValid()){
            return 'INVALID_DATA_TIME';
        }
        return moment(fecha).format(formatDateTime);
    }

    if ( DateTime instanceof Date){
        if (!moment(DateTime).isValid()){
            return 'INVALID_DATA_TIME';
        }
        return moment(DateTime).format(formatDateTime);
    }

    if (!moment.unix(DateTime.seconds).isValid()){
        return 'INVALID_DATA_TIME';
    }

    return moment.unix(DateTime.seconds).format(formatDateTime);
}

export function formatearFechaString(DateTime: string){
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
    /** Paso 1, separar por "ESPACIO" o "T" */
    let dateTimeSplip = DateTime.split(' ');
    if (dateTimeSplip.length === 1){
        dateTimeSplip = DateTime.split('T');
    }

    if (dateTimeSplip.length === 1){
        dateTimeSplip[1] = '00:00:00';
    }

    /** Paso 2, separar la fecha por "-" o "/" */
    let fecha = dateTimeSplip[0].split('-');
    if (fecha.length === 1){
        fecha = dateTimeSplip[0].split('/');
    }

    /** Paso 3, si alguna parte de la fecha es string: INVALID_DATA_TIME / */
    for (const fechaItem of fecha) {
        if (isNaN(parseInt(fechaItem, 10))){
            return 'INVALID_DATA_TIME';
        }
    }

    /** Paso 4, valida y organizar fecha */
    let fechaFinal = '';
    if ( fecha[0].length === 4 && fecha[1].length <= 2 && fecha[2].length <= 2){
        dateTimeSplip[0] = fecha.join('-');
        fechaFinal = dateTimeSplip.join(' ');
    } else if ( fecha[2].length === 4 && fecha[1].length <= 2 && fecha[0].length <= 2){
        const dia = fecha[0];
        fecha[0] = fecha[2];
        fecha[2] = dia;

        dateTimeSplip[0] = fecha.join('-');
        fechaFinal = dateTimeSplip.join(' ');
    }

    if (DatetimeStringIsValid(fechaFinal)){
        return fechaFinal;
    }

    return 'INVALID_DATA_TIME';
}


export function DatetimeStringIsValid(dateTime: string): boolean{
    const fecha = new Date(dateTime);
    if (fecha.toString() === 'Invalid Date'){
        return false;
    }
    return true;
}


// export function formatearDateTime(
//     formatDateTime: string = 'YYYY-MM-DDTHH:mm:ss',
//     DateTime: string|{seconds?: number, nanoseconds?: number }|Date = diaLimaPeru()
// ): string {
//     // console.log('==================================================');
//     // console.log(diaLimaPeru());

//     if (typeof(DateTime) === 'string'){
//         // console.log('FECHA INPUT', DateTime);
//         DateTime = formatearFechaString(DateTime);
//         // console.log('FECHA FORMATEADA', DateTime);

//         if (DateTime === 'INVALID_DATA_TIME'){
//             return 'INVALID_DATA_TIME';
//         }

//         const fechaSalida = formatearFecha(new Date(DateTime), formatDateTime);

//         // console.log('FECHA SALIDA', fechaSalida);
//         return fechaSalida;
//     }

//     if ( DateTime instanceof Date){
//         if (DateTime.toString() === 'Invalid Date'){
//             return 'INVALID_DATA_TIME';
//         }
//         return formatearFecha(DateTime, formatDateTime);
//     }

//     if (DateTime.seconds) {
//         const fecha = new Date(DateTime.seconds * 1000);

//         let fecha2 = fecha.toLocaleString('en-GB', {timeZone: 'America/Lima'});
//         fecha2 = fecha2.replace(',', '');
//         // return formatearFecha(fecha, formatDateTime);
//         return formatearDateTime(formatDateTime, fecha2);
//     }
//     else {
//         return 'INVALID_DATA_TIME';
//     }
// }

// export function diaLimaPeru(){
//     const hoy: string = new Date().toLocaleString('en-GB', {timeZone: 'America/Lima'});
//     return  hoy.replace(',', '');
// }

// function formatearFecha(fecha: Date, formato: string) {
//     // const dia = fecha.getUTCDate();
//     // const mes = fecha.getUTCMonth() + 1;
//     // const anio = fecha.getUTCFullYear();
//     // const hora = fecha.getUTCHours();
//     // const minutos = fecha.getUTCMinutes();
//     // const segundos = fecha.getUTCSeconds();

//     const dia = fecha.getDate();
//     const mes = fecha.getMonth() + 1;
//     const anio = fecha.getFullYear();
//     const hora = fecha.getHours();
//     const minutos = fecha.getMinutes();
//     const segundos = fecha.getSeconds();

//     const formatoMes = ((mes <= 9 ) ? '0' + mes : mes) ;
//     const formatoDia = ((dia <= 9 ) ? '0' + dia : dia) ;
//     const formatohora = ((hora <= 9 ) ? '0' + hora : hora) ;
//     const formatominutos = ((minutos <= 9 ) ? '0' + minutos : minutos) ;
//     const formatosegundos = ((segundos <= 9 ) ? '0' + segundos : segundos) ;
//     // console.log('arraydia', formatoDia);
//     const arrayFecha = [formatoDia, formatoMes, anio, formatohora , formatominutos, formatosegundos];
//     const arraTag = ['DD', 'MM', 'YYYY', 'HH', 'mm', 'ss'];
//     // tslint:disable-next-line:forin
//     for (const index in arrayFecha) {
//         // console.log('entra array', index);
//         const regex =  new RegExp(arraTag[index], 'g'); // correct way
//         formato = formato.replace(regex, `${arrayFecha[index]}`);
//         // replace(/arraTag[index]/g,`${arrayFecha[index]}`);
//     }
//     return formato;
// }

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */


export function MostrarPorcentaje(num: number, max: number){
    const porcentaje = (num / max) * 100;
    const maxStart = 20;
    const numStart = (porcentaje / 100) * maxStart;
    const  diference = maxStart - numStart;

    // console.log(numStart);
    // console.log(diference);
    console.log(`%c${'*'.repeat(numStart)}%c${'_'.repeat(diference)}`,
        'color:white;background-color:green',
        'color:white;background-color:gray',
        ` ${redondeoDecimal(porcentaje, 2)}% `,
        ` ${num}/${max} `,
    );
}

// // TODO editarlo para un futoro uso
// export function CalcularPorcentaje(num: number, max: number){
//     const porcentaje = (num / max) * 100;
//     const maxStart = 20;
//     const numStart = (porcentaje / 100) * maxStart;
//     const  diference = maxStart - numStart;

//     // console.log(numStart);
//     // console.log(diference);
//     console.log(`%c${'*'.repeat(numStart)}%c${'_'.repeat(diference)}`,
//         'color:white;background-color:green',
//         'color:white;background-color:gray',
//         ` ${redondeoDecimal(porcentaje, 2)}% `,
//         ` ${num}/${max} `,
//     );
// }


/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

export function agregarVariantesAItemVenta(listaItemsDeVenta: ItemDeVentaInterface[]): ItemDeVentaInterface[]{
    for (const itemVenta of listaItemsDeVenta) {
        itemVenta.medida =  itemVenta.producto.medida;
        itemVenta.factor =  1;
        itemVenta.precio =  itemVenta.producto.precio;
    }
    return listaItemsDeVenta;
 }

export function esDateVentaMenorFechaDaploy(fechaVenta: string | {seconds?: number, nanoseconds?: number} | Date){
    // venta: VentaInterface;
    // const FECHA_DEPLOY = '24/05/2021 00:00:00';
    // const FECHA_DEPLOY = '2021/05/24';
    return new Date(formatearDateTime('YYYY/MM/DD', fechaVenta)).getTime() <= new Date(FECHA_DE_DEPLOY).getTime();
  }



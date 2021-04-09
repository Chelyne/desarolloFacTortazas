import * as moment from 'moment';

export function redondeoDecimal(numero: number, decimal: number): number{
    decimal = Math.trunc(decimal);
    return Math.round(numero * 10 ** decimal) / 10 ** decimal;
}
export function completarCeros(numeracion: string | number, numCeros = 8): string {
    console.log('num', numeracion);
    if (!numeracion) {
        return '0'.repeat(numCeros);
    }
    numeracion = String (numeracion);
    if (numeracion.length < numCeros) {
        console.log('numeracion', '0'.repeat(numCeros - numeracion.length).concat(numeracion));
        return '0'.repeat(numCeros - numeracion.length).concat(numeracion);
    }
    return numeracion;
}


// export function formatearDateTime(
//     formatDateTime: string = 'YYYY-MM-DDTHH:mm:ss',
//     DateTime: string|{seconds?: number, nanoseconds?: number }|Date = new Date()
// ){
//     if (typeof(DateTime) === 'string'){
//         DateTime = formatearFechaString(DateTime);

//         const fecha = Date.parse(DateTime);

//         if (!moment(fecha).isValid()){
//             return 'INVALID_DATA_TIME';
//         }
//         return moment(fecha).format(formatDateTime);
//     }

//     if ( DateTime instanceof Date){
//         if (!moment(DateTime).isValid()){
//             return 'INVALID_DATA_TIME';
//         }
//         return moment(DateTime).format(formatDateTime);
//     }

//     if (!moment.unix(DateTime.seconds).isValid()){
//         return 'INVALID_DATA_TIME';
//     }
//     return moment.unix(DateTime.seconds).format(formatDateTime);
// }




export function diaLimaPeru(){
    const hoy: string = new Date().toLocaleString('en-GB', {timeZone: 'America/Lima'});
    return  hoy.replace(',', '');
}

export function formatearDateTime(
    formatDateTime: string = 'YYYY-MM-DDTHH:mm:ss',
    DateTime: string|{seconds?: number, nanoseconds?: number }|Date = diaLimaPeru()
){
    // console.log('==================================================');
    // console.log(diaLimaPeru());

    if (typeof(DateTime) === 'string'){
        // console.log('FECHA INPUT', DateTime);
        DateTime = formatearFechaString(DateTime);
        // console.log('FECHA FORMATEADA', DateTime);

        if (DateTime === 'INVALID_DATA_TIME'){
            return 'INVALID_DATA_TIME';
        }

        const fechaSalida = formatearFecha(new Date(DateTime), formatDateTime);

        // console.log('FECHA SALIDA', fechaSalida);
        return fechaSalida;
    }

    if ( DateTime instanceof Date){
        if (DateTime.toString() === 'Invalid Date'){
            return 'INVALID_DATA_TIME';
        }
        return formatearFecha(DateTime, formatDateTime);
    }

    if (DateTime.seconds) {
        const fecha = new Date(DateTime.seconds * 1000);

        let fecha2 = fecha.toLocaleString('en-GB', {timeZone: 'America/Lima'});
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

    const formatoMes = ((mes <= 9 ) ? '0' + mes : mes) ;
    const formatoDia = ((dia <= 9 ) ? '0' + dia : dia) ;
    const formatohora = ((hora <= 9 ) ? '0' + hora : hora) ;
    const formatominutos = ((minutos <= 9 ) ? '0' + minutos : minutos) ;
    const formatosegundos = ((segundos <= 9 ) ? '0' + segundos : segundos) ;
    // console.log('arraydia', formatoDia);
    const arrayFecha = [formatoDia, formatoMes, anio, formatohora , formatominutos, formatosegundos];
    const arraTag = ['DD', 'MM', 'YYYY', 'HH', 'mm', 'ss'];
    // tslint:disable-next-line:forin
    for (const index in arrayFecha) {
        // console.log('entra array', index);
        const regex =  new RegExp(arraTag[index], 'g'); // correct way
        formato = formato.replace(regex, `${arrayFecha[index]}`);
        // replace(/arraTag[index]/g,`${arrayFecha[index]}`);
    }
    return formato;
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
    /** Paso 1, separar por ESPACIO O T */
    let dateTimeSplip = DateTime.split(' ');
    if (dateTimeSplip.length === 1){
        dateTimeSplip = DateTime.split('T');
    }

    if (dateTimeSplip.length === 1){
        dateTimeSplip[1] = '00:00:00';
    }

    /** Paso 2, separar la fecha por - o / */
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
    let fechaFinal: string;
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
    else {
        return 'INVALID_DATA_TIME';
    }
}


export function DatetimeStringIsValid(dateTime: string): boolean{
    const fecha = new Date(dateTime);
    if (fecha.toString() === 'Invalid Date'){
        return false;
    }
    return true;
}




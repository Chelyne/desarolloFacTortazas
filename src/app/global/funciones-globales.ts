import * as moment from 'moment';

export function redondeoDecimal(numero: number, decimal: number): number{
    decimal = Math.trunc(decimal);
    return Math.round(numero * 10 ** decimal) / 10 ** decimal;
}

export function formatearDateTime(
    formatDateTime: string = 'YYYY-MM-DDTHH:mm:ss',
    DateTime: string|{seconds?: number, nanoseconds?: number }|Date = new Date()
){
    if (typeof(DateTime) === 'string'){
        DateTime = formatearFechaString(DateTime);
        if (!moment(DateTime).isValid()){
            return 'INVALID_DATA_TIME';
        }
        return moment(DateTime).format(formatDateTime);
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
     * YYYY-MM-DD...
     * MM-DD-YYYY
     */

    DateTime = DateTime.toUpperCase();
    // Paso 1, separar por ESPACIO O T
    let dateTimeSplip = DateTime.split(' ');
    if (dateTimeSplip.length === 1){
        dateTimeSplip = DateTime.split('T');
    }

    let fecha = dateTimeSplip[0].split('-');
    if (fecha.length === 1){
        fecha = dateTimeSplip[0].split('/');
    }

    for (const fechaItem of fecha) {
        if (isNaN(parseInt(fechaItem, 10))){
            return 'INVALID_DATA_TIME';
        }
    }

    if ( fecha[0].length === 4 && fecha[1].length <= 2 && fecha[2].length <= 2){
        dateTimeSplip[0] = fecha.join('-');
        return dateTimeSplip.join(' ');
    } else if ( fecha[2].length === 4 && fecha[1].length <= 2 && fecha[0].length <= 2){
        const dia = fecha[0];
        fecha[0] = fecha[1];
        fecha[1] = dia;
        dateTimeSplip[0] = fecha.join('-');
        return dateTimeSplip.join(' ');
    } else {
        return 'INVALID_DATA_TIME';
    }
}


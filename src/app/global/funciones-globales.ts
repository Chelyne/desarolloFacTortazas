export function redondeoDecimal(numero: number, decimal: number): number{
    decimal = Math.trunc(decimal);
    return Math.round(numero * 10 ** decimal) / 10 ** decimal;
}


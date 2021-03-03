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



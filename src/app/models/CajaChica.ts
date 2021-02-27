export interface CajaChicaInterface {
    id?: string;
    FechaApertura?: any;
    FechaCierre?: any;
    estado?: string;
    nombreVendedor?: string;
    dniVendedor?: string;
    saldoFinal?: number;
    saldoInicial?: number;
    sede?: string;
    FechaConsulta?: string|{seconds?: number, nanoseconds?: number }|Date;
}

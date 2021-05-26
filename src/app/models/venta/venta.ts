import { CDRInterface } from '../api-peru/cdr-interface';
import { ClienteInterface } from '../cliente-interface';
import { ItemDeVentaInterface } from './item-de-venta';
import { AdmiInterface } from '../AdmiInterface';


export interface VentaInterface {
    idVenta?: string;
    fechaEmision?: string|{seconds?: number, nanoseconds?: number }|Date;
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
    idCajaChica?: string;
}

export interface CDRAnuladoInteface {
    cdr?: CDRInterface;
    fechaDeAnulacion?: string|{seconds?: number, nanoseconds?: number }|Date;
    serie?: string;
    correlacion?: number;
}




import { CDRInterface } from '../api-peru/cdr-interface';
import { ClienteInterface } from '../cliente-interface';
import { ItemDeVentaInterface } from './item-de-venta';
import { AdmiInterface } from '../AdmiInterface';


export interface VentaInterface {
    idVenta?: string;
    fechaEmision?: Date;
    tipoComprobante?: string;
    serieComprobante?: string;
    numeroComprobante?: string;
    cliente?: ClienteInterface;
    vendedor?: AdmiInterface;
    idListaProductos?: string;
    listaItemsDeVenta?: ItemDeVentaInterface[];
    enviado?: boolean; // true o false
    cdrStatus?: string; // ? NOTE: Este item esta en el cdr
    cdr?: CDRInterface;
    bolsa?: boolean;
    tipoPago?: string;
    totalPagarVenta?: number;
    descuentoVenta?: number;
    montoNeto?: number;
    igv?: number;
    montoBase?: number;
}


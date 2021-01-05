import { CDRInterface } from '../api-peru/cdr-interface';
import { ClienteInterface } from '../cliente-interface';
import { ItemDeVentaInterface } from './item-de-venta';
import { AdmiInterface } from '../AdmiInterface';


export interface VentaInterface {
    fechaEmision?: Date;
    idVenta?: string;
    idListaProductos?: string;
    cliente?: ClienteInterface;
    vendedor?: AdmiInterface;
    tipoComprobante?: string;
    serieComprobante?: string;
    numeroComprobante?: string;
    listaItemsDeVenta?: ItemDeVentaInterface[];
    enviado?: boolean; // true o false
    cdrStatus?: string;
    cdr?: CDRInterface;
    bolsa?: boolean;
    tipoPago?: string;
    totalPagarVenta?: number;
    descuentoVenta?: number;
}


import { CDRInterface } from '../api-peru/cdr-interface';
import { ClienteInterface } from '../cliente-interface';
import { ItemDeVentaInterface } from './item-de-venta';


export interface VentaInterface {
    idVenta?: string;
    fechaEmision?: Date;
    tipoComprobante?: string;
    serieComprobante?: string;
    numeroComprobante?: string;
    tipoPago?: string;
    bolsa?: boolean;
    cliente?: ClienteInterface;
    vendedor?: {};
    idListaProductos?: string;
    listaItemsDeVenta?: ItemDeVentaInterface[];
    enviado?: boolean; // true o false
    cdrStatus?: string; // ? NOTE: Este item esta en el cdr
    cdr?: CDRInterface;

    // QUEST: debe elegir entre uno de estos dos
    totalaPagar?: number;
    total?: number;
}


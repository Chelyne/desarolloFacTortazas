import { ItemDeVentaInterface } from './item-de-venta';
import { ClienteInterface } from '../cliente-interface';

export interface VentaInterface {
    fechaEmision?: Date;
    idVenta?: string;
    cliente?: ClienteInterface;
    vendedor?: {};
    tipoComprobante?: string;
    serieComprobante?: string;
    listaItemsDeVenta?: ItemDeVentaInterface[];
    totalaPagar?: number;
    bolsa?: boolean;
    tipoPago?: string;
    total?: number;
}

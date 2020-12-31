import { ClienteInterface } from '../cliente-interface';
import { ItemDeVentaInterface } from './item-de-venta';


export interface VentaInterface {
    fechaEmision?: Date;
    idVenta?: string;
    cliente?: ClienteInterface;
    vendedor?: {};
    tipoComprobante?: string;
    serieComprobante?: string;
    numeroComprobante?: string;
    listaItemsDeVenta?: ItemDeVentaInterface[];
    totalaPagar?: number;
}


import { ItemDeVentaInterface } from './item-de-venta';

export interface VentaInterface {
    fechaEmision?: Date;
    idVenta?: string;
    cliente?: string;
    vendedor?: {};
    tipoComprobante?: string;
    serieComprobante?: string;
    listaItemsDeVenta?: ItemDeVentaInterface[];
    totalaPagar?: number;
}

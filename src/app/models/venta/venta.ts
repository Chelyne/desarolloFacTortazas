import { ItemDeVentaInterface } from './item-de-venta';

export interface VentaInterface {
    idVenta?:string;
    itemsDeVenta?: ItemDeVentaInterface[];
    totalaPagar?: number;
}

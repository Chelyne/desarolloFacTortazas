import { ItemDeVentaInterface } from './item-de-venta';

export interface VentaInterface {
    idVenta?:string;
    listaItemsDeVenta?: ItemDeVentaInterface[];
    totalaPagar?: number;
}

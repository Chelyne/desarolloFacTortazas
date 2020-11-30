import { ItemDeVentaInterface } from './objeto-venta';

export interface VentaInterface {
    idVenta?:string;
    itemsDeVenta?: ItemDeVentaInterface[];
    totalaPagar?: number;
}

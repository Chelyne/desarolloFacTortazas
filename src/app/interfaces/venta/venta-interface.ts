import { ItemDeVentaInterface } from './objeto-venta';

export interface VentaInterface {
    objetosVenta?: ItemDeVentaInterface[];
    totalaPagar?: number;
}

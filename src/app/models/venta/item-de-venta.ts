import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    producto?: ProductoInterface;
    idProducto?: string;
    cantidad?: number;
    totalxprod?: number;
    precioVenta?: number;
}

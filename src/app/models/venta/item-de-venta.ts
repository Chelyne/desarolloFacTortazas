import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    producto?: ProductoInterface;
    idProducto?: string;
    cantidad?: number;
    totalxprod?: number;
    descuentoProducto?: number;
    porcentaje?: number;
    precioVenta?: number;
}


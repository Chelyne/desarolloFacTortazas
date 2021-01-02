import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    producto?: ProductoInterface;
    idProducto?: string;
    cantidad?: number;
    precioVenta?: number;
    tatalxprod?: number;
    porcentaje?: number;
}

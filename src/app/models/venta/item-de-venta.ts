import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    producto?: ProductoInterface;
    idProducto?: string;
    cantidad?: number;
    totalxprod?: number;
    descuentoProducto?: number; // número 1.2, 3.3. 3.5

    porcentaje?: number;
    precioVenta?: number;
}


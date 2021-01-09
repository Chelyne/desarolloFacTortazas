import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    producto?: ProductoInterface;
    idProducto?: string;
    cantidad?: number;
    montoNeto?: number;
    descuentoProducto?: number; // número 1.2, 3.3. 3.5
    porcentajeDescuento?: number;
    totalxprod?: number;
    // precioVenta?: number; //
}


import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    // productos?: any[];
    idProducto?: string;
    producto?: ProductoInterface;
    cantidad?: number;
    montoNeto?: number; /** Monto sin descuentos: cantidad*producto.precio */
    descuentoProducto?: number;
    porcentajeDescuento?: number;
    totalxprod?: number;
    // precioVenta?: number; //
}


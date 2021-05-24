import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    idProducto?: string; /** NOTE - debe denominarse: idItemVenta */
    producto?: ProductoInterface;

    cantidad?: number;

    /** en caso de que tuviera variantes */
    precio?: number;
    factor?: number;
    medida?: string;

    montoNeto?: number; /** Monto sin descuentos: cantidad*producto.precio */
    descuentoProducto?: number;
    porcentajeDescuento?: number;
    totalxprod?: number; /** Importe por itemDeVenta: montoNeto-Descuento */
}


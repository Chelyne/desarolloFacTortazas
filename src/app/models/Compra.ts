import { ProductoInterface } from './ProductoInterface';
import { ProveedorInterface } from './proveedor';

export interface CompraInterface {
    id?: string;
    proveedor?: ProveedorInterface;
    listaItemsDeCompra?: ItemDeCompraInterface[];
    IGV_compra?: number;
    totalxCompra?: number;
    typoComprobante?: string;
    serieComprobante?: string;
    numeroComprobante?: number;
    fechaDeEmision?: string|{seconds?: number, nanoseconds?: number }|Date;
    fechaRegistro?: string|{seconds?: number, nanoseconds?: number }|Date;
    anulado?: boolean;
}

export interface ItemDeCompraInterface {
    id?: string;
    producto?: ProductoInterface;
    pu_compra?: number;
    pu_venta?: number;
    cantidad?: number; // ?NOTE - representa el numero de unidades que se compra;
    descuento?: number;
    totalCompraxProducto?: number;
}


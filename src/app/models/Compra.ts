import { ProductoInterface } from "./ProductoInterface";
import { ProveedorInterface } from "./proveedor";

export interface CompraInterface {
    id?: string;
    proveedor?: ProveedorInterface;
    listaItemsDeCompra?: ItemDeCompraInterface[];
    IGV_compra?: number;
    totalxCompra?: number;
    typoComprobante?: string;
    serieComprobante?: string;
    numeroComprobante?: number;
    fechaDeEmision?: Date;
    fechaRegistro?: Date;
    anulado?: boolean;
}

export interface ItemDeCompraInterface {
    id?: string;
    producto?: ProductoInterface;
    PU_compra?: number;
    cantidad?: number; // ?NOTE - representa el numero de unidades que se compra;
    descuento?: number;
    totalCompraxProducto?: number;
}


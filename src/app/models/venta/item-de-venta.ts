import { ProductoInterface } from '../ProductoInterface';

export interface ItemDeVentaInterface {
    producto?: ProductoInterface;
    idProducto?: string;
    cantidad?: number;
    precioVenta?: number; // QUEST: Que es precio de vento, si producto ya posee un precio
    porcentaje?: number; // QUEST: Que es porcentaje
    totalxprod?: number;
}

import { ProductoInterface } from '../producto';

//TODO CAMBIAR NOMBRE A ItemDeVentaInterface
export interface ItemDeVentaInterface {
    producto?: ProductoInterface;
    idProducto?: string;
    cantidad?: number;
    tatalxprod?: number;
}

export interface ProductoInterface extends ProgressEvent{
    id?: string;
    img?: string;
    nombre?: string;
<<<<<<< HEAD
    cantidad?: number;
    //unidad?: string;
=======
    cantidad?: number; // ?NOTE , numero de unidades en una venta
    unidad?: string; // !quitar
>>>>>>> 013d1bfcad6f9806b37fb6a2a01eca7b378fff5c
    precio?: number;
    sede?: string;
    medida?: string;    // !quitar
    cantStock?: number;
    tallas?: any;   // !quitar
    nombreTalla?: string;   // !quitar
    categoria?: string;
    subCategoria?: string;
    descripcionProducto?: string;

    // id?: string;
    // img?: string;
    // nombre?: string;
    // descripcionProducto?: string;
    // unidad?: string;
    marca?: string;
    // precioVenta?: number;
    // cantidad?: number;//?NOTE , numero de unidades en una venta
    // sede?: string;
    // cantStock?: number;
    // categoria?: string;
    // subCategoria?: string;
    fechaTimeRegistro?: Date;
    fechaDeVencimiento?: Date;

}

export interface ProductoInterface {
    id?: string;
    img?: string;
    nombre?: string;
<<<<<<< HEAD
    cantidad?: number;
    //unidad?: string;
=======
    cantidad?: number; // ?NOTE , numero de unidades en una venta
    unidad?: string; // !quitar
>>>>>>> 93223f58dd4a77a00491f25284e8c840f524d0c9
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

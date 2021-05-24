export interface ProductoInterface {
    id?: string;
    img?: string;
    nombre?: string;
    arrayNombre?: string[];

    cantidad?: number; /** NOTE , numero de unidades en una venta */
    /** la cantidad: se denomina factor y no es necesario */

    precio?: number;
    precioCompra?: number;
    sede?: string;
    medida?: string;    /** Unidad, litros, gramos, kilos */
    cantStock?: number;
    tallas?: any;   // !USAR LUEGO
    nombreTalla?: string;   // !USAR LUEGO
    categoria?: string;
    subCategoria?: string;
    descripcionProducto?: string;
    marca?: string;
    codigo?: string;
    codigoBarra?: string;
    fechaRegistro?: string|{seconds?: number, nanoseconds?: number }|Date;
    fechaDeVencimiento?: string|{seconds?: number, nanoseconds?: number }|Date;
    variantes?: VariantesInterface[];
}

export interface VariantesInterface {
    medida?: string;
    factor?: number;
    precio?: number;
}

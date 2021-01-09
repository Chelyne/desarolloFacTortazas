export interface ProductoInterface {
    id?: string;
    img?: string;
    nombre?: string;
    cantidad?: number; // ?NOTE , numero de unidades en una venta
    precio?: number;
    sede?: string;
    medida?: string;    // Unidad litros gramos kilos
    cantStock?: number;
    tallas?: any;   // !USAR LUEGO
    nombreTalla?: string;   // !USAR LUEGO
    categoria?: string;
    subCategoria?: string;
    descripcionProducto?: string;
    marca?: string;
    codigoBarra?: string;
    fechaTimeRegistro?: Date;
    fechaDeVencimiento?: Date;
}

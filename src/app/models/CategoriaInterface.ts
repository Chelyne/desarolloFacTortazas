export interface CategoriaInterface {
    id?: string;
    img?: string;
    categoria?: string;
    fechaTimeRegistro?: string|{seconds?: number, nanoseconds?: number }|Date;
}

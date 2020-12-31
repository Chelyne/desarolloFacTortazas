export interface ClienteInterface {
    id?: string;
    nombre?: string;
    apellidos?: string;
    tipoDoc?: string;   // ? DNI o RUC u otro
    numDoc?: string;
    dni?: string; // ! quitar
    telefono?: string;
    direccion?: string;
    email?: string;
}

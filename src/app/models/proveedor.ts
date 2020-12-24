export interface ProveedorInterface {
    id?: string;
    nombre ?: string;
    nombreComercial?: string;
    ruc ?: string;  // !quitar
    tipoDocumento?: string; // * agregado
    numeroDocumento ?: string; // * agregado
    pais?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    direccion ?: string;
    telefono ?: string;
    email ?: string;
}

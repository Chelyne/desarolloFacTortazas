export interface ProveedorInterface {
    id?: string;
    nombre ?: string;
    tipoDocumento?: string; // * agregado
    numeroDocumento ?: string; // * agregado
    direccion ?: string;
    telefono ?: string;
    email ?: string;

    // aun no se usan
    pais?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
}

export interface EmpresaInterface {
    id?: string;
    plan?: string|any;
    environment?: string|any;
    sol_user?: string;
    sol_pass?: string;
    ruc?: string;
    razon_social?: string;
    direccion?: string;
    certificado?: string;
    logo?: string;
    token?: CodeInterface;
}

export interface CodeInterface {
    code: string;
}

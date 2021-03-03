import { AddressInterface } from 'src/app/models/comprobante/comprobante';

export interface ApiPeruConfigInterface {
    datosApiPeru?: DatosApiPeruInterface;
    datosEmpresa?: DatosEmpresaInterface;
    sedes?: {};
}

export interface DatosApiPeruInterface {
    usuario?: string;
    password?: string;
}

export interface DatosEmpresaInterface {
    ruc: string;
    razon_social: string;
    nombreComercial: string;
    token: string;
}

export interface DatosSede {
    direccion: AddressInterface;
}

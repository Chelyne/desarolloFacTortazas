// Datos de la interfaz
export interface ComprobanteInterface {
    tipoDoc?: string;
    serie?: string;
    correlativo?: string;
    fechaEmision?: string; //  <date-time>
    client?: ClientInterface;
    company?: CompanyInterface;
    tipoMoneda?: string;
    sumOtrosCargos?: number;
    mtoOperGravadas?: number;
    mtoOperInafectas?: number;
    mtoOperExoneradas?: number;
    mtoOperExportacion?: number;
    mtoIGV?: number;
    mtoISC?: number;
    mtoOtrosTributos?: number;
    icbper?: number;
    mtoImpVenta?: number;
    details?: SaleDetailInterface[];
    legends?: LegendInterface[];
    guias?: DocumentInterface[];
    relDocs?: DocumentInterface[];
    observacion?: string;
    compra?: string;
    mtoBaseIsc?: number;
    mtoBaseOth?: number;
    totalImpuestos?: number;
    ublVersion?: string;   // NOTE - debe inicializarse con '2.1'
    tipoOperacion?: string;
    fecVencimiento?: string; // <date-time>
    sumDsctoGlobal?: number;
    mtoDescuentos?: number;
    mtoOperGratuitas?: number;
    mtoIGVGratuitas?: number;
    totalAnticipos?: number;
    perception?: SalePerceptionInterface;
    guiaEmbebida?: EmbededDespatchInterface;
    anticipos?: PrepaymentInterface[];
    detraccion?: DetractionInterface;
    seller?: ClientInterface;
    direccionEntrega?: AddressInterface;
    descuentos?: ChangeInterface[];
    cargos?: ChangeInterface[];
    mtoCargos?: number;
    valorVenta?: number;
    subTotal?: number;
    formaPago?: PayWayInterface;
}

export interface NotaDeCreditoInterface {
    tipoDoc?: string;
    serie?: string;
    correlativo?: string;
    fechaEmision?: string; // fecha
    client?: ClientInterface;
    company?: CompanyInterface;
    tipoMoneda?: string;
    sumOtrosCargos?: number;
    mtoOperGravadas?: number;
    mtoOperInafectas?: number;
    mtoOperExoneradas?: number;
    mtoOperExportacion?: number;
    mtoIGV?: number;
    mtoISC?: number;
    mtoOtrosTributos?: number;
    icbper?: number;
    mtoImpVenta?: number;
    details?: SaleDetailInterface[];
    legends?: LegendInterface[];
    guias?: DocumentInterface[];
    relDocs?: DocumentInterface[];
    compra?: string;
    mtoBaseIsc?: number;
    mtoBaseOth?: number;
    totalImpuestos?: number;
    ublVersion?: string;
    codMotivo?: string;
    desMotivo?: string;
    tipDocAfectado?: string;
    numDocfectado?: string;
    mtoOperGratuitas?: number;
    perception?: SalePerceptionInterface;
    subTotal?: number;
}

export interface ClientInterface {
    tipoDoc?: string;
    numDoc?: string;
    rznSocial?: string;
    address?: AddressInterface;
    email?: string;
    telephone?: string;
}

export interface CompanyInterface {
    ruc?: string;
    razonSocial?: string;
    nombreComercial?: string;
    address?: AddressInterface;
    email?: string;
    telephone?: string;
}

export interface AddressInterface {
    ubigueo?: string;
    codigoPais?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    urbanizacion?: string;
    direccion?: string;
    codLocal?: string;
}

export interface SaleDetailInterface {
    unidad?: string;
    cantidad?: number;
    codProducto?: string;
    codProdSunat?: string;
    codProdGS1?: string;
    descripcion?: string;
    mtoValorUnitario?: number;
    descuento?: number;
    igv?: number;
    tipAfeIgv?: string;
    isc?: number;
    tipSisIsc?: string;
    totalImpuestos?: number;
    mtoPrecioUnitario?: number;
    mtoValorVenta?: number;
    mtoValorGratuito?: number;
    mtoBaseIgv?: number;
    porcentajeIgv?: number;
    mtoBaseIsc?: number;
    porcentajeIsc?: number;
    mtoBaseOth?: number;
    porcentajeOth?: number;
    otroTributo?: number;
    icbper?: number;
    factorIcbper?: number;
    cargos?: ChangeInterface[];
    descuentos?: ChangeInterface[];
    atributos?: DetailAttributeInterface[];
}

export interface ChangeInterface {
    codTipo?: string;
    factor?: number;
    monto?: number;
    montoBase?: number;
}

export interface DetailAttributeInterface {
    code?: string;
    name?: string;
    value?: string;
    fecInicio?: string; //  <date-time>;
    fecFin?: string; // <date-time>;
    duracion?: number; // Integer
}

export interface LegendInterface {
    code?: string;
    value?: string;
}

export interface DocumentInterface {
    tipoDoc?: string;
    nroDoc?: string;
}

export interface SalePerceptionInterface {
    codReg?: string;
    porcentaje?: number;
    mtoBase?: number;
    mto?: number;
    mtoTotal?: number;
}

export interface EmbededDespatchInterface {
    llegada	?: DirectionInterface;
    partida	?: DirectionInterface;
    transportista?: ClientInterface;
    nroLicencia?: string;
    transpPlaca?: string;
    transpCodeAuth?: string;
    transpMarca?: string;
    modTraslado?: string;
    pesoBruto?: number;
    undPesoBruto?: string;
}

export interface DirectionInterface {
    ubigueo ?: string;
    direccion ?: string;
}

export interface PrepaymentInterface {
    tipoDocRel?: string;
    nroDocRel?: string;
    total?: number;
}

export interface DetractionInterface {
    percent?: number;
    mount?: number;
    ctaBanco?: string;
    codMedioPago?: string;
    codBienDetraccion?: string;
    valueRef?: number;
}

export interface PayWayInterface {
    moneda?: string;
    tipo?: string;
    cuotas?: CuotasInterface[];
}

export interface CuotasInterface {
    moneda?: string;
    monto?: number;
    fechaPago?: string; /** Datetime */
}



// expmple:     "formaPago": {
//     "moneda": "PEN",
//     "tipo": "Credito",
//         "monto": 15.92
//   },
//     "cuotas": [
//     {
//       "moneda": "PEN",
//       "monto": 10,
//       "fechaPago": "2020-03-19T11:39:00-05:00"
//     },
//     {
//       "moneda": "PEN",
//       "monto": 5.92,
//       "fechaPago": "2020-04-19T11:39:00-05:00"
//     }
//   ],
// }


import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';
import { VentaInterface } from 'src/app/models/venta/venta';

/** venta por defecto */
/** NOTE - Se debe verificar que la venta exita y la lista de productos tambien */
export let ventaPorDefecto: VentaInterface;
export let ventaPorDefectoConBolsa: VentaInterface;
export let listaProductosDefecto: {id: string, productos: ItemDeVentaInterface[]};
export let listaProductosDefectoConBolsa: {id: string, productos: ItemDeVentaInterface[]};


ventaPorDefecto = {
    idVenta: '3Ca9C3fvfJbBTWcL4ltY',
    montoBase: 62.71186440677966,
    vendedor: {
        id: 'nerio@gmail.com',
        nombre: 'Nerio',
        token: 'token laptop',
        celular: '910426974',
        correo: 'nerio@gmail.com',
        dni: '70148737',
        password: 'nerio123',
        sede: 'Andahuaylas',
        foto: null,
        rol: 'Administrador',
        apellidos: 'Cañari Huarcaya'
    },
    igv: 11.288135593220339,
    numeroComprobante: '73',
    idListaProductos: 'UYnfoQbRBiV6O7UbRrN5',
    fechaEmision: {
        seconds: 1611774293, /** 27-01-2021 14:04:53 */
        nanoseconds: 0
    },
    cantidadBolsa: 0,
    estadoVenta: 'anulado',
    descuentoVenta: 0,
    tipoComprobante: 'boleta',
    montoNeto: 74,
    montoPagado: 74,
    serieComprobante: 'B001',
    totalPagarVenta: 74,
    bolsa: false,
    tipoPago: 'efectivo',
    cliente: {
        direccion: 'jr. prueba',
        celular: '999999999',
        nombre: 'cliente varios',
        email: 'cliente@gmail.com',
        numDoc: '00000000',
        tipoDoc: 'dni',
        id: '5FwjPZ7ClHegWoQqOQzN'
    }
};

listaProductosDefecto = {
    id: 'UYnfoQbRBiV6O7UbRrN5',
    productos: [
        {
            idProducto: 'zZAKugE3aWzn0FAtLDPP',
            cantidad: 1,
            producto: {
                codigoBarra: null,
                arrayNombre: [
                    'arena',
                    'sanitaria',
                    'gato',
                    '5kg'
                ],
                medida: 'Unidad',
                subCategoria: 'aseo e higiene',
                cantStock: 20,
                cantidad: 1,
                codigo: '401',
                sede: 'Andahuaylas',
                nombre: 'arena sanitaria gato 5kg',
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas22%20oct.%202020%2022%3A09%3A46?alt=media&token=15a3f1a9-c19a-4577-bd32-b1e730b97901',
                categoria: 'petshop',
                descripcionProducto: 'La arena Puffy Cat elimina los malos olores y la formación de bacterias.',
                id: 'zZAKugE3aWzn0FAtLDPP',
                precio: 25
            },
            totalxprod: 25,
            descuentoProducto: 0,
            montoNeto: 25,
            porcentajeDescuento: 0
        },
        {
            producto: {
                cantidad: 1,
                cantStock: -1,
                descripcionProducto: 'Las diferentes formas y tamaños de los cepillos de dientes aportan una higiene dental completa y fácil.\n- Contenido:\n· Pasta de dientes con sabor a menta.\n· 1 Cepillo para el dedo.\n· 1 Cepillo masajeador para el dedo.\n· 1 Cepillo de dientes de dos caras con dos cabezales diferentes. El cepillo pequeño para las molares y el grande para los dientes frontales.',
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas22%20oct.%202020%2022%3A16%3A14?alt=media&token=b20af209-654a-49b2-9947-3046c9a04b53',
                medida: 'Unidad',
                categoria: 'petshop',
                codigo: '713',
                nombre: 'pasta dental 15ml pequeño',
                id: 'yA8Lng5EWoRsg2X5npLd',
                codigoBarra: null,
                arrayNombre: [
                    'pasta',
                    'dental',
                    '15ml',
                    'pequeño'
                ],
                sede: 'Andahuaylas',
                subCategoria: 'aseo e higiene',
                precio: 12
            },
            cantidad: 1,
            idProducto: 'yA8Lng5EWoRsg2X5npLd',
            descuentoProducto: 0,
            totalxprod: 12,
            porcentajeDescuento: 0,
            montoNeto: 12
        },
        {
            montoNeto: 22,
            porcentajeDescuento: 0,
            totalxprod: 22,
            descuentoProducto: 0,
            idProducto: 'wc7oQ7V4jzxWawQQZjFE',
            producto: {
                id: 'wc7oQ7V4jzxWawQQZjFE',
                nombre: 'cepillo doble ovalado grande',
                precio: 22,
                arrayNombre: [
                    'cepillo',
                    'doble',
                    'ovalado',
                    'grande'
                ],
                codigoBarra: null,
                categoria: 'petshop',
                sede: 'Andahuaylas',
                cantidad: 1,
                descripcionProducto: 'Cepillo Doble, Mango Madera Ovalado Para Perro',
                codigo: '763',
                cantStock: 0,
                medida: 'Unidad',
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas22%20oct.%202020%2022%3A22%3A24?alt=media&token=897dd5cf-3e0e-4470-a443-d133546045b3',
                subCategoria: 'aseo e higiene'
            },
            cantidad: 1
        },
        {
            montoNeto: 15,
            producto: {
                cantidad: 1,
                precio: 15,
                nombre: 'pala gato diseño',
                id: 'xGQpHEDO2LlKVr5UlJXL',
                medida: 'Unidad',
                categoria: 'petshop',
                arrayNombre: [
                    'pala',
                    'gato',
                    'diseño'
                ],
                codigo: '973',
                descripcionProducto: 'Pala para sanitario con diseño, de colores con medidas de Largo: 27.5 cm.',
                codigoBarra: null,
                cantStock: 7,
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FxGQpHEDO2LlKVr5UlJXL.jpg?alt=media&token=f5077a91-b40f-4cab-bd46-9283d3e0f3a7',
                subCategoria: 'aseo e higiene',
                sede: 'Andahuaylas'
            },
            cantidad: 1,
            idProducto: 'xGQpHEDO2LlKVr5UlJXL',
            descuentoProducto: 0,
            porcentajeDescuento: 0,
            totalxprod: 15
        }
    ]
};

ventaPorDefectoConBolsa = {
    idVenta: 'qy5FAOwAaF1camugeORq',
    montoBase: 28.8135593220339,
    tipoComprobante: 'boleta',
    totalPagarVenta: 34.899999999999984,
    tipoPago: 'efectivo',
    cliente: {
        email: 'cliente@gmail.com',
        numDoc: '00000000',
        tipoDoc: 'dni',
        celular: '999999999',
        id: '5FwjPZ7ClHegWoQqOQzN',
        direccion: 'jr. prueba',
        nombre: 'cliente varios'
    },
    bolsa: true,
    vendedor: {
        password: 'nerio123',
        correo: 'nerio@gmail.com',
        apellidos: 'Cañari Huarcaya',
        nombre: 'Nerio',
        id: 'nerio@gmail.com',
        token: 'token laptop',
        rol: 'Administrador',
        celular: '910426974',
        dni: '70148737',
        foto: null,
        sede: 'Andahuaylas'
    },
    montoNeto: 34,
    numeroComprobante: '282',
    descuentoVenta: 0,
    igv: 5.1864406779661,
    estadoVenta: 'registrado',
    serieComprobante: 'B001',
    fechaEmision: {
        seconds: 1611771635, /** 27-01-2021 13:20:35 */
        nanoseconds: 0
    },
    cantidadBolsa: 3,
    montoPagado: 34.9,
    idListaProductos: 'YR1evM6WAiIgNs6EzgUa'
};

listaProductosDefectoConBolsa = {
    id: 'YR1evM6WAiIgNs6EzgUa',
    productos: [
        {
            producto: {
                cantStock: 8,
                marca: null,
                nombre: 'ricocat ad carne salmon y leche 1 k',
                codigo: '1147',
                medida: 'Unidad',
                id: 'aVAxk73YlapXrx1dHmBh',
                categoria: 'petshop',
                subCategoria: 'alimentos',
                sede: 'Andahuaylas',
                fechaRegistro: {
                    seconds: 1606392823,
                    nanoseconds: 927000000
                },
                cantidad: 1,
                precio: 8.5,
                codigoBarra: null,
                descripcionProducto: null,
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas12%20dic.%202020%2013%3A59%3A18?alt=media&token=d6b71176-76cc-451f-983c-8e713ae7c3d5',
                fechaDeVencimiento: null,
                arrayNombre: [
                    'ricocat',
                    'ad',
                    'carne',
                    'salmon',
                    'y',
                    'leche',
                    '1',
                    'k'
                ]
            },
            totalxprod: 8.5,
            porcentajeDescuento: 0,
            idProducto: 'aVAxk73YlapXrx1dHmBh',
            descuentoProducto: 0,
            montoNeto: 8.5,
            cantidad: 1
        },
        {
            producto: {
                marca: null,
                fechaRegistro: {
                    seconds: 1606392879,
                    nanoseconds: 51000000
                },
                nombre: 'ricocat ad festival de sabores 500 ',
                fechaDeVencimiento: null,
                categoria: 'petshop',
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas12%20dic.%202020%2014%3A02%3A13?alt=media&token=9af374f4-f00c-4b07-b033-0163a4b4c34a',
                codigo: '871',
                descripcionProducto: null,
                arrayNombre: [
                    'ricocat',
                    'ad',
                    'festival',
                    'de',
                    'sabores',
                    '500',
                    ''
                ],
                subCategoria: 'alimentos',
                id: 'ks9cGgfrJrCifICNucmc',
                cantStock: 0,
                codigoBarra: '7753176003674',
                medida: 'Unidad',
                sede: 'Andahuaylas',
                precio: 4.5,
                cantidad: 1
            },
            montoNeto: 4.5,
            idProducto: 'ks9cGgfrJrCifICNucmc',
            descuentoProducto: 0,
            porcentajeDescuento: 0,
            totalxprod: 4.5,
            cantidad: 1
        },
        {
            descuentoProducto: 0,
            idProducto: 'pOxl0jcUKW5zIckarhTI',
            cantidad: 1,
            montoNeto: 4.5,
            producto: {
                cantStock: 0,
                subCategoria: 'alimentos',
                medida: 'Unidad',
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas12%20dic.%202020%2014%3A01%3A00?alt=media&token=9d76dc5c-ac5a-4dc9-b073-84b9c112b10a',
                id: 'pOxl0jcUKW5zIckarhTI',
                precio: 4.5,
                sede: 'Andahuaylas',
                nombre: 'ricocat pollo sardina y salmon 500 ',
                descripcionProducto: null,
                categoria: 'petshop',
                fechaRegistro: {
                    seconds: 1606392935,
                    nanoseconds: 822000000
                },
                cantidad: 1,
                arrayNombre: [
                    'ricocat',
                    'pollo',
                    'sardina',
                    'y',
                    'salmon',
                    '500',
                    ''
                ]
            },
            porcentajeDescuento: 0,
            totalxprod: 4.5
        },
        {
            totalxprod: 4.5,
            descuentoProducto: 0,
            porcentajeDescuento: 0,
            cantidad: 1,
            producto: {
                descripcionProducto: null,
                precio: 4.5,
                categoria: 'petshop',
                cantidad: 1,
                fechaRegistro: {
                    seconds: 1606392997,
                    nanoseconds: 227000000
                },
                id: 'RsP5reZ2oYch5xynOa4Z',
                medida: 'Unidad',
                subCategoria: 'alimentos',
                arrayNombre: [
                    'ricocat',
                    'atun',
                    'sardina',
                    'y',
                    'trucha',
                    '500',
                    'g'
                ],
                nombre: 'ricocat atun sardina y trucha 500 g',
                cantStock: 0,
                sede: 'Andahuaylas',
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas12%20dic.%202020%2011%3A45%3A23?alt=media&token=7c682372-6b6f-426f-b821-877e7f23f581'
            },
            idProducto: 'RsP5reZ2oYch5xynOa4Z',
            montoNeto: 4.5
        },
        {
            montoNeto: 4.5,
            descuentoProducto: 0,
            cantidad: 1,
            producto: {
                categoria: 'petshop',
                arrayNombre: [
                    'ricocat',
                    'carne',
                    'salmon',
                    'y',
                    'leche',
                    '500',
                    'gr'
                ],
                sede: 'Andahuaylas',
                fechaRegistro: {
                    seconds: 1606393039,
                    nanoseconds: 542000000
                },
                medida: 'Unidad',
                fechaDeVencimiento: null,
                codigoBarra: '7753176003698',
                marca: null,
                descripcionProducto: null,
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas12%20dic.%202020%2014%3A03%3A03?alt=media&token=ff0c323b-5588-49eb-bba8-caf56b995994',
                subCategoria: 'alimentos',
                precio: 4.5,
                codigo: null,
                cantStock: 0,
                id: 'VoSpfy9AljFxadAgPadX',
                nombre: 'ricocat carne salmon y leche 500 gr',
                cantidad: 1
            },
            idProducto: 'VoSpfy9AljFxadAgPadX',
            porcentajeDescuento: 0,
            totalxprod: 4.5
        },
        {
            descuentoProducto: 0,
            porcentajeDescuento: 0,
            montoNeto: 7.5,
            idProducto: 'QKdBYbYwUjAWK3kEMJDV',
            cantidad: 1,
            totalxprod: 7.5,
            producto: {
                categoria: 'petshop',
                id: 'QKdBYbYwUjAWK3kEMJDV',
                img: 'https://firebasestorage.googleapis.com/v0/b/tooby-app.appspot.com/o/productos%2FAndahuaylas12%20dic.%202020%2014%3A08%3A24?alt=media&token=d3618b74-e8f1-496b-bedb-1436a338cd9e',
                cantidad: 1,
                marca: null,
                medida: 'Unidad',
                arrayNombre: [
                    'mimaskot',
                    'raza',
                    'peque',
                    'carne',
                    'pollo',
                    '1',
                    'k'
                ],
                nombre: 'mimaskot raza peque carne pollo 1 k',
                cantStock: 0,
                fechaDeVencimiento: null,
                subCategoria: 'alimentos',
                codigoBarra: null,
                codigo: '1152',
                fechaRegistro: {
                    seconds: 1606393100,
                    nanoseconds: 108000000
                },
                sede: 'Andahuaylas',
                descripcionProducto: null,
                precio: 7.5
            }
        }
    ]
};

/** VENTAS FORMATEADAS PARA HACER TEST */
export let ventaDefaultFormateada: any;
export let ventaDefaultFormateadaBolsa: any;
export let notaCreditoDftlFormateada: any;
export let notaCreditoDftlBolssaFormateada: any;

ventaDefaultFormateada = {
    ublVersion: '2.1',
    tipoOperacion: '0101',
    tipoDoc: '03',
    serie: 'B001',
    correlativo: '73',
    fechaEmision: '2021-01-27T14:04:53-05:00',
    tipoMoneda: 'PEN',
    client: {
        tipoDoc: '1',
        numDoc: '00000000',
        rznSocial: 'cliente varios',
        address: {
            direccion: 'jr. prueba'
        },
        email: 'cliente@gmail.com',
        telephone: '999999999'
    },
    company: {
        ruc: '20722440881',
        nombreComercial: 'EMPRESA DE EJEMPLO',
        razonSocial: 'EMPRESA DE EJEMPLO E.I.R.L',
        address: {
            ubigueo: '030201',
            codigoPais: 'PE',
            departamento: 'APURIMAC',
            provincia: 'ANDAHUAYLAS',
            distrito: 'ANDAHUAYLAS',
            direccion: 'AV. PERU NRO. 236 (FRENTE Al PARQUE LAMPA DE ORO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'
        },
        email: '',
        telephone: ''
    },
    mtoOperGravadas: 62.71,
    mtoIGV: 11.29,
    // icbper: 0,
    totalImpuestos: 11.29,
    valorVenta: 62.71,
    mtoImpVenta: 74,
    subTotal: 74,
    formaPago: {
        moneda: 'PEN',
        tipo: 'Contado'
    },
    details: [
        {
            unidad: 'NIU',
            descripcion: 'arena sanitaria gato 5kg',
            cantidad: 1,
            mtoBaseIgv: 21.19,
            porcentajeIgv: 18,
            igv: 3.81,
            tipAfeIgv: '10',
            totalImpuestos: 3.81,
            mtoValorVenta: 21.19,
            mtoValorUnitario: 21.19,
            mtoPrecioUnitario: 25
        },
        {
            unidad: 'NIU',
            descripcion: 'pasta dental 15ml pequeño',
            cantidad: 1,
            mtoBaseIgv: 10.17,
            porcentajeIgv: 18,
            igv: 1.83,
            tipAfeIgv: '10',
            totalImpuestos: 1.83,
            mtoValorVenta: 10.17,
            mtoValorUnitario: 10.17,
            mtoPrecioUnitario: 12
        },
        {
            unidad: 'NIU',
            descripcion: 'cepillo doble ovalado grande',
            cantidad: 1,
            mtoBaseIgv: 18.64,
            porcentajeIgv: 18,
            igv: 3.36,
            tipAfeIgv: '10',
            totalImpuestos: 3.36,
            mtoValorVenta: 18.64,
            mtoValorUnitario: 18.64,
            mtoPrecioUnitario: 22
        },
        {
            unidad: 'NIU',
            descripcion: 'pala gato diseño',
            cantidad: 1,
            mtoBaseIgv: 12.71,
            porcentajeIgv: 18,
            igv: 2.29,
            tipAfeIgv: '10',
            totalImpuestos: 2.29,
            mtoValorVenta: 12.71,
            mtoValorUnitario: 12.71,
            mtoPrecioUnitario: 15
        }
    ],
    legends: [
        {
            code: '1000',
            value: 'SON SETENTA Y CUATRO SOLES'
        }
    ]
};

ventaDefaultFormateadaBolsa = {
    ublVersion: '2.1',
    tipoOperacion: '0101',
    tipoDoc: '03',
    serie: 'B001',
    correlativo: '282',
    fechaEmision: '2021-01-27T13:20:35-05:00',
    tipoMoneda: 'PEN',
    client: {
        tipoDoc: '1',
        numDoc: '00000000',
        rznSocial: 'cliente varios',
        address: {
            direccion: 'jr. prueba'
        },
        email: 'cliente@gmail.com',
        telephone: '999999999'
    },
    company: {
        ruc: '20722440881',
        nombreComercial: 'EMPRESA DE EJEMPLO',
        razonSocial: 'EMPRESA DE EJEMPLO E.I.R.L',
        address: {
            ubigueo: '030201',
            codigoPais: 'PE',
            departamento: 'APURIMAC',
            provincia: 'ANDAHUAYLAS',
            distrito: 'ANDAHUAYLAS',
            direccion: 'AV. PERU NRO. 236 (FRENTE Al PARQUE LAMPA DE ORO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'
        },
        email: '',
        telephone: ''
    },
    mtoOperGravadas: 28.81,
    mtoIGV: 5.19,
    valorVenta: 28.81,
    mtoImpVenta: 34.9,
    subTotal: 34.9,
    formaPago: {
        moneda: 'PEN',
        tipo: 'Contado'
    },
    details: [
        {
            unidad: 'NIU',
            descripcion: 'ricocat ad carne salmon y leche 1 k',
            cantidad: 1,
            mtoBaseIgv: 7.2,
            porcentajeIgv: 18,
            igv: 1.3,
            tipAfeIgv: '10',
            totalImpuestos: 1.3,
            mtoValorVenta: 7.2,
            mtoValorUnitario: 7.2,
            mtoPrecioUnitario: 8.5
        },
        {
            unidad: 'NIU',
            descripcion: 'ricocat ad festival de sabores 500 ',
            cantidad: 1,
            mtoBaseIgv: 3.81,
            porcentajeIgv: 18,
            igv: 0.69,
            tipAfeIgv: '10',
            totalImpuestos: 0.69,
            mtoValorVenta: 3.81,
            mtoValorUnitario: 3.81,
            mtoPrecioUnitario: 4.5
        },
        {
            unidad: 'NIU',
            descripcion: 'ricocat pollo sardina y salmon 500 ',
            cantidad: 1,
            mtoBaseIgv: 3.81,
            porcentajeIgv: 18,
            igv: 0.69,
            tipAfeIgv: '10',
            totalImpuestos: 0.69,
            mtoValorVenta: 3.81,
            mtoValorUnitario: 3.81,
            mtoPrecioUnitario: 4.5
        },
        {
            unidad: 'NIU',
            descripcion: 'ricocat atun sardina y trucha 500 g',
            cantidad: 1,
            mtoBaseIgv: 3.81,
            porcentajeIgv: 18,
            igv: 0.69,
            tipAfeIgv: '10',
            totalImpuestos: 0.69,
            mtoValorVenta: 3.81,
            mtoValorUnitario: 3.81,
            mtoPrecioUnitario: 4.5
        },
        {
            unidad: 'NIU',
            descripcion: 'ricocat carne salmon y leche 500 gr',
            cantidad: 1,
            mtoBaseIgv: 3.81,
            porcentajeIgv: 18,
            igv: 0.69,
            tipAfeIgv: '10',
            totalImpuestos: 0.69,
            mtoValorVenta: 3.81,
            mtoValorUnitario: 3.81,
            mtoPrecioUnitario: 4.5
        },
        {
            unidad: 'NIU',
            descripcion: 'mimaskot raza peque carne pollo 1 k',
            cantidad: 1,
            mtoBaseIgv: 6.36,
            porcentajeIgv: 18,
            igv: 1.14,
            tipAfeIgv: '10',
            totalImpuestos: 1.14,
            mtoValorVenta: 6.36,
            mtoValorUnitario: 6.36,
            mtoPrecioUnitario: 7.5
        },
        {
            unidad: 'NIU',
            descripcion: 'BOLSA DE PLASTICO',
            cantidad: 3,
            mtoValorUnitario: 0,
            mtoValorGratuito: 0.05,
            mtoValorVenta: 0.15,
            mtoBaseIgv: 0.15,
            porcentajeIgv: 18,
            igv: 0.03,
            tipAfeIgv: '13',
            factorIcbper: 0.3,
            icbper: 0.9,
            totalImpuestos: 0.93
        }
    ],
    legends: [
        {
            code: '1000',
            value: 'SON TREINTA Y CUATRO CON 90/100 SOLES'
        }
    ],
    icbper: 0.9,
    mtoOperGratuitas: 0.15,
    mtoIGVGratuitas: 0.03,
    totalImpuestos: 6.09
};

notaCreditoDftlFormateada = {
    ublVersion: '2.1',
    tipoDoc: '07',
    serie: 'BC01',
    correlativo: '4',
    fechaEmision: '2021-04-06T18:21:41-05:00',
    tipDocAfectado: '03',
    numDocfectado: 'B001-73',
    codMotivo: '06',
    desMotivo: 'DEVOLUCION TOTAL',
    tipoMoneda: 'PEN',
    client: {
        tipoDoc: '1',
        numDoc: '00000000',
        rznSocial: 'cliente varios',
        address: {
            direccion: 'jr. prueba'
        },
        email: 'cliente@gmail.com',
        telephone: '999999999'
    },
    company: {
        ruc: '20722440881',
        nombreComercial: 'EMPRESA DE EJEMPLO',
        razonSocial: 'EMPRESA DE EJEMPLO E.I.R.L',
        address: {
            ubigueo: '030201',
            codigoPais: 'PE',
            departamento: 'APURIMAC',
            provincia: 'ANDAHUAYLAS',
            distrito: 'ANDAHUAYLAS',
            direccion: 'AV. PERU NRO. 236 (FRENTE Al PARQUE LAMPA DE ORO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'
        },
        email: '',
        telephone: ''
    },
    mtoOperGravadas: 62.71,
    mtoIGV: 11.29,
    // icbper: 0,
    totalImpuestos: 11.29,
    mtoImpVenta: 74,
    subTotal: 74,
    // formaPago: {
    //     moneda: 'PEN',
    //     tipo: 'Contado'
    // },
    details: [
        {
            unidad: 'NIU',
            descripcion: 'arena sanitaria gato 5kg',
            cantidad: 1,
            mtoBaseIgv: 21.19,
            porcentajeIgv: 18,
            igv: 3.81,
            tipAfeIgv: '10',
            totalImpuestos: 3.81,
            mtoValorVenta: 21.19,
            mtoValorUnitario: 21.19,
            mtoPrecioUnitario: 25
        },
        {
            unidad: 'NIU',
            descripcion: 'pasta dental 15ml pequeño',
            cantidad: 1,
            mtoBaseIgv: 10.17,
            porcentajeIgv: 18,
            igv: 1.83,
            tipAfeIgv: '10',
            totalImpuestos: 1.83,
            mtoValorVenta: 10.17,
            mtoValorUnitario: 10.17,
            mtoPrecioUnitario: 12
        },
        {
            unidad: 'NIU',
            descripcion: 'cepillo doble ovalado grande',
            cantidad: 1,
            mtoBaseIgv: 18.64,
            porcentajeIgv: 18,
            igv: 3.36,
            tipAfeIgv: '10',
            totalImpuestos: 3.36,
            mtoValorVenta: 18.64,
            mtoValorUnitario: 18.64,
            mtoPrecioUnitario: 22
        },
        {
            unidad: 'NIU',
            descripcion: 'pala gato diseño',
            cantidad: 1,
            mtoBaseIgv: 12.71,
            porcentajeIgv: 18,
            igv: 2.29,
            tipAfeIgv: '10',
            totalImpuestos: 2.29,
            mtoValorVenta: 12.71,
            mtoValorUnitario: 12.71,
            mtoPrecioUnitario: 15
        }
    ],
    legends: [
        {
            code: '1000',
            value: 'SON SETENTA Y CUATRO SOLES'
        }
    ]
};

notaCreditoDftlBolssaFormateada = {
    ublVersion: '2.1',
    tipoDoc: '07',
    serie: 'BC01',
    correlativo: '4',
    fechaEmision: '2021-04-07T16:56:25-05:00',
    tipDocAfectado: '03',
    numDocfectado: 'B001-282',
    codMotivo: '06',
    desMotivo: 'DEVOLUCION TOTAL',
    tipoMoneda: 'PEN',
    client: {
        tipoDoc: '1',
        numDoc: '00000000',
        rznSocial: 'cliente varios',
        address: {
            direccion: 'jr. prueba'
        },
        email: 'cliente@gmail.com',
        telephone: '999999999'
    },
    company: {
        ruc: '20722440881',
        nombreComercial: 'EMPRESA DE EJEMPLO',
        razonSocial: 'EMPRESA DE EJEMPLO E.I.R.L',
        address: {
            ubigueo: '030201',
            codigoPais: 'PE',
            departamento: 'APURIMAC',
            provincia: 'ANDAHUAYLAS',
            distrito: 'ANDAHUAYLAS',
            direccion: 'AV. PERU NRO. 236 (FRENTE Al PARQUE LAMPA DE ORO) APURIMAC - ANDAHUAYLAS - ANDAHUAYLAS'
        },
        email: '',
        telephone: ''
    },
    mtoOperGravadas: 28.81,
    mtoIGV: 5.19,
    totalImpuestos: 6.09,
    mtoImpVenta: 34.9,
    subTotal: 34.9,
    // formaPago: {
    //     moneda: 'PEN',
    //     tipo: 'Contado'
    // },
    details: [
        {
          unidad: 'NIU',
          descripcion: 'ricocat ad carne salmon y leche 1 k',
          cantidad: 1,
          mtoBaseIgv: 7.2,
          porcentajeIgv: 18,
          igv: 1.3,
          tipAfeIgv: '10',
          totalImpuestos: 1.3,
          mtoValorVenta: 7.2,
          mtoValorUnitario: 7.2,
          mtoPrecioUnitario: 8.5
        },
        {
          unidad: 'NIU',
          descripcion: 'ricocat ad festival de sabores 500 ',
          cantidad: 1,
          mtoBaseIgv: 3.81,
          porcentajeIgv: 18,
          igv: 0.69,
          tipAfeIgv: '10',
          totalImpuestos: 0.69,
          mtoValorVenta: 3.81,
          mtoValorUnitario: 3.81,
          mtoPrecioUnitario: 4.5
        },
        {
          unidad: 'NIU',
          descripcion: 'ricocat pollo sardina y salmon 500 ',
          cantidad: 1,
          mtoBaseIgv: 3.81,
          porcentajeIgv: 18,
          igv: 0.69,
          tipAfeIgv: '10',
          totalImpuestos: 0.69,
          mtoValorVenta: 3.81,
          mtoValorUnitario: 3.81,
          mtoPrecioUnitario: 4.5
        },
        {
          unidad: 'NIU',
          descripcion: 'ricocat atun sardina y trucha 500 g',
          cantidad: 1,
          mtoBaseIgv: 3.81,
          porcentajeIgv: 18,
          igv: 0.69,
          tipAfeIgv: '10',
          totalImpuestos: 0.69,
          mtoValorVenta: 3.81,
          mtoValorUnitario: 3.81,
          mtoPrecioUnitario: 4.5
        },
        {
          unidad: 'NIU',
          descripcion: 'ricocat carne salmon y leche 500 gr',
          cantidad: 1,
          mtoBaseIgv: 3.81,
          porcentajeIgv: 18,
          igv: 0.69,
          tipAfeIgv: '10',
          totalImpuestos: 0.69,
          mtoValorVenta: 3.81,
          mtoValorUnitario: 3.81,
          mtoPrecioUnitario: 4.5
        },
        {
          unidad: 'NIU',
          descripcion: 'mimaskot raza peque carne pollo 1 k',
          cantidad: 1,
          mtoBaseIgv: 6.36,
          porcentajeIgv: 18,
          igv: 1.14,
          tipAfeIgv: '10',
          totalImpuestos: 1.14,
          mtoValorVenta: 6.36,
          mtoValorUnitario: 6.36,
          mtoPrecioUnitario: 7.5
        },
        {
          unidad: 'NIU',
          descripcion: 'BOLSA DE PLASTICO',
          cantidad: 3,
          mtoValorUnitario: 0,
          mtoValorGratuito: 0.05,
          mtoValorVenta: 0.15,
          mtoBaseIgv: 0.15,
          porcentajeIgv: 18,
          igv: 0.03,
          tipAfeIgv: '13',
          factorIcbper: 0.3,
          icbper: 0.9,
          totalImpuestos: 0.93
        }
      ],
    legends: [
        {
            code: '1000',
            value: 'SON TREINTA Y CUATRO CON 90/100 SOLES'
        }
    ],
    icbper: 0.9,
    mtoOperGratuitas: 0.15
};

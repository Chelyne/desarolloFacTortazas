import { ProductoInterface } from '../models/ProductoInterface';

/* -------------------------------------------------------------------------- */
/*                               simplificadores                              */
/* -------------------------------------------------------------------------- */
export function SimplificarProducto(producto: ProductoInterface): ProductoInterface{
    return {
        id: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio,
        precioCompra: producto.precioCompra,
        sede: producto.sede ,
        medida: producto.medida,
        cantStock: producto.cantStock,
        categoria: producto.categoria,
        subCategoria: producto.subCategoria,
        marca: producto.marca,
        codigo: producto.codigo,
        codigoBarra: producto.codigoBarra,
        fechaDeVencimiento: producto.fechaDeVencimiento,
        variantes: producto.variantes,
    };
}

export function SimplificarProductoParaItemVenta(producto: ProductoInterface): ProductoInterface{
    return {
        id: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio,
        medida: producto.medida,
        marca: producto.marca,
        codigo: producto.codigo,
        codigoBarra: producto.codigoBarra,
        fechaDeVencimiento: producto.fechaDeVencimiento,
    };
}

export function SimplificarProductoParaItemCompra(producto: ProductoInterface): ProductoInterface{
    return {
        id: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precio: producto.precio,
        precioCompra: producto.precioCompra,
        medida: producto.medida,
        marca: producto.marca,
        codigo: producto.codigo,
        codigoBarra: producto.codigoBarra,
        fechaDeVencimiento: producto.fechaDeVencimiento,
        variantes: producto.variantes,
    };
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */

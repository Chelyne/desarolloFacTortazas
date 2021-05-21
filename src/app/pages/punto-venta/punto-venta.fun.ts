import { ProductoInterface, VariantesInterface } from 'src/app/models/ProductoInterface';
import { ItemDeVentaInterface } from 'src/app/models/venta/item-de-venta';

export class PuntoVentaPageFun {
  constructorS() { }

  saludo() {
    return 'hola';
  }

  CrearItemDeVenta(itemProducto: ProductoInterface, variante: VariantesInterface): ItemDeVentaInterface{
    // if (!itemProducto.precio) {
    //   itemProducto.precio = 0;
    // }

    console.log('variante en crearItem',  variante);

    const TryToconvertNumver = (numero: any) => {
      if (typeof(numero) === 'number'){
        return numero;
      }
      const num = parseFloat(`${numero}`);
      return num;
    };

    variante.factor = TryToconvertNumver(variante.factor);
    if (isNaN(variante.factor)){
      throw String('El factor es una cadena, Edite el producto');
    }

    variante.precio = TryToconvertNumver(variante.precio);
    if (isNaN(variante.precio)){
      throw String('El precio es una cadena, Edite el producto');
    }

    console.log('NO DEBE LLEGAR AQULIIIIIIIIIIIIII');

    const itemDeventa: ItemDeVentaInterface =  {
      producto: itemProducto,
      cantidad: 1,
      precio: variante.precio,
      factor: variante.factor,
      medida: variante.medida,
      montoNeto: variante.precio,
      descuentoProducto: 0,
      porcentajeDescuento: 0,
      totalxprod: variante.precio /** ya que descuento es */
    };

    if (variante.medida === itemProducto.medida){
      itemDeventa.idProducto = itemProducto.id;
    } else {
      itemDeventa.idProducto = `${itemProducto.id}-${variante.medida}`;
    }

    return itemDeventa;
  }



}



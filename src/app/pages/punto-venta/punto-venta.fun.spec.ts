import { ProductoInterface, VariantesInterface } from 'src/app/models/ProductoInterface';
import { PuntoVentaPageFun } from './punto-venta.fun';

describe('Test funciones de punto de venta', () => {
  const fun = new PuntoVentaPageFun();

  it('saludo', () => {
    expect(fun.saludo()).toEqual('hola');
  });

  it('testear item de venta', () => {
    const producto = {
      id: 'p5IwhCMn91BN1eMFSycn',
      precio: 3,
      codigo: '1201',
      cantStock: 10,
      codigoBarra: '',
      sede: 'Andahuaylas',
      cantidad: 1,
      marca: '',
      nombre: 'prueba_monky',
      fechaDeVencimiento: null,
      medida: 'kilogramos'
    };
    const variantes =  [
      {
        factor: '1',
        precio: '3',
        medida: 'kg'
      },
      {
        factor: '5',
        medida: 'bolsa',
        precio: '7'
      },
      {
        precio: '1.5',
        medida: 'mitad',
        factor: '0.5'
      },
      {
        precio: '100',
        factor: '50',
        medida: 'saco'
      }
    ];
    const variante: VariantesInterface = {
      factor: 1,
      medida: producto.medida,
    };
    const variante2 = variantes[0];
    console.log('variante2', variante2);

    console.log('algo');

    console.log(fun.CrearItemDeVenta(producto, variante));
  });

});





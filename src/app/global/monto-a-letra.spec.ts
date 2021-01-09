// import { NumberToText } from './number-to-text';
import { MonotoALetras } from './monto-a-letra';

// describe('NumberToText', () => {
//   it('should create an instance', () => {
//     expect(new NumberToText()).toBeTruthy();
//   });
// });

describe('Testear conversion de Numero a Texto moneda', () => {
  it('solo decimales', () => {
    // expect(saludar()).toEqual('hello');
    expect(MonotoALetras(0.52)).toEqual('SON CERO CON 52/100 SOLES');
    expect(MonotoALetras(0.62)).toEqual('SON CERO CON 62/100 SOLES');
    expect(MonotoALetras(0.82)).toEqual('SON CERO CON 82/100 SOLES');
    expect(MonotoALetras(0.01)).toEqual('SON CERO CON 1/100 SOLES');
    expect(MonotoALetras(0.8222)).toEqual('SON CERO CON 82/100 SOLES');
    expect(MonotoALetras(0.5622)).toEqual('SON CERO CON 56/100 SOLES');
    expect(MonotoALetras(0.6722)).toEqual('SON CERO CON 67/100 SOLES');
  });
  it('unidades enteras', () => {
    expect(MonotoALetras(1)).toEqual('ES UN SOL');
    expect(MonotoALetras(2)).toEqual('SON DOS SOLES');
    expect(MonotoALetras(3)).toEqual('SON TRES SOLES');
    expect(MonotoALetras(4)).toEqual('SON CUATRO SOLES');
  });
  it('unidades decimales', () => {
    expect(MonotoALetras(1.52)).toEqual('SON UNO CON 52/100 SOLES');
    expect(MonotoALetras(1.64)).toEqual('SON UNO CON 64/100 SOLES');
    expect(MonotoALetras(1.01)).toEqual('SON UNO CON 1/100 SOLES');
    expect(MonotoALetras(5.52)).toEqual('SON CINCO CON 52/100 SOLES');
    expect(MonotoALetras(6.64)).toEqual('SON SEIS CON 64/100 SOLES');
    expect(MonotoALetras(7.52)).toEqual('SON SIETE CON 52/100 SOLES');
    expect(MonotoALetras(8.64)).toEqual('SON OCHO CON 64/100 SOLES');
    expect(MonotoALetras(9.01)).toEqual('SON NUEVE CON 1/100 SOLES');
  });
  it('Decenas', () => {
    expect(MonotoALetras(10)).toEqual('SON DIEZ SOLES');
    expect(MonotoALetras(19)).toEqual('SON DIECINUEVE SOLES');
    expect(MonotoALetras(18)).toEqual('SON DIECIOCHO SOLES');
    expect(MonotoALetras(17)).toEqual('SON DIECISIETE SOLES');
    expect(MonotoALetras(16)).toEqual('SON DIECISEIS SOLES');
    expect(MonotoALetras(15)).toEqual('SON QUINCE SOLES');
    expect(MonotoALetras(14)).toEqual('SON CATORCE SOLES');
    expect(MonotoALetras(13)).toEqual('SON TRECE SOLES');
    expect(MonotoALetras(12)).toEqual('SON DOCE SOLES');
    expect(MonotoALetras(11)).toEqual('SON ONCE SOLES');
    expect(MonotoALetras(45)).toEqual('SON CUARENTA Y CINCO SOLES');
    expect(MonotoALetras(55)).toEqual('SON CINCUENTA Y CINCO SOLES');
    expect(MonotoALetras(82)).toEqual('SON OCHENTA Y DOS SOLES');
    expect(MonotoALetras(99)).toEqual('SON NOVENTA Y NUEVE SOLES');
    expect(MonotoALetras(69)).toEqual('SON SESENTA Y NUEVE SOLES');
  });
  it('Decenas con decimales', () => {
    expect(MonotoALetras(21.34)).toEqual('SON VEINTIUN CON 34/100 SOLES');
    expect(MonotoALetras(45.94)).toEqual('SON CUARENTA Y CINCO CON 94/100 SOLES');
    expect(MonotoALetras(55.64)).toEqual('SON CINCUENTA Y CINCO CON 64/100 SOLES');
    expect(MonotoALetras(82.24)).toEqual('SON OCHENTA Y DOS CON 24/100 SOLES');
    expect(MonotoALetras(99.32)).toEqual('SON NOVENTA Y NUEVE CON 32/100 SOLES');
    expect(MonotoALetras(69.89)).toEqual('SON SESENTA Y NUEVE CON 89/100 SOLES');
  });
  it('Centas', () => {
    expect(MonotoALetras(100)).toEqual('SON CIEN SOLES');
    expect(MonotoALetras(118)).toEqual('SON CIENTO DIECIOCHO SOLES');
    expect(MonotoALetras(112)).toEqual('SON CIENTO DOCE SOLES');
    expect(MonotoALetras(213)).toEqual('SON DOSCIENTOS TRECE SOLES');
    expect(MonotoALetras(459)).toEqual('SON CUATROCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MonotoALetras(556)).toEqual('SON QUINIENTOS CINCUENTA Y SEIS SOLES');
    expect(MonotoALetras(822)).toEqual('SON OCHOCIENTOS VEINTIDOS SOLES');
    expect(MonotoALetras(993)).toEqual('SON NOVECIENTOS NOVENTA Y TRES SOLES');
    expect(MonotoALetras(698)).toEqual('SON SEISCIENTOS NOVENTA Y OCHO SOLES');
  });
  it('miles', () => {
    expect(MonotoALetras(10000)).toEqual('SON DIEZ MIL  SOLES');
    expect(MonotoALetras(10108)).toEqual('SON DIEZ MIL CIENTO OCHO SOLES');
    expect(MonotoALetras(100132)).toEqual('SON CIEN MIL CIENTO TREINTA Y DOS SOLES');
    expect(MonotoALetras(525613)).toEqual('SON QUINIENTOS VEINTICINCO MIL SEISCIENTOS TRECE SOLES');
    expect(MonotoALetras(456659)).toEqual('SON CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MonotoALetras(6456659)).toEqual('SON SEIS MILLONES CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MonotoALetras(65456659)).toEqual('SON SESENTA Y CINCO MILLONES CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MonotoALetras(654456659)).toEqual('SON SEISCIENTOS CINCUENTA Y CUATRO MILLONES CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MonotoALetras(999000000)).toEqual('SON NOVECIENTOS NOVENTA Y NUEVE MILLONES  SOLES');
    // ?NOTE MAYOR O IGUAL A MIL MILLONES NO ES SOPORTADO
  });
});

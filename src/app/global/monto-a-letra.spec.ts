// import { NumberToText } from './number-to-text';
import { MontoALetras } from './monto-a-letra';

// describe('NumberToText', () => {
//   it('should create an instance', () => {
//     expect(new NumberToText()).toBeTruthy();
//   });
// });

describe('Testear conversion de Numero a Texto moneda', () => {
  it('solo decimales', () => {
    // expect(saludar()).toEqual('hello');
    expect(MontoALetras(0.52)).toEqual('SON CERO CON 52/100 SOLES');
    expect(MontoALetras(0.62)).toEqual('SON CERO CON 62/100 SOLES');
    expect(MontoALetras(0.82)).toEqual('SON CERO CON 82/100 SOLES');
    expect(MontoALetras(0.01)).toEqual('SON CERO CON 1/100 SOLES');
    expect(MontoALetras(0.8222)).toEqual('SON CERO CON 82/100 SOLES');
    expect(MontoALetras(0.5622)).toEqual('SON CERO CON 56/100 SOLES');
    expect(MontoALetras(0.6722)).toEqual('SON CERO CON 67/100 SOLES');
  });
  it('unidades enteras', () => {
    expect(MontoALetras(1)).toEqual('ES UN SOL');
    expect(MontoALetras(2)).toEqual('SON DOS SOLES');
    expect(MontoALetras(3)).toEqual('SON TRES SOLES');
    expect(MontoALetras(4)).toEqual('SON CUATRO SOLES');
  });
  it('unidades decimales', () => {
    expect(MontoALetras(1.52)).toEqual('SON UNO CON 52/100 SOLES');
    expect(MontoALetras(1.64)).toEqual('SON UNO CON 64/100 SOLES');
    expect(MontoALetras(1.01)).toEqual('SON UNO CON 1/100 SOLES');
    expect(MontoALetras(5.52)).toEqual('SON CINCO CON 52/100 SOLES');
    expect(MontoALetras(6.64)).toEqual('SON SEIS CON 64/100 SOLES');
    expect(MontoALetras(7.52)).toEqual('SON SIETE CON 52/100 SOLES');
    expect(MontoALetras(8.64)).toEqual('SON OCHO CON 64/100 SOLES');
    expect(MontoALetras(9.01)).toEqual('SON NUEVE CON 1/100 SOLES');
  });
  it('Decenas', () => {
    expect(MontoALetras(10)).toEqual('SON DIEZ SOLES');
    expect(MontoALetras(19)).toEqual('SON DIECINUEVE SOLES');
    expect(MontoALetras(18)).toEqual('SON DIECIOCHO SOLES');
    expect(MontoALetras(17)).toEqual('SON DIECISIETE SOLES');
    expect(MontoALetras(16)).toEqual('SON DIECISEIS SOLES');
    expect(MontoALetras(15)).toEqual('SON QUINCE SOLES');
    expect(MontoALetras(14)).toEqual('SON CATORCE SOLES');
    expect(MontoALetras(13)).toEqual('SON TRECE SOLES');
    expect(MontoALetras(12)).toEqual('SON DOCE SOLES');
    expect(MontoALetras(11)).toEqual('SON ONCE SOLES');
    expect(MontoALetras(45)).toEqual('SON CUARENTA Y CINCO SOLES');
    expect(MontoALetras(55)).toEqual('SON CINCUENTA Y CINCO SOLES');
    expect(MontoALetras(82)).toEqual('SON OCHENTA Y DOS SOLES');
    expect(MontoALetras(99)).toEqual('SON NOVENTA Y NUEVE SOLES');
    expect(MontoALetras(69)).toEqual('SON SESENTA Y NUEVE SOLES');
  });
  it('Decenas con decimales', () => {
    expect(MontoALetras(21.34)).toEqual('SON VEINTIUN CON 34/100 SOLES');
    expect(MontoALetras(45.94)).toEqual('SON CUARENTA Y CINCO CON 94/100 SOLES');
    expect(MontoALetras(55.64)).toEqual('SON CINCUENTA Y CINCO CON 64/100 SOLES');
    expect(MontoALetras(82.24)).toEqual('SON OCHENTA Y DOS CON 24/100 SOLES');
    expect(MontoALetras(99.32)).toEqual('SON NOVENTA Y NUEVE CON 32/100 SOLES');
    expect(MontoALetras(69.89)).toEqual('SON SESENTA Y NUEVE CON 89/100 SOLES');
  });
  it('Centas', () => {
    expect(MontoALetras(100)).toEqual('SON CIEN SOLES');
    expect(MontoALetras(118)).toEqual('SON CIENTO DIECIOCHO SOLES');
    expect(MontoALetras(112)).toEqual('SON CIENTO DOCE SOLES');
    expect(MontoALetras(213)).toEqual('SON DOSCIENTOS TRECE SOLES');
    expect(MontoALetras(459)).toEqual('SON CUATROCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MontoALetras(556)).toEqual('SON QUINIENTOS CINCUENTA Y SEIS SOLES');
    expect(MontoALetras(822)).toEqual('SON OCHOCIENTOS VEINTIDOS SOLES');
    expect(MontoALetras(993)).toEqual('SON NOVECIENTOS NOVENTA Y TRES SOLES');
    expect(MontoALetras(698)).toEqual('SON SEISCIENTOS NOVENTA Y OCHO SOLES');
  });
  it('miles', () => {
    expect(MontoALetras(10000)).toEqual('SON DIEZ MIL  SOLES');
    expect(MontoALetras(10108)).toEqual('SON DIEZ MIL CIENTO OCHO SOLES');
    expect(MontoALetras(100132)).toEqual('SON CIEN MIL CIENTO TREINTA Y DOS SOLES');
    expect(MontoALetras(525613)).toEqual('SON QUINIENTOS VEINTICINCO MIL SEISCIENTOS TRECE SOLES');
    expect(MontoALetras(456659)).toEqual('SON CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MontoALetras(6456659)).toEqual('SON SEIS MILLONES CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MontoALetras(65456659)).toEqual('SON SESENTA Y CINCO MILLONES CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MontoALetras(654456659)).toEqual('SON SEISCIENTOS CINCUENTA Y CUATRO MILLONES CUATROCIENTOS CINCUENTA Y SEIS MIL SEISCIENTOS CINCUENTA Y NUEVE SOLES');
    expect(MontoALetras(999000000)).toEqual('SON NOVECIENTOS NOVENTA Y NUEVE MILLONES  SOLES');
    // ?NOTE MAYOR O IGUAL A MIL MILLONES NO ES SOPORTADO
  });
});

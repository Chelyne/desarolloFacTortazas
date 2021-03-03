import { redondeoDecimal, completarCeros } from './funciones-globales';

// describe('FuncionesGlobales', () => {
//   it('should create an instance', () => {
//     expect(new FuncionesGlobales()).toBeTruthy();
//   });
// });
describe('Test CompletarCeros', () => {
  it('parametrosCero', () => {
    expect('00000000').toEqual(completarCeros(''));
    expect('00000000').toEqual(completarCeros(undefined));
  });
  it('parametroNum', () => {
    expect('00000125').toEqual(completarCeros(125));
  });
});

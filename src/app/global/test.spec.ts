import { Test } from './test';
// import 'jasmine-expect';

describe('Test', () => {
  it('should create an instance', () => {
    expect(new Test()).toBeTruthy();
  });
  it('varificar que dos objetos sean iguales', () => {
    const foo = {
      e: 2,
      a: 1,
      bar: 'bazzz',
    };

    const foo2 = {
      e: 2,
      a: 1,
      bar: 'bazzz',
    };

    console.log('tipeof', typeof JSON.stringify(foo));
    console.log('foooooo', foo, foo2);
    console.log('foooooo', JSON.stringify(foo), JSON.stringify(foo2));

    expect(foo).toEqual(foo2);
    expect(JSON.stringify(foo)).toEqual(JSON.stringify(foo2));
  });
  it('verificar que contiene el objeto', () => {
    const foo = {
      e: 2,
      a: 1,
      bar: 'bazzz',
    };

    // expect(foo).toContain({a: 1});
    expect('hola como estas').toContain('hola');

  });
  it('verificar que un objeto contenga elemenetos', () => {
    const foo = {
      e: 2,
      a: 1,
      bar: 'bazzz',
    };

    const arrayElem = ['e', 'a', 'bar'];

    expect(true).toEqual(validarElementos(foo, arrayElem));

  });

});

function validarElementos(objeto: any, arrayElementos: any[]){
  for (const elemento of arrayElementos) {
    if (!objeto[elemento]){
      console.log('no se encontro elemento', elemento, ' en objeto', objeto);
      return false;
    }
  }
  return true;
}

function atributosToArray(objeto: any){
  return Object.keys(objeto);
}



export function validarElementos(objeto: any, arrayElementos: any[]) {

  for (const elemento of arrayElementos) {
    if (!objeto.hasOwnProperty(elemento)) {
      console.log(
        `%cNO SE ENCONTRO ELEMENTO: %c${elemento}`,
        'color:red; background-color: yellow;', 'color:white; background-color: blue;',
        'EN OBJETO: ', objeto
      );
      return false;
    }
  }
  return true;
}

export function atributosToArray(objeto: any) {
  return Object.keys(objeto);
}

export function isObjsEqual(objeto1: any, objeto2: any) {
  return JSON.stringify(objeto1) === JSON.stringify(objeto2);
}

export function isObjsEqual2(objeto1: any, objeto2: any) {
  const ArrayObjeto: any[] = [...new Set([...Object.keys(objeto1), ...Object.keys(objeto2)])];
  for (const index of ArrayObjeto) {
    if (objeto1.hasOwnProperty(index) && objeto2.hasOwnProperty(index)) {
      // if (!(objeto1[index] === objeto2[index])){
      if (!(JSON.stringify(objeto1[index]) === JSON.stringify(objeto2[index]))) {
        console.log('son diferentes En la propiedad', index, objeto1[index], objeto2[index]);
        console.log(
          `%cSON DIFERENTES EN EL INDICE: %c${index}`,
          'color:red; background-color: yellow;',
          'color:white; background-color: blue;'
        );
        console.log(objeto1[index], objeto2[index]);
        return false;
      }
    } else {
      console.log('Solo un objeto tiene la propiedad', index);
      if (objeto1.hasOwnProperty(index)) {
        console.log(
          `%cSolo OBJETO1 tiene: %c${index}`,
          'color:red; background-color: yellow;',
          'color:white; background-color: blue;'
        );
      } else {
        console.log(
          `%cSolo OBJETO2 tiene: %c${index}`,
          'color:red; background-color: yellow;',
          'color:white; background-color: blue;'
        );
      }
      console.log(objeto1[index], objeto2[index]);


      return false;
    }
  }
  return true;
  // return JSON.stringify( objeto1) === JSON.stringify(objeto2);
}


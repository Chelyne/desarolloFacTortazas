import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ProductoInterface } from '../models/ProductoInterface';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class BuscadorService {

  sede = this.storage.datosAdmi.sede;

  LIMIT_SEARCH = 15;

  constructor(
    private afs: AngularFirestore,
    private storage: StorageService
  ) {
  }

  saludo(){
    return 'hola';
  }

  getSede(){
    return this.sede;
  }


  /* -------------------------------------------------------------------------- */
  /*                              función principal                             */
  /* -------------------------------------------------------------------------- */
  async Buscar(target: string){

    if (!target.length){
      return [];
    }

    let listaResultante: ProductoInterface[] = [];
    target = target.toLocaleLowerCase();

    if (target.split(' ').length > 1){
      await this.busquedaPorNombreP(target).then( data => listaResultante = data);

    } else {

      const flagFullStrOrNum = this.isFullStringoOrNamber(target);

      if (flagFullStrOrNum === 'allString'){
        await this.busquedaPorNombreP(target).then( data => listaResultante = data);

      }
      else if (flagFullStrOrNum === 'allNumber'){
        if (target.length <= 5){
          await this.busquedaPorCodigoProductoExactoP(target).then( data => listaResultante = data);

          if (!listaResultante.length){
            // si no se encontro productos, buscar por codigo de producto o Barra similares
            let a: any[] = [];
            let b: any[] = [];
            await (
              this.busquedaPorCodigoProductoP(target).then(data => a = data),
              this.busquedaPorCodigoBarraP(target).then( data => b = data)
            );
            listaResultante = a.concat(b);


          }

        } else {
          await this.busquedaPorCodigoBarraP(target).then(data => listaResultante = data);
        }

      }
      else{
        // flagFullStrOrNum === 'both'
        // pude ser un codigo de barra o un nombre
        let a: any[] = [];
        let b: any[] = [];
        await (
          this.busquedaPorCodigoBarraP(target).then( data => a = data),
          this.busquedaPorNombreP(target).then(data => b = data)
        );
        listaResultante = a.concat(b);

      }
    }

    return listaResultante;

  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */






  /* -------------------------------------------------------------------------- */
  /*                        search pegs usando promesas                         */
  /* -------------------------------------------------------------------------- */
  async busquedaPorCodigoProductoExactoP(target: string){
    // BUSQUEDA EXACTA POR CODIGO DE PRODUCTO
    return this.afs.collection('sedes').doc(this.sede.toLowerCase())
    .collection('productos').ref.where('codigo', '==', target).limit(this.LIMIT_SEARCH)
    .get().then((querySnapshot) => {
      const resultList: ProductoInterface[] = [];
      querySnapshot.forEach( (doc) => {
        resultList.push({id: doc.id, ...doc.data()});
      });
      return resultList;
    });
  }

  async busquedaPorCodigoProductoP(target: string){
    // BUSQUEDA POR CODIGO DE PRODUCTO
    return this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos').ref.orderBy('codigo')
    .startAt(target).endAt(target + '\uf8ff').limit(this.LIMIT_SEARCH).get()
    .then((querySnapshot) => {
      const resultList: ProductoInterface[] = [];
      querySnapshot.forEach( (doc) => {
        resultList.push({id: doc.id, ...doc.data()});
      });
      return resultList;
    });

  }

  async busquedaPorCodigoBarraP(target: string){
    // BUSCA POR CODIGO BARRA

    return this.afs.collection('sedes').doc(this.sede.toLowerCase())
    .collection('productos').ref.orderBy('codigoBarra').startAt(target).endAt(target + '\uf8ff').limit(this.LIMIT_SEARCH)
    .get().then((querySnapshot) => {
      const resultList: ProductoInterface[] = [];
      querySnapshot.forEach( (doc) => {
        resultList.push({id: doc.id, ...doc.data()});
      });
      return resultList;
    });

  }

  async busquedaPorNombreP(target: string){
    let a: any[] = [];
    let b: any[] = [];
    await (
      this.busquedaPorNombreInicioP(target).then( data => a = data),
      this.busquedaPorNombreCuerpoP(target.split(' ')).then( data => b = data)
    );

    return this.unirArrayProductos(a, b);
  }

  async busquedaPorNombreInicioP(target: string){
    // BUSCA POR NOMBRE

    return this.afs.collection('sedes').doc(this.sede.toLowerCase())
    .collection('productos').ref.orderBy('nombre').startAt(target).endAt(target + '\uf8ff').limit(this.LIMIT_SEARCH)
    .get().then((querySnapshot) => {
      const resultList: ProductoInterface[] = [];
      querySnapshot.forEach( (doc) => {
        resultList.push({id: doc.id, ...doc.data()});
      });
      return resultList;
    });
  }

  async busquedaPorNombreCuerpoP(arrayTargets: string[]){
    return this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos').ref
    .where('arrayNombre', 'array-contains-any', arrayTargets ).limit(25).get().then((querySnapshot) => {
      const resultList: ProductoInterface[] = [];
      querySnapshot.forEach( (doc) => {
        resultList.push({id: doc.id, ...doc.data()});
      });
      return resultList;
    });
  }


  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */


  /* -------------------------------------------------------------------------- */
  /*                            funciones auxiliares                            */
  /* -------------------------------------------------------------------------- */

  /**
   *  @objetivo : Verificar si el target es full string or numero
   *  @return : 'allString'|'allNumber'|'both'
   */
  isFullStringoOrNamber(target: string): 'allString'|'allNumber'|'both'{
    let contador = 0;
    for (const caracter of target) {
      if (isNaN(parseInt(caracter, 10))) {
        contador--;
      } else {
        contador++;
      }
    }

    if (contador === -target.length){
      return 'allString'; // full string
    } else if (contador === target.length){
      return 'allNumber'; // full number
    }
    return 'both';
  }


  unirArrayProductos(a: ProductoInterface[], b: ProductoInterface[]){
    const arrayResultante: ProductoInterface[] = [];
    // let estaInResultante = false;

    const iterador = (listPruduct: ProductoInterface[]) => {

      for (const product of listPruduct){
        let estaInResultante = false;
        for (const itemR of arrayResultante) {
          if (product.id === itemR.id){
            estaInResultante = true;
            break;
          }
        }

        if (!estaInResultante){
          arrayResultante.push(product);
        }
      }
    };

    iterador(a);
    iterador(b);

    return arrayResultante;
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */

}


import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import algoliasearch from 'algoliasearch';
import { ProductoInterface } from '../models/ProductoInterface';
import { DataBaseService } from './data-base.service';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class BuscadorService {

  sede = this.storage.datosAdmi.sede;

  LIMIT_SEARCH = 15;

  constructor(
    private afs: AngularFirestore,
    private storage: StorageService,
    private dataApi: DataBaseService
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
  async BuscarV1(target: string){

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
        // VERSINO ANTERIOR
        // if (target.length <= 5){
        //   await this.busquedaPorCodigoProductoExactoP(target).then( data => listaResultante = data);

        //   if (!listaResultante.length){
        //     // si no se encontro productos, buscar por codigo de producto o Barra similares
        //     let a: any[] = [];
        //     let b: any[] = [];
        //     await (
        //       this.busquedaPorCodigoProductoP(target).then(data => a = data),
        //       this.busquedaPorCodigoBarraP(target).then( data => b = data)
        //     );
        //     listaResultante = a.concat(b);
        //   }

        // } else {
        //   await this.busquedaPorCodigoBarraP(target).then(data => listaResultante = data);
        // }

      }
      else{
        // flagFullStrOrNum === 'both'
        // pude ser un codigo de barra o un nombre
        console.log('buscamos por codigo de barra');
        
        if (target.length <= 5){
          console.log('buscamos por codigo EXACTO');
          await this.busquedaPorCodigoProductoExactoP(target).then( data => listaResultante = data);
        }

        if (!listaResultante.length){
          let a: any[] = [];
          let b: any[] = [];
          let c: any[] = [];
          await (
            this.busquedaPorCodigoBarraP(target).then( data => a = data),
            this.busquedaPorNombreP(target).then(data => b = data),
            this.busquedaPorCodigoProductoP(target).then(data => c = data)
          );
          listaResultante = a.concat(b).concat(c);
        }

        // let a: any[] = [];
        // let b: any[] = [];
        // await (
        //   this.busquedaPorCodigoBarraP(target).then( data => a = data),
        //   this.busquedaPorNombreP(target).then(data => b = data)
        // );
        // listaResultante = a.concat(b);


      }
    }

    return listaResultante;

  }


  // BUSCADOR CON ALGOLIA
  async Buscar(palabra) {
    let listaResultante: ProductoInterface[] = [];
    const cliente = algoliasearch('DJPS8EKAPC','9309b597608b3ddd1b683a58146c9971');
    const index = cliente.initIndex('productosBuscador');
    let resultados: any = (await index.search(palabra)).hits;
    for (const item of resultados) {
      if (item.sede === this.sede) {
        await this.dataApi.obtenerProductoPorId(item.id, item.sede).then(res => {
          if (res) {
            listaResultante.push(res);
          }
        });
      }
    }
    console.log('RESULTADO> ', resultados);
    console.log('LISTA RESULTADO> ', listaResultante);
    return listaResultante;
  }

  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */






  /* -------------------------------------------------------------------------- */
  /*                        search pegs usando promesas                         */
  /* -------------------------------------------------------------------------- */
  async busquedaPorCodigoProductoExactoP(target: string){
    target = target.toLocaleUpperCase(); // ESTADO DE PRUEBA REALIZADO EL 2 DE AGOSTO DEL 2022  FALTA VERIFICAR Y PROBAR
    console.log('busca> ', target);
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


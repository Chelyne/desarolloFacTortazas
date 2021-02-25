import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import {  map } from 'rxjs/operators';
import { ProductoInterface } from '../models/ProductoInterface';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class BuscadorService {
  buscarNombre: boolean;

  // sede: string;
  // sede = storage.datosAdmi.sede;
  sede = 'andahuaylas';

  productos: ProductoInterface[] = [];
  listaProductos: ProductoInterface[] = [];
  resultList: ProductoInterface[] = [];

  buscando: boolean;
  LIMIT_SEARCH = 15;

  constructor(
    private afs: AngularFirestore,
    private storage: StorageService
  ) {
    this.sede = storage.datosAdmi.sede;
  }

  saludo(){
    return 'hola';
  }

  getSede(){
    return this.sede;
  }
  setSede(sedeName: string){
    this.sede = sedeName;
  }


  /**
   *  @objetivo : Arrow funcion para evitar repeticion en la funcion THEN  de las promesas
   *  @return : dataList, la lista que se le pasa en caso de que otra promesa necesite usar los datos
   */
  modificaProductList = (dataList: any) => {
    this.listaProductos = this.listaProductos.concat(dataList);
    console.log('Lista de Productos Resultante', this.listaProductos, dataList);
    return dataList;
  }

/* -------------------------------------------------------------------------- */
/*                              función principal                             */
/* -------------------------------------------------------------------------- */
  async search(target: string){

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
        // pude ser un codigo de barra puede ser un nombre
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



  /* -------------------------------------------------------------------------- */
  /*                               usando promesas                              */
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
  /*                              usando Observable                             */
  /* -------------------------------------------------------------------------- */

  buscar(target: string){
    this.listaProductos = [];
    target = target.toLocaleLowerCase();

    if (target.length) {
      let contador = 0;
      for (const caracter of target) { // console.log(letra);

        const numero = parseInt(caracter, 10);

        // QUEST - cual es ebjetivo de esta secuencia
        if (isNaN(numero)) {
          contador--;
        } else {
          contador++;
        }

        if (contador >= 1) {
          this.buscarNombre = false;
          break;
        } else {
          this.buscarNombre = true;
        }
      }

      if (this.buscarNombre) {

        // BUSCA POR NOMBRE
        this.busquedaPorNombre(target);

        // BUSCA POR CODIGO BARRA PARA CONCATENAR
        this.busquedaPorCodigoBarra(target);

      } else {

        if (target.length > 10) {
          // BUSQUEDA POR CODIGO DE BARRA
          this.busquedaPorCodigoBarra(target);

        } else {
          // BUSQUEDA POR CODIGO DE PRODUCTO
          this.busquedaPorCodigoProducto(target);

        }

      }

    } else {
      console.log('No hay un objetivo a buscar');
    }
  }

  busquedaPorNombre(target: string){
    // let resultadosLista: ProductoInterface[] = [];

    this.afs.collection('sedes').doc(this.sede.toLowerCase())
    .collection('productos', res => res.orderBy('nombre').startAt(target).endAt(target + '\uf8ff').limit(this.LIMIT_SEARCH))
    .snapshotChanges()
    .pipe(map(changes => {
      const resultList: any[] = [];
      changes.map(action => {
        resultList.push({id: action.payload.doc.id, ...action.payload.doc.data()});
      });
      console.log('aaaaaaaaaaaaaaaNombre', resultList);
      return resultList;
    }
    ))
    .subscribe(res => {
      this.listaProductos = this.listaProductos.concat(res);
      console.log('Lista de Productos Resultante');
    }, error => { console.log('error de subscribe' + error); }
    );

  }

  busqudaPorCodigoProductoExacto(target: string){
    // BUSQUEDA POR CODIGO DE PRODUCTO
    // tslint:disable-next-line:max-line-length
    this.afs.collection('sedes').doc(this.sede.toLowerCase())
    .collection('productos', res => res.where('codigo', '==', target).limit(this.LIMIT_SEARCH))
    .snapshotChanges()
    .pipe(map(changes => {
      const resultList: any[] = [];
      changes.map(action => {
        resultList.push({id: action.payload.doc.id, ...action.payload.doc.data()});
      });
      console.log('Lista de resultados por codigoProducto', resultList);
      console.log('bbbbbbCodigoProductoExacto', resultList);
      return resultList;
    }
    ))
    .subscribe(res => {
      this.listaProductos = this.listaProductos.concat(res);
      console.log('Lista de Productos Resultante');
    }, error => { console.log('error de subscribe'  + error); }
    );
  }

  busquedaPorCodigoProducto(target: string){
    // BUSQUEDA POR CODIGO DE PRODUCTO
    // tslint:disable-next-line:max-line-length
    this.afs.collection('sedes').doc(this.sede.toLowerCase()).collection('productos', res => res.orderBy('codigo')
    .startAt(target).endAt(target + '\uf8ff').limit(this.LIMIT_SEARCH))
    .snapshotChanges()
    .pipe(map(changes => {
      const resultList: any[] = [];
      changes.map(action => {
        resultList.push({id: action.payload.doc.id, ...action.payload.doc.data()});
      });
      console.log('Lista de resultados por codigoProducto', resultList);
      console.log('bbbbbbbbbbbbbbbbbCodigoProducto', resultList);
      return resultList;
    }
    ))
    .subscribe(res => {
      this.listaProductos = this.listaProductos.concat(res);
      console.log('Lista de Productos Resultante');
    }, error => { console.log('error de subscribe'  + error); }
    );
  }

  busquedaPorCodigoBarra(target: string){
    // BUSCA POR CODIGO BARRA PARA CONCATENAR
    // tslint:disable-next-line:max-line-length
    this.afs.collection('sedes').doc(this.sede.toLowerCase())
    .collection('productos', res => res.orderBy('codigoBarra').startAt(target).endAt(target + '\uf8ff').limit(this.LIMIT_SEARCH))
    .snapshotChanges()
    .pipe(map(changes => {
      const resultList: any[] = [];
      changes.map(action => {
        resultList.push({id: action.payload.doc.id, ...action.payload.doc.data()});
      });
      console.log('cccccccccccccccCodigoBarra', resultList);
      return resultList;
    }
    )).subscribe(res => {
      this.listaProductos = this.listaProductos.concat(res);
      console.log('Lista de Productos Resultante');
    }, error => { console.log('error de subscribe'  + error); }
    );

  }

  probarBusquedas(){
    this.listaProductos = [];
    this.busquedaPorNombre('alpiste');
    this.busquedaPorCodigoProducto('39');
    setTimeout(() => {
      console.log('lista finallll', this.listaProductos);
    }, 5000);
  }
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */



}

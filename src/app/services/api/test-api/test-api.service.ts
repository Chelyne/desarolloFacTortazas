import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TestApiService {

  constructor() { }

  saludo(){
    return 'hola';
  }

  ObtenerCodigoMedida(medida: string){
    switch (medida.toLowerCase()) {
        case 'botellas': return 'BG';
        case 'caja': return 'BO';
        case 'docena': return 'BX';
        case 'gramo': return 'DZN';
        case 'juego': return 'GRM';
        case 'kilogramo': return 'SET';
        case 'kit': return 'KGM';
        case 'libras': return 'KT';
        case 'litro': return 'LBR';
        case 'metro': return 'LTR';
        case 'miligramos': return 'MTR';
        case 'mililitro': return 'MGM';
        case 'milimetro': return 'MLT';
        case 'onzas': return 'MMT';
        case 'pies': return 'ONZ';
        case 'piezas': return 'FOT';
        case 'pulgadas': return 'C62';
        case 'unidad (bienes)': return 'INH';
        case 'ciento de unidades': return 'NIU';
        case 'bolsa': return 'CEN';
        case 'balde': return 'BJ';
        case 'barriles': return 'BLL';
        case 'cartones': return 'CT';
        case 'centimetro cuadrado': return 'CMK';
        case 'latas': return 'CA';
        case 'metro cuadrado': return 'MTK';
        case 'milimetro cuadrado': return 'MMK';
        case 'paquete': return 'PK';
        case 'par': return 'PR';
        case 'unidad servicios': return 'ZZ';
        case 'cilindro': return 'CY';
        case 'galon ingles': return 'GLI';
        case 'pies cuadrados': return 'FTK';
        case 'us galon': return 'GLL';
        case 'bobinas': return '4A';
        case 'centimetro cubico': return 'CMQ';
        case 'centimetro lineal': return 'CMT';
        case 'conos': return 'CJ';
        case 'docena por 10**6': return 'DZP';
        case 'fardo': return 'BE';
        case 'gruesa': return 'GRO';
        case 'hectolitro': return 'HLT';
        case 'hoja': return 'LEF';
        case 'kilometro': return 'KTM';
        case 'kilovatio hora': return 'KWH';
        case 'megawatt hora': return 'MWH';
        case 'metro cubico': return 'MTQ';
        case 'milimetro cubico': return 'MMQ';
        case 'millares': return 'MLL';
        case 'millon de unidades': return 'UM';
        case 'paletas': return 'PF';
        case 'pies cubicos': return 'FTQ';
        case 'placas': return 'PG';
        case 'pliego': return 'ST';
        case 'resma': return 'RM';
        case 'tambor': return 'DR';
        case 'tonelada corta': return 'STN';
        case 'tonelada larga': return 'LTN';
        case 'toneladas': return 'TNE';
        case 'tubos': return 'TU';
        case 'yarda': return 'YRD';
        case 'yarda cuadrada': return 'YDK';
        default: return 'MEDIDA NO REGISTRADA';
    }
}

}

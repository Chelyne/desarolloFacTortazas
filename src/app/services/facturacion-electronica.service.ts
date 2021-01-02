import { Injectable } from '@angular/core';
import { ClienteInterface } from '../models/cliente-interface';
import { ItemDeVentaInterface } from '../models/venta/item-de-venta';
import { VentaInterface } from '../models/venta/venta';

@Injectable({
  providedIn: 'root'
})
export class FacturacionElectronicaService {

  constructor() { }

  getCompany(){
    // return {
    //   "id": 354,
    //   "sol_user": "PRUEBA00",
    //   "sol_pass": "PRUEBA00",
    //   "ruc": "20722440881",
    //   "razon_social": "empresa de ejemplo",
    //   "direccion": "direccion de ejemplo",
    //   "certificado": "20722440881/cert.pem",
    //   "logo": "20722440881/logo.png",
    //   "token": {
    //     "code": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpYXQiOjE2MDkxNzE3NDQsInVzZXJuYW1lIjoiaHoiLCJjb21wYW55IjoiMjA3MjI0NDA4ODEiLCJleHAiOjQ3NjI3NzE3NDR9.DfrmovRyJGC0UR3FZblxmeUMKDGA5M9_FfFm9SIqCj-JvjTkIz8IqIWNmTnC7nZN2WiXg_yik4rv3vDi29g5d9b-YdKGL05QeSLDLgenD-W9AL3YiE_U0uSrGtPv9PvETwCcn3RoaGG3R9atB28geSPFzkcEccjyJRckyMNYRgZHuq9KLdu6mhKHdCOMhmxcMIt9OIO577QQpQkYljFiY0WC7cSlRjJyTSH2QxDAOfbz-PKOrs2fBJBi2X5cE4JmH0JeHhDikUY1cUcmo3_HOrV-IZk2hn9lcAZ-tfzvIvLeReTpA_quh9UiOs4Xy5Fwo93dj4fbSvRetN5RqylfHpnETzAKSZrj_AhdTmdTPWFZkNkoIB6eazqE7CKmh8URc_xQM3N3WEB-myZPyX8LRQ25xkE1DJKV9zxzuLDiUgi7ggGTQW_pC67uHi0ykeWD2D0KrY4eQanRdecBYfJyZ7LktOe1fUy-vMeBeYsniigVOY2u2s5e1ZG37gOmdDJJX_TC6GCRRfolor1M3z6B1a4UAiSpwGUcYxvKIMl9OgbmO1slCKnyx-S9KccF6PlapEPRkee_blEc4Gq39_sx2Eo6HxSyo27BQ80DpSTj2AsRTFtKVWc5mDvt7CnQLPc8rMJvtqwtrhdNxrVC-FHgItRHsWQ7mTUUYOWo2AcBH3c"
    //   },
    //   "plan": {
    //     "nombre": "free",
    //     "limite": 10000000
    //   },
    //   "environment": {
    //     "nombre": "beta",
    //     "fe_url": "https://e-beta.sunat.gob.pe/ol-ti-itcpfegem-beta/billService",
    //     "re_url": "https://e-beta.sunat.gob.pe/ol-ti-itemision-otroscpe-gem-beta/billService",
    //     "guia_url": "https://e-beta.sunat.gob.pe/ol-ti-itemision-guia-gem-beta/billService"
    //   }
    // };
  }


  // getToken(): string{
  //   return '';
  // }

  creaerComprobante(){

  }

  enviarComprobante(){

  }






}

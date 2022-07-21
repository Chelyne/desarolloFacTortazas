import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private  http: HttpClient) { }

  getMenu() {
    return this.http.get<any[]>('../../assets/data/menu.json');
  }
  getMenuContador() {
    return this.http.get<any[]>('../../assets/data/menuContador.json');
  }
}

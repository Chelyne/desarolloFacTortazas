import { Component, OnInit } from '@angular/core';
import { ApiPeruService } from 'src/app/services/api/api-peru.service';

@Component({
  selector: 'app-test-page',
  templateUrl: './test-page.page.html',
  styleUrls: ['./test-page.page.scss'],
})
export class TestPagePage implements OnInit {

  constructor(
    private apisPeru: ApiPeruService
  ) { }

  ngOnInit() {
  }

  async login(){
    const token = await this.apisPeru.login();
    console.log('tokennnnnnnnnnnnnnnnnnnnn', token);
  }

  async listarEmpresas(){
      await this.apisPeru.listarEmprasas();
  }

  async obtenerEmpresaPorRuc(){
    await this.apisPeru.obtenerEmpresaByRUC('20601831032');
  }

  async obtenerTokenDeEmpresa(){
    const tokenEmprersa = await this.apisPeru.obtenerTokenDeEmpresa('20601831032');
    console.log('tokenEmprersaaaaaaaaaaa', tokenEmprersa);
  }

  async guardarDatosDeEmpresa(){
    await this.apisPeru.guardarDatosEmpresaFirebase('20601831032');
  }

  async obtenerDatosDeEmpresa(){
    await this.apisPeru.obtenerDatosDeLaEmpresa();
  }

  async enviarASunat(){
    await this.apisPeru.enviarComprobanteASunat({});
  }

}

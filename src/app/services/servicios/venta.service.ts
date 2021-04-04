import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  recurosBaseURL: string = environment.URL_BASE + '/ventas/';
  constructor(private http: HttpClient) { }

  listarRecurso() {
    return this.http.get(this.recurosBaseURL + 'listar');
  }

  getNextId() {
    return this.http.get(this.recurosBaseURL + 'next-id');
  }

  getRecurso(id) {
    return this.http.get(this.recurosBaseURL + 'encontrar/' + id);
  }

  agregarRecurso(recurso) {
    return this.http.post(this.recurosBaseURL + 'agregar', recurso);
  }

  modificarRecurso(recurso, id) {
    console.log(recurso);
    return this.http.put(this.recurosBaseURL + 'modificar/' + id, recurso);
  }

  eliminarRecurso(id) {
    return this.http.delete(this.recurosBaseURL + 'eliminar/' + id);
  }

  actualizarCabecera(id) {
    return this.http.get(this.recurosBaseURL + 'actualizar-cabecera/' + id);
  }


}

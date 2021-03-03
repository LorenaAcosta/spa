import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ProductoService } from 'src/app/services/servicios/producto.service';
import { CategoriaService } from 'src/app/services/servicios/categoria.service';
import { UtilesService } from 'src/app/services/servicios/utiles.service';

@Component({
  selector: 'app-producto-edit',
  templateUrl: './producto-edit.component.html',
  styleUrls: ['./producto-edit.component.scss']
})

export class  ProductoEditComponent implements OnInit {

  form = this.fb.group({
    descripcion: ['', Validators.required],
    costo: ['', Validators.required],
    precioVenta: ['', Validators.required],
    stockActual: ['', Validators.required],
    estado: ['', Validators.required]
  });
  productos: any[] = [];
  categorias: any[] = [];

  constructor(private fb: FormBuilder,
              private productoService: ProductoService,
              private categoriaService: CategoriaService,
              private route: ActivatedRoute,
              private router: Router, 
              private util: UtilesService) {
                this.form = this.fb.group({
                  descripcion: ['', Validators.required],
                  costo: ['', Validators.required],
                  precioVenta: ['', Validators.required],
                  stockActual: ['', Validators.required],
                  categoriaId: ['', Validators.required],
                  estado: ['', Validators.required]
                });
    }

  ngOnInit() {
    this.categoriaService.obtenerPorTipo('producto').subscribe( (resp: any[]) =>  this.categorias = resp );
    const id = this.route.snapshot.params.id;
   // console.log(id);
    if (typeof id !== 'undefined') {
      this.form = this.fb.group({
        descripcion: ['', Validators.required],
        costo: ['', Validators.required],
        precioVenta: ['', Validators.required],
        stockActual: ['', Validators.required],
        categoriaId: ['', Validators.required],
        estado: [1]
      });
      this.productoService.getRecurso(id)
       .subscribe ((data: any) => {
        this.form.controls.codigo.setValue(data.codigo);
        this.form.controls.descripcion.setValue(data.descripcion);
        this.form.controls.costo.setValue(data.costo);
        this.form.controls.precioVenta.setValue(data.precioVenta);
        this.form.controls.stockActual.setValue(data.stockActual);
        this.form.controls.categoriaId.setValue(data.categoriaId.categoriaId);
        this.form.controls.imageName.setValue(data.imageName);
        this.form.controls.estado.setValue(data.estado);
       });
    }
  }

  guardar() {
    const id = this.route.snapshot.params.id;
    let peticion: Observable<any>;
    console.log(id);
    console.log(typeof id);
    if (typeof id === 'undefined') {
      peticion = this.productoService.agregarRecurso(this.form.value);
      peticion.subscribe((result: any) =>  {
        Swal.fire(
          'Guardado!',
          'Se actualizaron los datos!',
          'success'
        );
        this.router.navigate(['/producto/listar']);
      });
    } else {
      peticion = this.productoService.modificarRecurso(this.form.value, id);
      peticion.subscribe((result: any) =>  {
        Swal.fire(
          'Guardado!',
          'Se actualizaron los datos!',
          'success'
        );
        this.router.navigate(['/producto/listar']);
      });
    }
  }

  
  public onChange(event: any): void {
    if (this.form.controls.precioVenta.value < this.form.controls.costo.value) {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Your work has been saved',
        showConfirmButton: false,
        timer: 1000
      })
    }
  }

}

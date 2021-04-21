import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { exit } from 'process';
import { Observable } from 'rxjs';
import { ClienteService } from 'src/app/services/servicios/cliente.service';
import { ComprasService } from 'src/app/services/servicios/compras.service';
import { ComprobanteService } from 'src/app/services/servicios/comprobante.service';
import { DetallesCompraService } from 'src/app/services/servicios/detalles-compra.service';
import { DetalleVentaService } from 'src/app/services/servicios/detalles-venta.service';
import { MediosPagoService } from 'src/app/services/servicios/medios-pago.service';
import { ProductoService } from 'src/app/services/servicios/producto.service';
import { ProveedorService } from 'src/app/services/servicios/proveedor.service';
import { ServicioService } from 'src/app/services/servicios/servicio.service';
import { UtilesService } from 'src/app/services/servicios/utiles.service';
import { VentaService } from 'src/app/services/servicios/venta.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-venta-edit',
  templateUrl: './venta-edit.component.html',
  styleUrls: ['./venta-edit.component.scss']
})
export class VentaEditComponent implements OnInit {
  columnas: string[] = ['cantidad', 'producto_servicio', 'precioVenta', 'monto', 'borrar'];
  /*
    constructor(public detalleId: number, public cantidad: number, public ventasId: number,
              public monto: number, public subtotal: number, public descuento: number, public productoId: any,
              public servicioId: any, public usuarioId: any
      )
  */
 model: NgbDateStruct;
  proveedores: any[] = [];
  medios: any[] = [];
  usuarios: any[] = [];
  productos: any[] = [];
  productoId: number;
  datos: DetalleVenta[] = [];
  datosGuardar: DetalleVenta[] = [];
  datosEliminar: DetalleVenta[] = [];
  datosTemporal: DetalleVenta[] = [];
  compra: any;
  esProducto = false;
  esServicio = false;
  prefixComprobante = "001-001-";

  com: any;
  resTemp: any;
  totalVenta = 0;
  ivaDiez = 0;
  ivaCinco = 0;
  ivaTotal = 0;
  subTotalCinco = 0;
  subTotalDiez = 0;
  subTotalExenta = 0;
  subTotalTotal = 0;
  nextComprobante = 0;
  comprobanteActual:any = null;
  codigoPuntoExpedicion:any = 0;
  fechaActual: number = Date.now();
  index: 0;
  pageActual: 1;

  selectedValue: number;
  selectedProd: any;
  constructor(
    private fbc: FormBuilder,
    private fmp: FormBuilder,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private compraService: ComprasService,
    private ventaService: VentaService,
    private comprobanteService: ComprobanteService,
    private proveedorService: ProveedorService,
    private productoService: ProductoService,
    private servicioService: ServicioService,
    private detallesService: DetalleVentaService,
    private medioService: MediosPagoService,
    private usuarioService: ClienteService,
    private medioPagoService: MediosPagoService,
    private clienteService: ClienteService,
    private router: Router,
    public util: UtilesService) { 
      this.formMedio = this.fmp.group({
        codigo: ['', Validators.required],
        descripcion: ['', Validators.required]
      });
      this.formCliente = this.fbc.group({
        nombre: ['', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required],
        apellido: ['', Validators.required],
        correo: ['', Validators.required],
        ruc: ['', Validators.required],
        telefono: ['', Validators.required],
        sexo: ['', Validators.required],
        estado: [1]
      });
      this.form = this.fb.group({
        fecha: [this.fechaActual],
        montoTotal: [this.totalVenta, Validators.required],
        numeroComprobante: [ this.nextComprobante, Validators.required],
        comprobanteId: [''],
        ivaCinco: [this.ivaCinco],
        ivaDiez: [this.ivaDiez],
        ivaTotal: [this.ivaTotal],
        subTotalCinco: [this.subTotalCinco],
        subTotalDiez: [this.subTotalDiez],
        subTotalExenta: [this.subTotalExenta],
        subTotalTotal: [this.subTotalTotal],
        medioPagoId: ['', Validators.required],
        usuarioId: [ Validators.required],
        estado: ['Activo']
      });
    }

    form = this.fb.group({
      fecha: [this.fechaActual],
      montoTotal: [this.totalVenta, Validators.required],
      numeroComprobante: [ this.nextComprobante, Validators.required],
      comprobanteId: [''],
      ivaCinco: [this.ivaCinco],
      ivaDiez: [this.ivaDiez],
      ivaTotal: [this.ivaTotal],
      subTotalCinco: [this.subTotalCinco],
      subTotalDiez: [this.subTotalDiez],
      subTotalExenta: [this.subTotalExenta],
      subTotalTotal: [this.subTotalTotal],
      medioPagoId: ['', Validators.required],
      usuarioId: [ Validators.required],
      estado: ['Activo']
    });

    formMedio = this.fmp.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    formCliente = this.fbc.group({
      nombre: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', Validators.required],
      ruc: ['', Validators.required],
      telefono: ['', Validators.required],
      sexo: ['', Validators.required],
      estado: [1]
      });
  
    get correo() { return this.formCliente.get('correo'); }
    get telefono() { return this.formCliente.get('telefono'); }
    
    medioPago: any[] = [];

    currentDate: number = Date.now();
    articuloselect: DetalleVenta = new DetalleVenta(0, 1, 0, 0, 0, 0, 0);

    @ViewChild(MatTable) tabla1: MatTable<DetalleVenta>;
    @ViewChild(MatTable) tab: MatTable<DetalleVenta>;

    cargaServicio(){
      console.log('cargaServicio funciona');
      this.esServicio = true;
      this.servicioService.listarRecurso()
      .subscribe( (resp: any[]) =>  this.productos = resp  );
    }

    cargaProducto(){
      console.log('cargaProducto funciona');
      this.esProducto = true;
      this.esServicio = false;
      this.productoService.listarRecurso()
      .subscribe( (resp: any[]) =>  this.productos = resp  );
    }

    ceroIzquierda(numero, ancho) {
      const numberOutput = Math.abs(numero); /* Valor absoluto del número */
      const length = numero.toString().length; /* Largo del número */ 
      const zero = '0'; /* String de cero */
      if (ancho <= length) {
          if (numero < 0) {
               return ('-' + numberOutput.toString());
          } else {
               return numberOutput.toString(); 
          }
      } else {
          if (numero < 0) {
              return ("-" + (zero.repeat(ancho - length)) + numberOutput.toString()); 
          } else {
              return ((zero.repeat(ancho - length)) + numberOutput.toString()); 
          }
      }
    }


    borrarFila(cod: number) {
      if (confirm('Realmente quiere borrarlo?')) {
        console.log('total venta');
        console.log(this.totalVenta);
        console.log('monto a restar');
        console.log((this.datos[cod].cantidad * this.datos[cod].precio));
        this.totalVenta = this.totalVenta - (this.datos[cod].cantidad * this.datos[cod].precio);
        
        
        if (this.datos[cod].servicioId == 0) {
          this.selectedProd = this.datos[cod].productoId;
          if (this.selectedProd.impuestoId.impuestoId == 1){
            console.log('impuesto 10');
            this.ivaDiez = this.ivaDiez - Math.round( this.datos[cod].monto/(((Math.round(this.datos[cod].monto * this.selectedProd.impuestoId.valor)/100) + this.datos[cod].monto)/Math.round((this.datos[cod].monto *this.selectedProd.impuestoId.valor)/100 )));
            this.form.controls.ivaDiez.setValue(this.ivaDiez);
            console.log(this.ivaDiez);
            this.subTotalDiez = this.subTotalDiez - this.datos[cod].monto;
            this.form.controls.subTotalDiez.setValue(this.subTotalDiez);
          } else if (this.selectedProd.impuestoId.impuestoId == 2){
            console.log('iva 5');
            this.ivaCinco = this.ivaCinco - Math.round( this.datos[cod].monto/(((Math.round(this.datos[cod].monto * this.selectedProd.impuestoId.valor)/100) + this.datos[cod].monto)/Math.round((this.datos[cod].monto *this.selectedProd.impuestoId.valor)/100 )));
            this.form.controls.ivaCinco.setValue(this.ivaCinco);
            console.log(this.ivaCinco);
            this.subTotalCinco = this.subTotalCinco - this.datos[cod].monto;
            this.form.controls.subTotalCinco.setValue(this.subTotalCinco);
          } else {
            console.log('exenta');
            this.subTotalExenta = this.subTotalExenta - this.datos[cod].monto;
            this.form.controls.subTotalExenta.setValue(this.subTotalExenta);
          }
          this.ivaTotal = this.ivaCinco + this.ivaDiez;
          this.form.controls.ivaTotal.setValue(this.ivaTotal);
          this.subTotalTotal = this.subTotalCinco + this.subTotalDiez + this.subTotalExenta;
          this.form.controls.subTotalTotal.setValue(this.subTotalTotal);    
          
        } else {
          this.selectedProd = this.datos[cod].servicioId;
          if (this.selectedProd.impuestoId.impuestoId == 1){
            console.log('impuesto 10');
            this.ivaDiez = this.ivaDiez - Math.round( this.datos[cod].monto/(((Math.round(this.datos[cod].monto * this.selectedProd.impuestoId.valor)/100) + this.datos[cod].monto)/Math.round((this.datos[cod].monto *this.selectedProd.impuestoId.valor)/100 )));
            this.form.controls.ivaDiez.setValue(this.ivaDiez);
            console.log(this.ivaDiez);
            this.subTotalDiez = this.subTotalDiez - this.articuloselect.monto;
            this.form.controls.subTotalDiez.setValue(this.subTotalDiez);
          } else if (this.selectedProd.impuestoId.impuestoId == 2){
            console.log('iva 5');
            this.ivaCinco = this.ivaCinco - Math.round( this.datos[cod].monto/(((Math.round(this.datos[cod].monto * this.selectedProd.impuestoId.valor)/100) + this.datos[cod].monto)/Math.round((this.datos[cod].monto *this.selectedProd.impuestoId.valor)/100 )));
            this.form.controls.ivaCinco.setValue(this.ivaCinco);
            console.log(this.ivaCinco);
            this.subTotalCinco = this.subTotalCinco - this.articuloselect.monto;
            this.form.controls.subTotalCinco.setValue(this.subTotalCinco);
          } else {
            console.log('exenta');
            this.subTotalExenta = this.subTotalExenta - this.articuloselect.monto;
            this.form.controls.subTotalExenta.setValue(this.subTotalExenta);
          }
          this.ivaTotal = this.ivaCinco + this.ivaDiez;
          this.form.controls.ivaTotal.setValue(this.ivaTotal);
          this.subTotalTotal = this.subTotalCinco + this.subTotalDiez + this.subTotalExenta;
          this.form.controls.subTotalTotal.setValue(this.subTotalTotal);
        }










        this.datosEliminar.push(new DetalleVenta(this.datos[cod].detalleId, this.datos[cod].cantidad, this.datos[cod].ventasId,
          this.datos[cod].precio, this.datos[cod].monto, this.datos[cod].productoId,
           this.datos[cod].servicioId));
        console.log(this.datosEliminar);
        this.datos.splice(cod, 1);
        this.datosGuardar.splice(cod, 1);
        this.tabla1.renderRows();
      }
      console.log(this.datos);
    }

    agregar() {
      /* controlar que se seleccione el producto para agregar fila a la tabla */
      if (this.selectedProd === 0 ||  this.selectedProd === '--' || this.selectedProd === undefined) {
        console.log('hay que validar');
        console.log(this.articuloselect.productoId);
        Swal.fire(
          '',
          'Debe selecionar un producto o servicio!',
          'warning'
        );
        exit();
      }
      /***/

      /* controlar que no se dupliquen productos antes de agregar fila a la tabla */
      for (let detalle of this.datos) {
        console.log('articulo seleccionado');
        console.log(detalle);
        if (!this.esServicio) {
            if (detalle.productoId.productoId === this.selectedProd.productoId) {
                    console.log('hay que validar producto');
                    console.log(this.articuloselect.productoId);
                    Swal.fire(
                      'Duplicado',
                      'Debes seleccionar otro producto o servicio!',
                      'warning'
                    );
                    exit();
            }
        } else {
          if (detalle.servicioId.servicioId === this.selectedProd.servicioId) {
            console.log('hay que validar servicio');
            console.log(this.articuloselect.productoId);
            Swal.fire(
              'Duplicado',
              'Debes seleccionar otro producto o servicio!',
              'warning'
            );
            exit();
          }
        }
      }
      /***/

      console.log('producto seleccionado' + this.selectedProd);
      if (this.esServicio) {
        //this.articuloselect.precio = this.articuloselect.productoId.costo * this.articuloselect.cantidad;
        this.articuloselect.precio = this.articuloselect.productoId.costo;
        this.articuloselect.monto = this.articuloselect.precio * this.articuloselect.cantidad;
        this.articuloselect.servicioId = this.articuloselect.productoId;
        console.log('asfsf' + this.articuloselect.monto);
        this.datosGuardar.push(new DetalleVenta(0, this.articuloselect.cantidad, this.articuloselect.ventasId,
          this.articuloselect.precio, this.articuloselect.monto, null,
          this.articuloselect.servicioId));
      } else {
        // controlar existencia del producto
        const stock = this.articuloselect.productoId.stockActual - this.articuloselect.cantidad;
        console.log(stock < this.articuloselect.productoId.stockActual);
        if (stock < 0) {
            Swal.fire(
              'Existencia insuficiente',
              'La cantidad supera el stock actual : ' + this.articuloselect.productoId.stockActual,
              'warning'
            );
            exit();
        }

        this.articuloselect.precio = this.articuloselect.productoId.precioVenta;
        this.articuloselect.monto = this.articuloselect.productoId.precioVenta * this.articuloselect.cantidad;
        (this.selectedProd.impuestoId.impuestoId == 1) ? console.log('impuesto 10'): console.log('impuesto 5');
        this.datosGuardar.push(new DetalleVenta(0, this.articuloselect.cantidad, this.articuloselect.ventasId,
          this.articuloselect.precio, this.articuloselect.monto, this.articuloselect.productoId,
          null));
      }

      /*-----------calculo de impuestos y subtotales------------ */
      if (this.selectedProd.impuestoId.impuestoId == 1){
        console.log('impuesto 10');
        this.ivaDiez = this.ivaDiez + Math.round( this.articuloselect.monto/(((Math.round(this.articuloselect.monto * this.selectedProd.impuestoId.valor)/100) + this.articuloselect.monto)/Math.round((this.articuloselect.monto *this.selectedProd.impuestoId.valor)/100 )));
        this.form.controls.ivaDiez.setValue(this.ivaDiez);
        console.log(this.ivaDiez);
        this.subTotalDiez = this.subTotalDiez + this.articuloselect.monto;
        this.form.controls.subTotalDiez.setValue(this.subTotalDiez);
      } else if (this.selectedProd.impuestoId.impuestoId == 2){
        console.log('iva 5');
        this.ivaCinco = this.ivaCinco + Math.round( this.articuloselect.monto/(((Math.round(this.articuloselect.monto * this.selectedProd.impuestoId.valor)/100) + this.articuloselect.monto)/Math.round((this.articuloselect.monto *this.selectedProd.impuestoId.valor)/100 )));
        this.form.controls.ivaCinco.setValue(this.ivaCinco);
        console.log(this.ivaCinco);
        this.subTotalCinco = this.subTotalCinco + this.articuloselect.monto;
        this.form.controls.subTotalCinco.setValue(this.subTotalCinco);
      } else {
        console.log('exenta');
        this.subTotalExenta = this.subTotalExenta + this.articuloselect.monto;
        this.form.controls.subTotalExenta.setValue(this.subTotalExenta);
      }
      this.ivaTotal = this.ivaCinco + this.ivaDiez;
      this.form.controls.ivaTotal.setValue(this.ivaTotal);
      this.subTotalTotal = this.subTotalCinco + this.subTotalDiez + this.subTotalExenta;
      this.form.controls.subTotalTotal.setValue(this.subTotalTotal);

      
      // this.articuloselect.subtotal = this.articuloselect.productoId.precioVenta * this.articuloselect.cantidad
      this.totalVenta = this.totalVenta + this.articuloselect.monto;
      console.log('this.totalVenta');
      console.log(this.totalVenta);
     /* this.datosGuardar.push(new DetalleVenta(0, this.articuloselect.cantidad, this.articuloselect.ventasId, 
        this.articuloselect.precio, this.articuloselect.monto, this.articuloselect.productoId,
        this.articuloselect.servicioId));*/
      // this.articuloselect.productoId = this.selectedProd.descripcion;
      this.datos.push(new DetalleVenta(0, this.articuloselect.cantidad, this.articuloselect.ventasId, 
        this.articuloselect.precio, this.articuloselect.monto, this.articuloselect.productoId,
        this.articuloselect.servicioId));
      this.datosTemporal.push(new DetalleVenta(0, this.articuloselect.cantidad, this.articuloselect.ventasId, 
          this.articuloselect.precio, this.articuloselect.monto, this.articuloselect.productoId,
          this.articuloselect.servicioId));
      console.log(this.datos);
      console.log(this.datosGuardar);
      if (this.esServicio){
        this.tabla1.renderRows();
      } else {
        this.tabla1.renderRows();
      }
      // this.articuloselect = new DetalleVenta(0, 1, 0, 0, 0, 0, 0, 0 , 0); 
    }


    ngOnInit(): void {

      const id = this.route.snapshot.params.id;
      console.log(id);

      this.esServicio = false;
      let currentDate = Date.now();
      this.proveedorService.listarRecurso()
      .subscribe( (resp: any[]) =>  this.proveedores = resp  );

      this.medioService.listarRecurso()
      .subscribe( (resp: any[]) =>  this.medios = resp  );

      /*this.ventaService.getNextId()
      .subscribe( (resp: any) =>  this.nextComprobante = resp + 1);*/

      this.comprobanteService.getNumeroActual(localStorage.getItem('punto'))
        .subscribe( (resp: any) => 
        {
          this.nextComprobante = resp;
          console.log(this.nextComprobante);
          //si ya se llegó al ultimo valor del talonario
          if (this.nextComprobante && this.nextComprobante === 9999){
          console.log(this.nextComprobante);
          Swal.fire(
            'Ha alcanzado el numero máximo del talonario',
            'Debe registrar uno nuevo para continuar',
            'warning'
          );
          //this.router.navigate(['/ventas/listar']);
          this.router.navigate(['/ventas/listar/' + localStorage.getItem('punto')]);
        }
        
        //si no existen talonarios activos
        if(!this.nextComprobante){
          console.log(this.nextComprobante);
          Swal.fire(
            'No existen talonarios activos',
            'Debe registrar uno para continuar',
            'warning'
          );
          //this.router.navigate(['/ventas/listar']);
          this.router.navigate(['/ventas/listar/' + localStorage.getItem('punto')]);
        }
      });

      /*this.comprobanteService.getComprobanteActivo()
        .subscribe((resp:any) => {
          this.comprobanteActual = resp,
          this.codigoPuntoExpedicion = resp.puntoExpedicionCodigo
        });*/

        if (localStorage.getItem('punto') !== 'undefined') {
          this.comprobanteService.getComprobanteActivoPorPuntoExpedicion(localStorage.getItem('punto'))
          .subscribe((resp:any) => {
            /*---------------------Controlamos si el timbrado está vencido--------*/
            let fecha = new Date(resp.finVigencia).getTime();            
            let fechaActual= new Date();
            console.log(fechaActual.getTime() > fecha);
            if(fechaActual.getTime() > fecha){
              console.log(this.nextComprobante);
              Swal.fire(
                'Tibrado vencido',
                'Debe registrar un nuevo talonario',
                'warning'
              );
              this.router.navigate(['/ventas/listar/' + localStorage.getItem('punto')]);
            }
            /*----------------------------------------------------------------------*/
            this.comprobanteActual = resp,
            this.codigoPuntoExpedicion = resp.puntoExpedicionCodigo
          });
        }else{
          this.comprobanteService.getComprobanteActivo()
          .subscribe((resp:any) => {
            this.comprobanteActual = resp,
            this.codigoPuntoExpedicion = resp.puntoExpedicionCodigo
          });
        }

      this.usuarioService.listarRecurso()
      .subscribe( (resp: any[]) =>  this.usuarios = resp  );

      this.productoService.listarRecurso()
      .subscribe( (resp: any[]) =>  this.productos = resp  );

      //const id = this.route.snapshot.params.id;
      if (typeof id !== 'undefined') {
        /*this.form = this.fb.group({
          fecha: [this.fechaActual],
          montoTotal: [this.totalVenta, Validators.required],
          proveedorId: [ Validators.required]*/
          this.form = this.fb.group({
            fecha: [this.fechaActual],
            montoTotal: [this.totalVenta, Validators.required],
            numeroComprobante: ['', Validators.required],
            ivaCinco: [this.ivaCinco],
            ivaDiez: [this.ivaDiez],
            ivaTotal: [this.ivaTotal],
            subTotalCinco: [this.subTotalCinco],
            subTotalDiez: [this.subTotalDiez],
            subTotalExenta: [this.subTotalExenta],
            subTotalTotal: [this.subTotalTotal],
            medioPagoId: ['', Validators.required],
            comprobanteId: [this.comprobanteActual, Validators.required],
            usuarioId: [ Validators.required],
            estado: ['Activo']
        });

          this.ventaService.getRecurso(id)
         .subscribe ((data: any) => {
          console.log(data); 
          this.com = data;
          this.form.controls.fecha.setValue(data.fecha);
          this.totalVenta = Number(data.montoTotal);
          this.form.controls.numeroComprobante.setValue('001-001-'+ this.ceroIzquierda(data.numeroComprobante, 7));
          this.form.controls.medioPagoId.setValue(data.medioPagoId.medioPagoId);
          this.form.controls.comprobanteId.setValue(data.comprobanteId.comprobanteId);
          this.form.controls.usuarioId.setValue(data.usuarioId.usuarioId);
          this.datos = data.ventasDetalleCollection;
          // this.datosGuardar = data.ventasDetalleCollection;
          console.log(this.datos);
         });
      }
    }

    guardar() {
      const id = this.route.snapshot.params.id;
      let peticion: Observable<any>;
      let ventasId: number;
      console.log(this.form.get('fecha').value);

      if (typeof id === 'undefined') {
        this.form.controls.comprobanteId.setValue(this.comprobanteActual.comprobanteId);
        peticion = this.ventaService.agregarRecurso(this.form.value);
        console.warn(this.form.value);
        peticion.subscribe((result: any) =>  {
          console.log(result),
          ventasId = result.ventasId,
          Swal.fire(
            'Guardado!',
            'Se guardaron  los datos!',
            'success'
          );
  
          for (let detalle of this.datosGuardar){
            console.warn(detalle);
            detalle.ventasId = ventasId;
            if (detalle.servicioId != null){
              console.log('es servicio');
              console.log(detalle.servicioId);
              if (detalle.servicioId.duracion !== undefined){
                detalle.servicioId.duracion = this.util.cortarString( detalle.servicioId.duracion, 0, 5);
              }
            }
            this.detallesService.agregarRecurso(detalle).subscribe(( res: any) => {
              console.log(res);
            });
          }

          /*this.ventaService.actualizarCabecera(ventasId).subscribe(( res: any) => {
            console.log(res);
            peticion = this.ventaService.modificarRecurso(res, ventasId);
            peticion.subscribe((result: any) =>  {});
          });*/

        });
      } else {
        this.form.controls.numeroComprobante.setValue(id);
        peticion = this.ventaService.modificarRecurso(this.form.value, id);
        peticion.subscribe((result: any) =>  {
          console.log(result);
          ventasId = id,
          Swal.fire(
            'Guardado!',
            'Se actualizaron los datos!',
            'success'
          );
  
          for (let detalle of this.datosGuardar){
            detalle.ventasId = ventasId;
            this.detallesService.agregarRecurso(detalle).subscribe(( res: any) => {
              console.log(res);
            });
          }
  
          for (let detalle of this.datosEliminar){
            this.borrarDetalle(detalle.detalleId);
          }
  
        });
      }
      
      this.router.navigate(['/ventas/listar/' + localStorage.getItem('punto')]);

    }

    borrarDetalle(cod: number) {
      console.log(cod);
      this.detallesService.eliminarRecurso(cod).subscribe(( res: any) => {
        console.log(res);
      });
    }


    guardarMedio() {
      const id = this.route.snapshot.params.id;
      let peticion: Observable<any>;
      console.log(id);
      
        console.warn(this.formMedio.value);
        peticion = this.medioPagoService.agregarRecurso(this.formMedio.value);
        peticion.subscribe((result: any) =>  {
          Swal.fire(
            'Guardado!',
            'Se guardaron  los datos!',
            'success'
          );
        });
        console.log(this.router.url);
        this.ngOnInit();
    }

    guardarCliente() {
      // console.warn(this.form.value);
        const id = this.route.snapshot.params.id;
        let peticion: Observable<any>;
        
           peticion = this.clienteService.agregarRecurso(this.formCliente.value);
           peticion.subscribe((result: any) =>  {
             Swal.fire(
               'Guardado!',
               'Se guardaron los datos!',
               'success'
             );
           });
           this.ngOnInit();
       }
    regresar(){
       this.router.navigate(['/ventas/listar/' + localStorage.getItem('punto')]);
    }

}

export class DetalleVenta {
  constructor(public detalleId: number, public cantidad: number, public ventasId: number,
              public precio: number , public monto: number, public productoId: any,
              public servicioId: any
      ) {
  }
}
import { Component, OnInit, ElementRef, ViewChild, HostListener, NgZone } from '@angular/core';

//Mis imports
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../../services/ruta-base/ruta-base.service';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl  } from '@angular/forms';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AgmCoreModule, MapsAPILoader } from '@agm/core';
import { Observable, Observer } from 'rxjs';

declare const $: any;
declare var google: any;

@Component({
  selector: 'ngx-ver-prod',
  templateUrl: './establecimientos-ver.component.html',
  /*styles: [`
    nb-card {
      transform: translate3d(0, 0, 0);
    }
  `],*/
  styleUrls: ['./establecimientos-ver.component.scss'],
})
export class EstablecimientosVerComponent implements OnInit{

  //----Alertas---<
  config: ToasterConfig;

  position = 'toast-top-right';
  animationType = 'fade';
  title = 'HI there!';
  content = `I'm cool toaster!`;
  timeout = 5000;
  toastsLimit = 5;
  type = 'default'; // 'default', 'info', 'success', 'warning', 'error'

  isNewestOnTop = true;
  isHideOnClick = true;
  isDuplicatesPrevented = false;
  isCloseButton = true;
  //----Alertas--->

  private data:any;
  public productList:any;
  public productos:any;

  objAEditar: any;
  objAEliminar: any;
  eliminar_id: any;
  eliminar_nombre: any;

  public loading = false;
  public editando = false;
  public agregando = false;
  public mostrar = true;

  public subiendoImg = false;

  //Formularios
  myFormEditar: FormGroup;

  public productList2:any;

  public habEstablecimiento:any;

  public estableSelecAux:any;

  public mostrarSwiches = true;

  public admin = false;

  //Mapa
  private zone: NgZone;

  lat: number = 26.047172833607;
  lng: number = -98.292354481476;
  zoom: number = 16;

  public searchControl: FormControl;
  public latitude: number;
  public longitude: number;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  mapa = false;

  public estados:any;
  public ciudades:any;

  public mouvers_user_tipo = localStorage.getItem('mouvers_user_tipo');

  constructor( private modalService: NgbModal,
               private toasterService: ToasterService,
               private http: HttpClient,
               private router: Router,
               private rutaService: RutaBaseService,
               public fb: FormBuilder,
               private mapsAPILoader: MapsAPILoader,
               private ngZone: NgZone)
  {
    
    this.myFormEditar = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      lat: ['', [Validators.required]],
      lng: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: [''],
      password2: [''],
      telefono: ['', [Validators.required]],
      ciudad: ['', [Validators.required]],
      estado_geo: ['', [Validators.required]],

        lunes_i: ['00', [Validators.required]],
        lunes_f: ['00', [Validators.required]],
        martes_i: ['00', [Validators.required]],
        martes_f: ['00', [Validators.required]],
        miercoles_i: ['00', [Validators.required]],
        miercoles_f: ['00', [Validators.required]],
        jueves_i: ['00', [Validators.required]],
        jueves_f: ['00', [Validators.required]],
        viernes_i: ['00', [Validators.required]],
        viernes_f: ['00', [Validators.required]],
        sabado_i: ['00', [Validators.required]],
        sabado_f: ['00', [Validators.required]],
        domingo_i: ['00', [Validators.required]],
        domingo_f: ['00', [Validators.required]],
    });
  }

  ngOnInit() {

    if (this.mouvers_user_tipo != '1') {
      localStorage.removeItem('mouvers_token');
      localStorage.removeItem('mouvers_user_id');
      localStorage.removeItem('mouvers_user_nombre');
      localStorage.removeItem('mouvers_user_tipo');
      localStorage.removeItem('mouvers_establecimiento_id');

      this.router.navigateByUrl('/pagessimples/loginf');
    }

    this.inicializarMapa();
    
    this.loading = true;
    this.http.get(this.rutaService.getRutaApi()+'establecimientos?token='+localStorage.getItem('mouvers_token'))
       .toPromise()
       .then(
         data => { // Success

           console.log(data);
           this.data=data;
           this.productList = this.data.establecimientos;
           this.filteredItems = this.productList;
           //console.log(this.productList);

           this.init();

           this.loading = false;

           this.getEstados();

         },
         msg => { // Error
           console.log(msg);
           console.log(msg.error.error);

           this.loading = false;

           //token invalido/ausente o token expiro
           if(msg.status == 400 || msg.status == 401){ 
                //alert(msg.error.error);

                this.showToast('warning', 'Warning!', msg.error.error);
                this.mostrar = false;
                setTimeout(()=>{
                  this.router.navigateByUrl('/pagessimples/loginf');
                },1000);
            }
            //sin establecimientos
            else if(msg.status == 404){ 
                //alert(msg.error.error);
                this.showToast('info', 'Info!', msg.error.error);
            }
            

         }
       );
  }

  public inicializarMapa(){
          this.zone = new NgZone({ enableLongStackTrace: false });
    
          //create search FormControl
          this.searchControl = new FormControl();
          
          //set current position
          this.setCurrentPosition();
          
          //load Places Autocomplete
          this.mapsAPILoader.load().then(() => {

          var defaultBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(26.077848, -98.375664),
            new google.maps.LatLng(26.077543, -98.276901),
            new google.maps.LatLng(26.058949, -98.283691),
            new google.maps.LatLng(26.041180, -98.366295)
          );

          var options = { 
            bounds: defaultBounds,
            //componentRestrictions: {country: "AR"}
            //types: ['(cities)'],
            //componentRestrictions: {country: 'fr'}
          };
          let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
            types: ["address"]
          }, options);
           var circle = new google.maps.Circle({
                  center: {lat:  26.047172833607, lng: -98.292354481476},
                  radius: 10*1000
                });
                autocomplete.setBounds(circle.getBounds());
            autocomplete.addListener("place_changed", () => {
            this.ngZone.run(() => {
              //get the place result
              let place = autocomplete.getPlace();

              //verify result
              if (place.geometry === undefined || place.geometry === null) {
                return;
              }
              console.log(place.formatted_address);
              this.myFormEditar.patchValue({direccion: place.formatted_address });
              //console.log(place.address_components[0].long_name);
              //set latitude, longitude and zoom
              this.latitude = place.geometry.location.lat();
              this.myFormEditar.patchValue({lat: place.geometry.location.lat() });
              this.longitude = place.geometry.location.lng();
              this.myFormEditar.patchValue({lng: place.geometry.location.lng() });
              this.zoom = 11;
              
            });
          });
        });
  }

  public setDir(dir){
    return Observable.create(observer => {
      let geocoder = new google.maps.Geocoder();
      geocoder.geocode({'location': dir}, function(results, status) {
            if (status === 'OK') {
              if (results[1]) {
                console.log(results[1]);
                //alert(JSON.stringify(results[1].formatted_address));
                //this.setDir(results[1].formatted_address);
                 observer.next(results[1].formatted_address);
                 observer.complete();
                
              } else {
                alert('No results found');
                observer.next({});
                observer.complete();
              }
            } else {
              console.log('Geocoder failed due to: ' + status);
              observer.next({});
              observer.complete();
            }
          });
       })
  }

  markerDragEnd($event: MouseEvent) {
    console.log($event);
    var latlng:any;
    
    latlng=$event;
    latlng=latlng.coords;
    this.myFormEditar.patchValue({lat: latlng.lat });
    this.myFormEditar.patchValue({lng: latlng.lng });

    this.setDir(latlng).subscribe(result => {
      this.myFormEditar.patchValue({direccion: result });
      },error => console.log(error),() => console.log('Geocoding completed!')
    );
    
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  uppercase(value: string) {
    //console.log(value);
    return value.toUpperCase();
  }

  setDireccion(){
      setTimeout(()=>{
        this.myFormEditar.patchValue({direccion: this.myFormEditar.value.direccion });
      },500)
    }

  private showToast(type: string, title: string, body: string) {
      this.config = new ToasterConfig({
        positionClass: this.position,
        timeout: this.timeout,
        newestOnTop: this.isNewestOnTop,
        tapToDismiss: this.isHideOnClick,
        preventDuplicates: this.isDuplicatesPrevented,
        animation: this.animationType,
        limit: this.toastsLimit,
      });
      const toast: Toast = {
        type: type,
        title: title,
        body: body,
        timeout: this.timeout,
        showCloseButton: this.isCloseButton,
        bodyOutputType: BodyOutputType.TrustedHtml,
      };
      this.toasterService.popAsync(toast);
  }

  getEstados(): void {

    this.loading = true;

    this.http.get(this.rutaService.getRutaApi()+'entidades/municipios?token='+localStorage.getItem('mouvers_token'))
  
       .toPromise()
       .then(
         data => { // Success
           console.log(data);
           this.data = data;
           this.estados=this.data.entidades;
           this.loading = false; 
         },
         msg => { // Error
           //console.log(msg);
           console.log(msg.error.error);
           this.loading = false;

           //token invalido/ausente o token expiro
           if(msg.status == 400 || msg.status == 401){ 
                //alert(msg.error.error);
                //ir a login
                this.showToast('warning', 'Warning!', msg.error.error);
                setTimeout(()=>{
                  this.router.navigateByUrl('/pagessimples/loginf');
                },1000);
            }
            else if(msg.status == 404){ 
                //alert(msg.error.error);
                this.showToast('info', 'Info!', msg.error.error);
            }

         }
       );
   }

  setEstado1(estado): void {
    console.log(estado);
    for (var i = 0; i < this.estados.length; ++i) {
      if (estado == this.estados[i].nom_ent) {
        this.ciudades = this.estados[i].municipios;
      }
    }
  }  

  setEstado2(estado): void {
    console.log(estado);
    for (var i = 0; i < this.estados.length; ++i) {
      if (estado == this.estados[i].nom_ent) {
        this.ciudades = this.estados[i].municipios;

        this.myFormEditar.patchValue({ciudad : this.ciudades[0].nom_mun});
      }
    }
  }

  //Abrir modal por defecto
  open(modal) {
    this.modalService.open(modal);
  }

  //Abrir modal larga
  open2(modal) {
    this.modalService.open(modal , { size: 'lg', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

    atras(): void {
      this.editando = false;
      this.objAEditar = null;
      //console.log(this.objAEditar);

      //this.uploadFile = null;
      this.myFormEditar.reset();
      this.mapa = false;

    }

    public horario= {Lunes: {inicio: "01",fin: "02"},Martes: {inicio: "00",fin: "00"},Miercoles: {inicio: "00",fin: "00"},Jueves: {inicio: "00",fin: "00"},Viernes: {inicio: "00",fin: "00"},Sabado: {inicio: "00",fin: "00"},Domingo: {inicio: "00",fin: "00"}};
    public horas= JSON.parse('[{"h":"00"},{"h":"01"},{"h":"02"},{"h":"03"},{"h":"04"},{"h":"05"},{"h":"06"},{"h":"07"},{"h":"08"},{"h":"09"},{"h":"10"},{"h":"11"},{"h":"12"},{"h":"13"},{"h":"14"},{"h":"15"},{"h":"16"},{"h":"17"},{"h":"18"},{"h":"19"},{"h":"20"},{"h":"21"},{"h":"22"},{"h":"23"}]');
  

    aEditar(obj): void {
      //this.editando = true;
      this.objAEditar = Object.assign({},obj);
      console.log(this.objAEditar);

      this.myFormEditar.patchValue({id : this.objAEditar.id});
      this.myFormEditar.patchValue({nombre : this.objAEditar.nombre});
      this.myFormEditar.patchValue({direccion : this.objAEditar.direccion});
      this.myFormEditar.patchValue({lat : this.objAEditar.lat});
      this.myFormEditar.patchValue({lng : this.objAEditar.lng});

      if (this.objAEditar.usuario) {
        this.myFormEditar.patchValue({email : this.objAEditar.usuario.email});
        this.myFormEditar.patchValue({password : ''});
        this.myFormEditar.patchValue({password2 : ''});
        this.myFormEditar.patchValue({telefono : this.objAEditar.usuario.telefono});
        this.myFormEditar.patchValue({ciudad : this.objAEditar.usuario.ciudad});
        this.myFormEditar.patchValue({estado_geo : this.objAEditar.usuario.estado});

        this.setEstado1(this.objAEditar.usuario.estado);
      }else{
        this.myFormEditar.patchValue({email : ''});
        this.myFormEditar.patchValue({password : ''});
        this.myFormEditar.patchValue({password2 : ''});
        this.myFormEditar.patchValue({telefono : ''});
        this.myFormEditar.patchValue({ciudad : ''});
        this.myFormEditar.patchValue({estado_geo : ''});
      }


        this.myFormEditar.patchValue({ lunes_i: this.objAEditar.lunes_i });
        this.myFormEditar.patchValue({ lunes_f: this.objAEditar.lunes_f });
        this.myFormEditar.patchValue({ martes_i: this.objAEditar.martes_i });
        this.myFormEditar.patchValue({ martes_f: this.objAEditar.martes_f });
        this.myFormEditar.patchValue({ miercoles_i: this.objAEditar.miercoles_i });
        this.myFormEditar.patchValue({ miercoles_f: this.objAEditar.miercoles_f });
        this.myFormEditar.patchValue({ jueves_i: this.objAEditar.jueves_i });
        this.myFormEditar.patchValue({ jueves_f: this.objAEditar.jueves_f });
        this.myFormEditar.patchValue({ viernes_i: this.objAEditar.viernes_i });
        this.myFormEditar.patchValue({ viernes_f: this.objAEditar.viernes_f });
        this.myFormEditar.patchValue({ sabado_i: this.objAEditar.sabado_i });
        this.myFormEditar.patchValue({ sabado_f: this.objAEditar.sabado_f });
        this.myFormEditar.patchValue({ domingo_i: this.objAEditar.domingo_i });
        this.myFormEditar.patchValue({ domingo_f: this.objAEditar.domingo_f });

        console.log(this.myFormEditar);

      setTimeout(()=>{
        //this.inicializarMapa();
        this.editando = true;
        this.latitude = parseFloat(this.myFormEditar.value.lat);
        this.longitude = parseFloat(this.myFormEditar.value.lng);
        this.mapa = true;       
      },500)
    }

    editar(): void {
      if (this.myFormEditar.value.password != '' || this.myFormEditar.value.password2 != '') {
        if (this.myFormEditar.value.password != this.myFormEditar.value.password2) {
          this.showToast('warning', 'Warning!', 'Las contraseñas no coinciden.');
        }else{
          this.editarEst();
        }
      }else {
        this.editarEst();
      }
    }

    editarEst(): void {
      
      this.loading = true;

      var datos= {
        token: localStorage.getItem('mouvers_token'),
        nombre: this.myFormEditar.value.nombre,
        direccion: this.myFormEditar.value.direccion,
        lat: this.myFormEditar.value.lat,
        lng: this.myFormEditar.value.lng,

        email: this.myFormEditar.value.email,
        password: this.myFormEditar.value.password,
        telefono: this.myFormEditar.value.telefono,
        ciudad: this.myFormEditar.value.ciudad,
        estado_geo: this.myFormEditar.value.estado_geo,

        lunes_i: this.myFormEditar.value.lunes_i,
        lunes_f: this.myFormEditar.value.lunes_f,
        martes_i: this.myFormEditar.value.martes_i,
        martes_f: this.myFormEditar.value.martes_f,
        miercoles_i: this.myFormEditar.value.miercoles_i,
        miercoles_f: this.myFormEditar.value.miercoles_f,
        jueves_i: this.myFormEditar.value.jueves_i,
        jueves_f: this.myFormEditar.value.jueves_f,
        viernes_i: this.myFormEditar.value.viernes_i,
        viernes_f: this.myFormEditar.value.viernes_f,
        sabado_i: this.myFormEditar.value.sabado_i,
        sabado_f: this.myFormEditar.value.sabado_f,
        domingo_i: this.myFormEditar.value.domingo_i,
        domingo_f: this.myFormEditar.value.domingo_f
      }

      this.http.put(this.rutaService.getRutaApi()+'establecimientos/'+this.myFormEditar.value.id, datos)
         .toPromise()
         .then(
           data => { // Success
              console.log(data);
              this.data = data;

              for (var i = 0; i < this.productList.length; ++i) {
                if (this.productList[i].id == this.myFormEditar.value.id) {
                   this.productList[i].nombre = this.myFormEditar.value.nombre;
                   this.productList[i].direccion = this.myFormEditar.value.direccion;

                   this.productList[i].usuario.nombre = this.myFormEditar.value.nombre;
                   this.productList[i].usuario.email = this.myFormEditar.value.email;
                   this.productList[i].usuario.telefono = this.myFormEditar.value.telefono;
                   this.productList[i].usuario.ciudad = this.myFormEditar.value.ciudad;
                   this.productList[i].usuario.estado = this.myFormEditar.value.estado_geo;
                   
                   this.productList[i].lunes_i = this.myFormEditar.value.lunes_i;
                   this.productList[i].lunes_f = this.myFormEditar.value.lunes_f;
                   this.productList[i].martes_i = this.myFormEditar.value.martes_i;
                   this.productList[i].martes_f = this.myFormEditar.value.martes_f;
                   this.productList[i].miercoles_i = this.myFormEditar.value.miercoles_i;
                   this.productList[i].miercoles_f = this.myFormEditar.value.miercoles_f;
                   this.productList[i].jueves_i = this.myFormEditar.value.jueves_i;
                   this.productList[i].jueves_f = this.myFormEditar.value.jueves_f;
                   this.productList[i].viernes_i = this.myFormEditar.value.viernes_i;
                   this.productList[i].viernes_f = this.myFormEditar.value.viernes_f;
                   this.productList[i].sabado_i = this.myFormEditar.value.sabado_i;
                   this.productList[i].sabado_f = this.myFormEditar.value.sabado_f;
                   this.productList[i].domingo_i = this.myFormEditar.value.domingo_i;
                   this.productList[i].domingo_f = this.myFormEditar.value.domingo_f;
                   this.productList[i].lat = this.myFormEditar.value.lat;
                   this.productList[i].lng = this.myFormEditar.value.lng;
                }
              }

              this.filteredItems = this.productList;
              this.init();
              
              //console.log(this.productList);
              //alert(this.data.message);

              this.loading = false;
              this.editando = false;
              this.mapa = false;
              this.showToast('success', 'Success!', this.data.message); 
           },
           msg => { // Error
             console.log(msg);
             console.log(msg.error.error);

             this.loading = false;

             //token invalido/ausente o token expiro
             if(msg.status == 400 || msg.status == 401){ 
                  //alert(msg.error.error);
                  //ir a login
                  this.editando = true;
                  this.showToast('warning', 'Warning!', msg.error.error);
              }
              else { 
                  //alert(msg.error.error);
                  this.editando = true;
                  this.showToast('error', 'Erro!', msg.error.error);
              }
           }
         );
    }

    aEliminar(obj): void {
      this.objAEliminar = obj;
      //console.log(this.objAEliminar);
      this.eliminar_id = this.objAEliminar.id;
      this.eliminar_nombre = this.objAEliminar.nombre;
    }

    eliminar(): void {
      console.log(this.objAEliminar);
      
      this.loading = true;

      var datos= {
        token: localStorage.getItem('mouvers_token')
      }

      this.http.delete(this.rutaService.getRutaApi()+'establecimientos/'+this.eliminar_id+'?token='+localStorage.getItem('mouvers_token'))
         .toPromise()
         .then(
           data => { // Success
              console.log(data);
              this.data = data;

              var aux = this.productList;
              this.productList = [];

              for (var i = 0; i < aux.length; ++i) {
                if (aux[i].id != this.eliminar_id) {
                   this.productList.push(aux[i]);
                }
              }

              this.filteredItems = this.productList;
              this.init();
              
              //console.log(this.productList);
              //alert(this.data.message);
              this.loading = false;
              this.showToast('success', 'Success!', this.data.message);    
           },
           msg => { // Error
             console.log(msg);
             console.log(msg.error.error);

             this.loading = false;

             //token invalido/ausente o token expiro
             if(msg.status == 400 || msg.status == 401){ 
                  //alert(msg.error.error);
                  //ir a login

                  this.showToast('warning', 'Warning!', msg.error.error);
              }
              //no encontrado o conflicto
              else if(msg.status == 404 || msg.status == 409){ 
                  //alert(msg.error.error);
                  this.showToast('error', 'Erro!', msg.error.error);
              }

           }
         );
    }

    cambioSwicheEstable(obj, modal2): void{
      //console.log(obj.estado);

      this.estableSelecAux = obj;

      if (obj.estado == 'ON') {
        //Apagando categoria
        this.cambiarEstado(obj);
      }else{
        //Encendiendo categoria
        this.cargarProductos(obj, modal2);
      }
    }


    //Para el establecimiento
    cambiarEstado(obj): void {

      var v_estado: any;

      if (obj.estado == 'ON') {
        //obj.estado = 'OFF';
        v_estado = 'OFF';
      }else{
        //obj.estado = 'ON';
        v_estado = 'ON';
      }

      var datos= {
        token: localStorage.getItem('mouvers_token'),
        estado: v_estado
      }

      this.http.put(this.rutaService.getRutaApi()+'establecimientos/'+obj.id, datos)
         .toPromise()
         .then(
           data => { // Success
              console.log(data);
              this.data = data;
              this.showToast('success', 'Success!', this.data.message);
              obj.estado = v_estado;
              
           },
           msg => { // Error
             console.log(msg);
             console.log(msg.error.error);

              //Regresar el switch en caso de error
              if (v_estado == 'ON') {
                //obj.estado = 'OFF';
                obj.estado = 'OFF';
              }else{
                //obj.estado = 'ON';
                obj.estado = 'ON';
              }

             //token invalido/ausente o token expiro
             if(msg.status == 400 || msg.status == 401){ 
                  //alert(msg.error.error);
                  //ir a login

                  this.showToast('warning', 'Warning!', msg.error.error);
              }
              else { 
                  //alert(msg.error.error);
                  this.showToast('error', 'Erro!', msg.error.error);
              }
           }
         );
    }

    cargarProductos(obj, modal2): void {

      this.loading = true;

      this.http.get(this.rutaService.getRutaApi()+'establecimientos/'+obj.id+'/productos?token='+localStorage.getItem('mouvers_token'))
         .toPromise()
         .then(
           data => { // Success
              console.log(data);
              this.data=data;
              this.productList2 = this.data.productos;
              this.filteredItems2 = this.productList2;
              //console.log(this.productList2);

              this.init2();
              
              this.loading = false;

              if (this.productList2.length == 0) {
                //alert('La categoria no tiene subcategorias');
                //Se cambia solo el estado del estable
                this.cambiarEstado(obj);
              }else{
                //alert('La categoria tiene '+this.productList2.length+' subcategorias');
                //Se muestra la modal para elgir los productos q se quieren habilitar junto con el estable
                this.habEstablecimiento = obj;
                this.open2(modal2);
                this.mostrarSwiches = false;
              }
           },
           msg => { // Error
             console.log(msg);
             console.log(msg.error.error);

             this.loading = false;

             //token invalido/ausente o token expiro
             if(msg.status == 400 || msg.status == 401){ 
                  //alert(msg.error.error);
                  //ir a login
                  this.showToast('warning', 'Warning!', msg.error.error);
              }
              else { 
                  //alert(msg.error.error);
                  this.showToast('error', 'Erro!', msg.error.error);
              }
           }
         );
    }

    apagarSwiche(): void{
      this.mostrarSwiches = true;
    }

    cambioSwicheProd(objProd): void {

      if (objProd.estado == 'ON') {
        objProd.estado = 'OFF';
      }else{
        objProd.estado = 'ON';
      }

    }

    habilitarEstable(): void{
      
      this.mostrarSwiches = true;

      this.loading = true;

      setTimeout(()=>{

        var datos= {
          token: localStorage.getItem('mouvers_token'),
          estado: 'ON',
          productos: JSON.stringify(this.productList2)
          //productos: JSON.stringify(auxProductos)
          //productos: this.productos
          //productos: JSON.stringify(this.productos)
          //productos: '[{"id":1,"cantidad":3,"estado":"ON"},{"id":3,"cantidad":3,"estado":"OFF"}]'
        }

        this.http.put(this.rutaService.getRutaApi()+'establecimientos/'+this.habEstablecimiento.id, datos)
           .toPromise()
           .then(
             data => { // Success
                console.log(data);
                this.data = data;

                this.habEstablecimiento.estado = 'ON';

                this.loading = false;
                this.showToast('success', 'Success!', this.data.message); 
             },
             msg => { // Error
               console.log(msg);
               console.log(msg.error.error);

               this.loading = false;

               //token invalido/ausente o token expiro
               if(msg.status == 400 || msg.status == 401){ 
                    //alert(msg.error.error);
                    //ir a login

                    this.showToast('warning', 'Warning!', msg.error.error);
                }
                else { 
                    //alert(msg.error.error);
                    this.showToast('error', 'Erro!', msg.error.error);
                }
             }
           );

        },300);
    }

   //----Tabla<
   filteredItems : any;
   pages : number = 4;
   pageSize : number = 5;
   pageNumber : number = 0;
   currentIndex : number = 1;
   items: any;
   pagesIndex : Array<number>;
   pageStart : number = 1;
   inputName : string = '';

   init(){
         this.currentIndex = 1;
         this.pageStart = 1;
         this.pages = 4;

         this.pageNumber = parseInt(""+ (this.filteredItems.length / this.pageSize));
         if(this.filteredItems.length % this.pageSize != 0){
            this.pageNumber ++;
         }
    
         if(this.pageNumber  < this.pages){
               this.pages =  this.pageNumber;
         }
       
         this.refreshItems();
         console.log("this.pageNumber :  "+this.pageNumber);
   }

   FilterByName(){
      this.filteredItems = [];
      if(this.inputName != ""){
            for (var i = 0; i < this.productList.length; ++i) {
              if (this.productList[i].nombre.toUpperCase().indexOf(this.inputName.toUpperCase())>=0) {
                 this.filteredItems.push(this.productList[i]);
              }else if (this.productList[i].direccion.toUpperCase().indexOf(this.inputName.toUpperCase())>=0) {
                 this.filteredItems.push(this.productList[i]);
              }
            }
      }else{
         this.filteredItems = this.productList;
      }
      console.log(this.filteredItems);
      this.init();
   }
   fillArray(): any{
      var obj = new Array();
      for(var index = this.pageStart; index< this.pageStart + this.pages; index ++) {
                  obj.push(index);
      }
      return obj;
   }
   refreshItems(){
       this.items = this.filteredItems.slice((this.currentIndex - 1)*this.pageSize, (this.currentIndex) * this.pageSize);
       this.pagesIndex =  this.fillArray();
   }
   prevPage(){
      if(this.currentIndex>1){
         this.currentIndex --;
      } 
      if(this.currentIndex < this.pageStart){
         this.pageStart = this.currentIndex;
      }
      this.refreshItems();
   }
   nextPage(){
      if(this.currentIndex < this.pageNumber){
            this.currentIndex ++;
      }
      if(this.currentIndex >= (this.pageStart + this.pages)){
         this.pageStart = this.currentIndex - this.pages + 1;
      }
 
      this.refreshItems();
   }
    setPage(index : number){
         this.currentIndex = index;
         this.refreshItems();
    }
  //----Tabla>

   //Tabla2 Productos del Estable X----<
   filteredItems2 : any;
   pages2 : number = 4;
   pageSize2 : number = 5;
   pageNumber2 : number = 0;
   currentIndex2 : number = 1;
   items2: any;
   pagesIndex2 : Array<number>;
   pageStart2 : number = 1;
   inputName2 : string = '';

   init2(){
         this.currentIndex2 = 1;
         this.pageStart2 = 1;
         this.pages2 = 4;

         this.pageNumber2 = parseInt(""+ (this.filteredItems2.length / this.pageSize2));
         if(this.filteredItems2.length % this.pageSize2 != 0){
            this.pageNumber2 ++;
         }
    
         if(this.pageNumber2  < this.pages2){
               this.pages2 =  this.pageNumber2;
         }
       
         this.refreshItems2();
         console.log("this.pageNumber2 :  "+this.pageNumber2);
   }

   FilterByName2(){
      this.filteredItems2 = [];
      if(this.inputName2 != ""){
            for (var i = 0; i < this.productList2.length; ++i) {
              if (this.productList2[i].nombre.toUpperCase().indexOf(this.inputName2.toUpperCase())>=0) {
                 this.filteredItems2.push(this.productList2[i]);
              }
            }
      }else{
         this.filteredItems2 = this.productList2;
      }
      console.log(this.filteredItems2);
      this.init2();
   }
   fillArray2(): any{
      var obj = new Array();
      for(var index = this.pageStart2; index< this.pageStart2 + this.pages2; index ++) {
                  obj.push(index);
      }
      return obj;
   }
   refreshItems2(){
       this.items2 = this.filteredItems2.slice((this.currentIndex2 - 1)*this.pageSize2, (this.currentIndex2) * this.pageSize2);
       this.pagesIndex2 =  this.fillArray2();
   }
   prevPage2(){
      if(this.currentIndex2>1){
         this.currentIndex2 --;
      } 
      if(this.currentIndex2 < this.pageStart2){
         this.pageStart2 = this.currentIndex2;
      }
      this.refreshItems2();
   }
   nextPage2(){
      if(this.currentIndex2 < this.pageNumber2){
            this.currentIndex2 ++;
      }
      if(this.currentIndex2 >= (this.pageStart2 + this.pages2)){
         this.pageStart2 = this.currentIndex2 - this.pages2 + 1;
      }
 
      this.refreshItems2();
   }
    setPage2(index : number){
         this.currentIndex2 = index;
         this.refreshItems2();
    }
    //Tabla2 Productos del Estable X---->

}
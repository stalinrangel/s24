import { Component, OnInit, ElementRef, ViewChild, HostListener, NgZone } from '@angular/core';

//Mis imports
import { RouterModule, Routes, Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { RutaBaseService } from '../../services/ruta-base/ruta-base.service';

import { FormBuilder, FormArray, FormGroup, Validators, FormControl  } from '@angular/forms';

import { ToasterService, ToasterConfig, Toast, BodyOutputType } from 'angular2-toaster';
import 'style-loader!angular2-toaster/toaster.css';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { AgmCoreModule, MapsAPILoader, GoogleMapsAPIWrapper } from '@agm/core';
import { Observable, Observer } from 'rxjs';

declare const $: any;
declare var google: any;
//declare var google;

@Component({
  selector: 'ordenar',
  styleUrls: ['./ordenar.component.scss'],
  templateUrl: './ordenar.component.html',
})

export class OrdenarComponent implements OnInit{

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
	public loading = false;

	public mouvers_user_tipo = localStorage.getItem('mouvers_user_tipo');

	public categorias=[];
	public subcategorias=[];
	public productos=[];
	public establecimiento_id = null;
	public solicitud=[];
	public establecimiento=null;

	public variables = {
		costoxkm:0,
		gastos_envio:0,
		subtotal:0,
		costo:0,
		distancia:0,
		tiempo:0,
		costo_envio:0	
	}

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

  public Origin:any;
  public Destination:any;
  //public directionsService = new google.maps.DirectionsService;
  directionsService: any = null;

  destino={
  	lat:'',
  	lng:''
  }

  public repartidor:any;
  public repartidor_id = null;
  public modal:any;
  public pedido_id:any;

  public destinatario='';
  public telefono='';
  public referencia='';

  	directionsDisplay: any = null;
	inside: boolean = false;
	areaTriangle: any = [];
	datosC: any;
	coordenates: any = [];
	triangleCoords = [];
	toastD: boolean;
	reference: string = '';

	constructor( private modalService: NgbModal,
	       private toasterService: ToasterService,
	       private http: HttpClient,
	       private router: Router,
	       private rutaService: RutaBaseService,
	       public fb: FormBuilder,
	       private mapsAPILoader: MapsAPILoader,
           private ngZone: NgZone,
           private mapsApiWrapper: GoogleMapsAPIWrapper)
	{
		
		this.directionsService = new google.maps.DirectionsService();
		this.directionsDisplay = new google.maps.DirectionsRenderer({
    		suppressMarkers: true,
    		polylineOptions: {
		        strokeColor: "#222220"
		      }
    	});

	}


	ngOnInit() {

		if (this.mouvers_user_tipo != '4') {
	      localStorage.removeItem('mouvers_token');
	      localStorage.removeItem('mouvers_user_id');
	      localStorage.removeItem('mouvers_user_nombre');
	      localStorage.removeItem('mouvers_user_tipo');
	      localStorage.removeItem('mouvers_establecimiento_id');

	      this.router.navigateByUrl('/pagessimples/loginf');
	    }
	    else if(this.mouvers_user_tipo == '4'){
	    	this.establecimiento_id = localStorage.getItem('mouvers_establecimiento_id');
	    

			this.getCategorias();
			this.getVariables();
			this.inicializarMapa();
			this.getEstablecimiento();

		}

		
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

  //Abrir modal por defecto
  open(modal) {
    this.modalService.open(modal);
  }

  //Abrir modal larga
  open2(modal) {
    this.modalService.open(modal , { size: 'lg', backdrop: 'static', container: 'nb-layout', keyboard: false});
  }

	public inicializarMapa(){
	    this.zone = new NgZone({ enableLongStackTrace: false });
	    
	    //create search FormControl
	    this.searchControl = new FormControl();
	    
	    //set current position
	    //this.setCurrentPosition();
	    
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
	      componentRestrictions: {country: "MX"}
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
	        this.direccion = place.formatted_address;
	        //this.myFormAgregar.patchValue({direccion: place.formatted_address });
	        //console.log(place.address_components[0].long_name);
	        //set latitude, longitude and zoom
	        this.latitude = place.geometry.location.lat();
	        //this.myFormAgregar.patchValue({lat: place.geometry.location.lat() });
	        this.longitude = place.geometry.location.lng();
	        //this.myFormAgregar.patchValue({lng: place.geometry.location.lng() });
	        this.zoom = 11;

	        //Destino del pedido (cliente)
		    this.Destination = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
		    this.destino.lat = place.geometry.location.lat();
    		this.destino.lng = place.geometry.location.lng();
		    this.calculateRoute(this.Origin, this.Destination);

	        //console.log(this.myFormAgregar.value.direccion);

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

  direccion = null;
  markerDragEnd($event: MouseEvent) {
    console.log($event);
    var latlng:any;
    
    latlng=$event;
    latlng=latlng.coords;
    //this.myFormAgregar.patchValue({lat: latlng.lat });
    //this.myFormAgregar.patchValue({lng: latlng.lng });

    //Destino del pedido (cliente)
    this.Destination = new google.maps.LatLng(latlng.lat, latlng.lng);
    this.destino.lat = latlng.lat;
    this.destino.lng = latlng.lng;
    this.calculateRoute(this.Origin, this.Destination);
    this.mapsApiWrapper.createPolygon({
				    paths: [{lat:25.58726,lng:-103.51682},{lat:25.58842,lng:-103.51309},{lat:25.59329,lng:-103.50987},{lat:25.60274,lng:-103.51296}],
				    strokeColor: '#222220',
				    strokeOpacity: 1,
				    strokeWeight: 2,
				    fillColor: '#222220',
				    fillOpacity: 0
				}).then((data) => {
					console.log(data);
				    this.areaTriangle = data;
				     console.log(this.areaTriangle);
				    }).then(() => {
				    /*let isValidDeliveryAddress = Boolean(this.mapsApiWrapper.containsLocation(this.Origin, this.areaTriangle));
				   console.log(isValidDeliveryAddress);*/
				   });
    console.log(latlng);
    console.log(this.areaTriangle);
   /* let isValidDeliveryAddress = Boolean(this.mapsApiWrapper.containsLocation(latlng, this.areaTriangle));
    console.log(isValidDeliveryAddress);*/

    this.setDir(latlng).subscribe(result => {
      //this.myFormAgregar.patchValue({direccion: result });
      this.direccion = result;
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

  public calculateRoute(origin,end){
  	var directionsService = new google.maps.DirectionsService;
		directionsService.route({
		    origin: origin,
		    destination: end,
		    travelMode: google.maps.TravelMode.DRIVING,
		    avoidTolls: true
		}, (response, status)=> {
		    if(status === google.maps.DirectionsStatus.OK) {
				this.computeTotalDistance(response);
				this.computeTotalTime(response);
		    }else{
		      console.log('Could not display directions due to: ' + status);
		    }
		}); 
	}

	computeTotalDistance(result) {
        var total = 0;
        var myroute = result.routes[0];
        for (var i = 0; i < myroute.legs.length; i++) {
          total += myroute.legs[i].distance.value;
        }
        total = total / 1000;
        console.log('Distancia '+total);
        this.variables.distancia = total;
        this.calcularTotales();

    }

    computeTotalTime(result){
    	var total = 0;
    	var myroute = result.routes[0];
    	for (var i = 0; i < myroute.legs.length; i++) {
          total += myroute.legs[i].duration.value;
        }
        total = total / 60;
        console.log('Tiempo '+total);
        this.variables.tiempo = total;
    }

    calcularTotales(){

		this.variables.costo_envio = 0;
		this.variables.subtotal = 0;
		this.variables.costo = 0;

    	for (var i = 0; i < this.solicitud.length; ++i) {
    		this.variables.subtotal += parseFloat(this.solicitud[i].precio)*parseFloat(this.solicitud[i].cantidad);
    	}

    	this.variables.costo_envio = (this.variables.distancia * this.variables.costoxkm) + this.variables.gastos_envio;
    
    	this.variables.costo = this.variables.subtotal + this.variables.costo_envio;

    	console.log(this.variables);
    }

    getCoordinates(){
    	this.loading = true;
		this.http.get(this.rutaService.getRutaApi()+'coordenadas?token='+localStorage.getItem('mouvers_token'))
		.toPromise()
		.then(
		data => {
		    this.datosC = data;
		    var aux = JSON.stringify(this.datosC.coordenadas) ;

		    this.triangleCoords = JSON.parse(aux);
		    console.log([{lat:25.58726,lng:-103.51682},{lat:25.58842,lng:-103.51309},{lat:25.59329,lng:-103.50987},{lat:25.60274,lng:-103.51296}]);
		    //this.triangleCoords = JSON.parse(this.triangleCoords);
		    //for (var i = 0; i < this.triangleCoords.length; ++i) {
		    	//console.log(this.triangleCoords[i].coordenada);
		    	this.mapsApiWrapper.createPolygon({
				    paths: [{lat:25.58726,lng:-103.51682},{lat:25.58842,lng:-103.51309},{lat:25.59329,lng:-103.50987},{lat:25.60274,lng:-103.51296}],
				    strokeColor: '#222220',
				    strokeOpacity: 1,
				    strokeWeight: 2,
				    fillColor: '#222220',
				    fillOpacity: 0
				}).then((data) => {
				    this.areaTriangle = data;
				    }).then(() => {
				    let isValidDeliveryAddress = Boolean(this.mapsApiWrapper.containsLocation(this.Origin, this.areaTriangle));
				   console.log(isValidDeliveryAddress);
				   });
		    //}
			//this.loadMap(position);
			this.loading = false;

			
    		

		},
		msg => {
		    console.log(msg);
	           console.log(msg.error.error);

	           this.loading = false;

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                //this.mostrar = false;
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }
	            //sin subcategorias
	            else if(msg.status == 404){ 
	                //alert(msg.error.error);
	                this.showToast('info', 'Info!', msg.error.error);
	            }
		});
	}

  	getEstablecimiento() {
	    
	    this.loading = true;
	    this.http.get(this.rutaService.getRutaApi()+'establecimientos/'+this.establecimiento_id+'?token='+localStorage.getItem('mouvers_token'))
	       .toPromise()
	       .then(
	         data => { // Success
	           console.log(data);
	           this.data=data;
	           this.establecimiento = this.data.establecimiento;
	           //console.log(this.productList);

	           this.latitude = parseFloat(this.establecimiento.lat);
	           this.longitude = parseFloat(this.establecimiento.lng);
	           //this.inicializarMapa();

	           //Origen de pedido (Establecimiento)
	           //this.Origin = new google.maps.LatLng(parseFloat(this.establecimiento.lat), parseFloat(this.establecimiento.lng));
	           this.Origin = new google.maps.LatLng(25.58726, -103.51682);
	           this.destino.lat = this.establecimiento.lat;
    		   this.destino.lng = this.establecimiento.lng;

	           this.loading = false;

	           this.getCoordinates();

	         },
	         msg => { // Error
	           console.log(msg);
	           console.log(msg.error.error);

	           this.loading = false;

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                //this.mostrar = false;
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }
	            //sin subcategorias
	            else if(msg.status == 404){ 
	                //alert(msg.error.error);
	                this.showToast('info', 'Info!', msg.error.error);
	            }
	            

	         }
	       );
	}

	getVariables() {
	    
	    this.loading = true;
	    this.http.get(this.rutaService.getRutaApi()+'sistema/ubicacion?token='+localStorage.getItem('mouvers_token'))
	       .toPromise()
	       .then(
	         data => { // Success
	           console.log(data);
	           this.data=data;
	           this.variables.costoxkm = parseFloat(this.data.ubicacion[0].costoxkm);
	           this.variables.gastos_envio = parseFloat(this.data.ubicacion[0].gastos_envio);
	           //console.log(this.productList);

	           this.loading = false;

	         },
	         msg => { // Error
	           console.log(msg);
	           console.log(msg.error.error);

	           this.loading = false;

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                //this.mostrar = false;
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }
	            //sin subcategorias
	            else if(msg.status == 404){ 
	                //alert(msg.error.error);
	                this.showToast('info', 'Info!', msg.error.error);
	            }
	            

	         }
	       );
	}

	getCategorias() {

		this.subcategorias = [];
		this.productos = [];
		this.productList = this.productos;
   	    this.filteredItems = this.productList;
   	    this.init();
	    
	    this.loading = true;
	    this.http.get(this.rutaService.getRutaApi()+'categorias/habilitadas?token='+localStorage.getItem('mouvers_token'))
	       .toPromise()
	       .then(
	         data => { // Success
	           console.log(data);
	           this.data=data;
	           this.categorias = this.data.categorias;
	           //console.log(this.productList);

	           this.loading = false;

	         },
	         msg => { // Error
	           console.log(msg);
	           console.log(msg.error.error);

	           this.loading = false;

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                //this.mostrar = false;
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }
	            //sin categorias
	            else if(msg.status == 404){ 
	                //alert(msg.error.error);
	                this.showToast('info', 'Info!', msg.error.error);
	            }
	            

	         }
	       );
	}

	getSubcategorias(categoria_id) {

		this.subcategorias = [];
		this.productos = [];
		this.productList = this.productos;
   	    this.filteredItems = this.productList;
   	    this.init();
	    
	    this.loading = true;
	    this.http.get(this.rutaService.getRutaApi()+'subcategorias/habilitadas/'+categoria_id+'?token='+localStorage.getItem('mouvers_token'))
	       .toPromise()
	       .then(
	         data => { // Success
	           console.log(data);
	           this.data=data;
	           this.subcategorias = this.data.subcategorias;
	           //console.log(this.productList);

	           this.loading = false;

	         },
	         msg => { // Error
	           console.log(msg);
	           console.log(msg.error.error);

	           this.loading = false;

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                //this.mostrar = false;
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }
	            //sin subcategorias
	            else if(msg.status == 404){ 
	                //alert(msg.error.error);
	                this.showToast('info', 'Info!', msg.error.error);
	            }
	            

	         }
	       );
	}

	getProductos(subcategoria_id) {

		this.productos = [];
		this.productList = this.productos;
   	    this.filteredItems = this.productList;
   	    this.init();
	    
	    this.loading = true;
	    this.http.get(this.rutaService.getRutaApi()+'productos/habilitados/'+subcategoria_id+'/'+this.establecimiento_id+'?token='+localStorage.getItem('mouvers_token'))
	       .toPromise()
	       .then(
	         data => { // Success
	           console.log(data);
	           this.data=data;
	           this.productos = this.data.productos;
	           //console.log(this.productList);

	           for (var i = 0; i < this.productos.length; ++i) {

	           	var id  = this.productos[i].id;
	           	var index = this.solicitud.findIndex(function(element) {
				  return element.id == id;
				});

				if (index != -1) {
					this.productos[i].seleccionado = true;
				}else{
					this.productos[i].seleccionado = false;
				}

	           }

	           this.productList = this.productos;
           	   this.filteredItems = this.productList;
           	   this.init();

	           this.loading = false;

	         },
	         msg => { // Error
	           console.log(msg);
	           console.log(msg.error.error);

	           this.loading = false;

	           //token invalido/ausente o token expiro
	           if(msg.status == 400 || msg.status == 401){ 
	                //alert(msg.error.error);

	                this.showToast('warning', 'Warning!', msg.error.error);
	                //this.mostrar = false;
	                setTimeout(()=>{
	                  this.router.navigateByUrl('/pagessimples/loginf');
	                },1000);
	                   
	            }
	            //sin subcategorias
	            else if(msg.status == 404){ 
	                //alert(msg.error.error);
	                this.showToast('info', 'Info!', msg.error.error);
	            }
	            

	         }
	       );
	}

	setCategoria(categoria_id){
		console.log(categoria_id);
		this.getSubcategorias(categoria_id);
	}

	setSubcategoria(subcategoria_id){
		console.log(subcategoria_id);
		this.getProductos(subcategoria_id);
	}

	addClearProducto(producto){
		if (producto.seleccionado) {
			producto.seleccionado = false;

			var id  = producto.id;
           	var index = this.solicitud.findIndex(function(element) {
			  return element.id == id;
			});

			if (index != -1) {
				this.solicitud.splice(index, 1);
				this.calcularTotales();
			}

		}else{
			producto.seleccionado = true;
			producto.observacion = '';
			producto.cantidad = 1;
			producto.subtotal = 1*parseFloat(producto.precio);
			this.agregarProducto(producto);
		}
	}

	setCantidad(cantidad, producto){
		console.log(cantidad);
		console.log(parseInt(cantidad));
		if (parseInt(cantidad) < 1) {
			producto.cantidad = 1;
			producto.subtotal = 1*producto.precio;
		}
		else if(cantidad  && cantidad != ''){
			producto.cantidad = parseFloat(cantidad);
			producto.subtotal = parseFloat(cantidad)*parseFloat(producto.precio);
		}

		console.log(producto);
		this.calcularTotales();
	}

	checkCantidad(producto){
		console.log(producto.cantidad);
		if (!producto.cantidad || producto.cantidad == '') {
			producto.cantidad = 1;
			producto.subtotal = 1*parseFloat(producto.precio);
			this.calcularTotales();
		}
	}

	agregarProducto(producto){
		this.solicitud.push(producto);
		this.calcularTotales();
	}

	removerProducto(producto){

		var id  = producto.id;
       	var index = this.solicitud.findIndex(function(element) {
		  return element.id == id;
		});

		if (index != -1) {
			this.solicitud.splice(index, 1);
			this.calcularTotales();
		}

		//deschek
		var index2 = this.productos.findIndex(function(element) {
		  return element.id == id;
		});

		if (index2 != -1) {
			this.productos[index2].seleccionado = false;
		}
	}

	ressetSolicitud(){
		this.solicitud = [];
		this.destino.lat = this.establecimiento.lat;
    	this.destino.lng = this.establecimiento.lng;
    	this.variables.costo_envio = 0;
		this.variables.subtotal = 0;
		this.variables.costo = 0;

		for (var i = 0; i < this.productos.length; i++) {
			this.productos[i].seleccionado = false;
			this.productos[i].cantidad = 1;
		}

		this.destinatario = '';
		this.telefono = '';
		this.direccion = null;
		this.referencia = '';
	}


	crearPedido(modal) {

		if (!this.destinatario || this.destinatario == '') {
			this.showToast('warning', 'Warning!', 'Ingrese un destinatario.');
		}
		else{

			this.pedido_id = null;
			this.modal = modal;

			for (var i = 0; i < this.solicitud.length; i++) {
				this.solicitud[i].producto_id = this.solicitud[i].id;
				this.solicitud[i].precio_unitario = this.solicitud[i].precio;
			}

			var ruta = [
				{
					posicion:1,
					establecimiento_id:this.establecimiento_id,
					lat:this.establecimiento.lat,
					lng:this.establecimiento.lng
				}
			]
	      
	        this.loading = true;

	        var datos= {
	          token: localStorage.getItem('mouvers_token'),
	          lat: this.destino.lat,
	          lng: this.destino.lng,
	          direccion: this.direccion,
	          gastos_envio: this.variables.gastos_envio.toFixed(2),
	          costo_envio: this.variables.costo_envio.toFixed(2),
	          subtotal: this.variables.subtotal.toFixed(2),
	          costo: this.variables.costo.toFixed(2),
	          usuario_id: this.establecimiento.usuario.id,
	          productos: JSON.stringify(this.solicitud),
	          ruta: JSON.stringify(ruta),
	          distancia:this.variables.distancia,
	          tiempo:this.variables.tiempo,
	          destinatario:this.destinatario,
	          telefono:this.telefono,
	          referencia:this.referencia,
	        }

	        console.log(this.solicitud);
	        console.log(datos);

	        this.http.post(this.rutaService.getRutaApi()+'pedidos', datos)
	           .toPromise()
	           .then(
	             data => { // Success
	                console.log(data);
	                this.data = data;

	                this.ressetSolicitud();
	                this.actualizarPago(this.data.pedido.id);
	                this.pedido_id = this.data.pedido.id;

	                //alert(this.data.message);
	                //this.loading = false;
	                //this.showToast('success', 'Success!', this.data.message);
	                this.showToast('success', 'Success!', 'Pedido M00'+this.pedido_id+' registrado con éxito.');

	    
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
	                    //this.mostrar = false;
	                }
	                else { 
	                    //alert(msg.error.error);
	                    this.showToast('error', 'Erro!', msg.error.error);
	                }
	             }
	           );
	    }
    }

    actualizarPago(pedido_id): void {
      
      this.loading = true;

      var datos= {
        token: localStorage.getItem('mouvers_token'),
        estado_pago: 'aprobado',
        //api_tipo_pago:1
      }

      this.http.put(this.rutaService.getRutaApi()+'pedidos/'+pedido_id, datos)
         .toPromise()
         .then(
           data => { // Success
              console.log(data);
              this.data = data;
              
              //console.log(this.productList);
              //alert(this.data.message);

              this.loading = false;
              this.showToast('success', 'Success!', 'Pago registrado.');

              this.localizarRepartidores(pedido_id);

              //this.getRepDisponibles(); 
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

    /*Dispara la busqueda autoamtica de repartidores*/
    localizarRepartidores(pedido_id): void {

      //this.loading = true;
      this.http.get(this.rutaService.getRutaApi()+'notificaciones/localizar/repartidores/pedido_id/'+pedido_id+'?token='+localStorage.getItem('mouvers_token'))
       .toPromise()
       .then(
         data => { // Success

           //console.log(data);
           //this.data=data;

           //this.loading = false;


         },
         msg => { // Error
           //console.log(msg);
           //console.log(msg.error.error);

           //this.loading = false;

           //token invalido/ausente o token expiro
           /*if(msg.status == 400 || msg.status == 401){ 
                //alert(msg.error.error);

                this.showToast('warning', 'Warning!', msg.error.error);
            }*/
            //sin repartidores disponibles
            /*else if(msg.status == 404){ 
                //alert(msg.error.error);
                this.showToast('info', 'Info!', msg.error.error);
            }*/
            

         }
       );
    }

    /*Cargar los repartidores disponibles*/
    getRepDisponibles(): void {

      this.repartidor_id = null;

      this.loading = true;
      this.http.get(this.rutaService.getRutaApi()+'repartidores/disponibles?token='+localStorage.getItem('mouvers_token'))
       .toPromise()
       .then(
         data => { // Success

           console.log(data);
           this.data=data;
           this.productList2 = this.data.repartidores;
           this.filteredItems2 = this.productList2;
           //console.log(this.productList);

           this.init2();

           this.loading = false;

           this.open2(this.modal);

         },
         msg => { // Error
           console.log(msg);
           console.log(msg.error.error);

           this.loading = false;

           //token invalido/ausente o token expiro
           if(msg.status == 400 || msg.status == 401){ 
                //alert(msg.error.error);

                this.showToast('warning', 'Warning!', msg.error.error);
            }
            //sin repartidores disponibles
            else if(msg.status == 404){ 
                //alert(msg.error.error);
                this.showToast('info', 'Info!', msg.error.error);
            }
            

         }
       );
    }

    setRepartidor(repartidor): void {
      this.repartidor_id = repartidor.id;
    }

    atras(): void { 
      this.repartidor_id = null;
      this.pedido_id = null;
    }

    asignar(): void {
      this.loading = true;

      var datos= {
        token: localStorage.getItem('mouvers_token'),
        pedido_id: this.pedido_id,
      }

      this.http.put(this.rutaService.getRutaApi()+'notificaciones/'+this.repartidor_id+'/asignar/pedido', datos)
         .toPromise()
         .then(
           data => { // Success
              console.log(data);
              this.data = data;
              

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
                  if (msg.status == 409) {
                  	this.getRepDisponibles();
                  }else{
                  	this.atras();
                  }
              }
           }
         );
    }    
	

   //----Tabla productos<
   public productList:any;
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
  //----Tabla productos>

   //Tabla2 repartidores disponibles----<
   public productList2:any;
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
              if (this.productList2[i].usuario.nombre.toUpperCase().indexOf(this.inputName2.toUpperCase())>=0) {
                 this.filteredItems2.push(this.productList2[i]);
              }else if (this.productList2[i].usuario.email.toUpperCase().indexOf(this.inputName2.toUpperCase())>=0) {
                 this.filteredItems2.push(this.productList2[i]);
              }else if (this.productList2[i].usuario.telefono.toUpperCase().indexOf(this.inputName2.toUpperCase())>=0) {
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
    //Tabla2 repartidores disponibles---->

}

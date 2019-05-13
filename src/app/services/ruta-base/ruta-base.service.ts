import { Injectable } from '@angular/core';

@Injectable()
export class RutaBaseService {

	//Local freddy
	//public api_base = 'http://localhost/Service\ 24/alinstanteAPI/public/';
	//public images_base = 'http://localhost/Service\ 24/alinstanteAPI/public/images_uploads/';

	//Remoto cPanel
	//public api_base = 'http://mouvers.mx/mouversAPI2/public/';
	//public images_base = 'http://mouvers.mx/images_uploads/';

	//Remoto vps
	public api_base = 'https://service24.app/alinstanteAPI/public/';
	public images_base = 'https://service24.app/alinstanteAPI/public/images_uploads/';

	constructor() { }

	getRutaApi(){
		return this.api_base;
	}

	getRutaImages(){
		return this.images_base;
	}

}

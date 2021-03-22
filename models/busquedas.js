const fs = require('fs')
const axios = require('axios')



class Busquedas {
    historial = []

    dbPath = './db/db.json'

    constructor(){
        //TODO: leer DB si existe
        this.leerDB()
    }

    get paramsMapbox(){
        return {
            'access_token' :process.env.MAPBOX_KEY,
            'limit': 5,
            'language':'es'
        }
    }
    get paramsWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units':'metric',
            'lang':'es'
            
        }
    }
    get historialCapitalizado(){
        
        return this.historial.map(reg =>{
            let palabras = reg.split(' ');
            palabras= palabras.map(p => p[0].toUpperCase() + p.substring(1));
            return palabras.join(' ')
        })
    }

    async ciudad( lugar = '' ){
        //peticion HTTP
        // console.log('ciudad: ', lugar)
        try {

            const instace = axios.create({
                baseURL:`https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });
            const resp = await instace.get();
            
            // console.log(resp.data.features)
            
            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            })); 
            
        } catch (error) {
            return []
        }
    }
    
    async climaLugar (lat, lon){
        try {
            const instace = axios.create({
                baseURL:`http://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsWeather, lat, lon}
            });
            const resp = await instace.get();
            return {
                "descripcion": resp.data.weather[0].description,
                "temperatura": resp.data.main.temp,
                "min":resp.data.main.temp_min,
                "max":resp.data.main.temp_max

            }
            
        } catch (error) {
            console.log(error);
        }
    }
    
    async historia(lugar = ''){
        //TODO: prevenir duplicados
        if (this.historial.includes(lugar.toLocaleLowerCase())) {
            return;
        }
        this.historial = this.historial.splice(0,5)
        this.historial.unshift( lugar.toLocaleLowerCase() );

        //grabar en DB
        this.guardarDB()

    }

    async guardarDB(){
        const payload = {
            historial:this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    async leerDB(){
        // Debe de existir  
        if (!fs.existsSync(this.dbPath)) {
            return
        }
        const info = await fs.readFileSync( this.dbPath, {encoding: 'utf-8'})
        const data = JSON.parse(info)

        this.historial = data.historial

    }
}

module.exports = Busquedas
require('dotenv').config()
require('colors')
const { inquirerMenu, pausa, leerInput, listarLugares } = require('./helpers/inquirer')
const Busquedas = require('./models/busquedas')

const main = async () => {

    const busquedas = new Busquedas();
    let opt = '';

    do {
        opt = await inquirerMenu()

        switch (opt) {
            case 1:
                //Mostrar Mensaje
                const lugar = await leerInput('Ciudad: ');
                const lugares = await busquedas.ciudad(lugar);
                const idSeleccionado = await listarLugares(lugares)

                if (idSeleccionado === '0' ) continue

                console.log({idSeleccionado})
                
                
                //Buscar los lugares
                //Seleccionar el lugar
                const lugarSelect = lugares.find(l=> l.id === idSeleccionado)
                busquedas.historia(lugarSelect.nombre)

                // console.log({lugarSelect})
                
                //Clima
                const clima = await busquedas.climaLugar(lugarSelect.lat, lugarSelect.lng)

                console.log(clima)
                //Mostrar Resultados
                console.log('\n Informacion de la ciudad \n'.green)
                console.log('Ciudad:', lugarSelect.nombre)
                console.log('Lat:', lugarSelect.lat)
                console.log('Lng:', lugarSelect.lng)
                console.log('Temperatura:', clima.temperatura)
                console.log('Minima:',clima.min)
                console.log('Maxima:', clima.max)
                console.log('descripcion: ', `${clima.descripcion}`.green)
                break;
            case 2:
                busquedas.historialCapitalizado.forEach( (lugar,i) =>{
                    const idx = `${ i + 1}.`.green
                    console.log(`${idx} ${lugar}` )
                })
                break;       
        }

        if(opt !== 0 ) await pausa()
    } while (opt !== 0);
}

main()
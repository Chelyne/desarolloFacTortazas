
export async function ConsultarRUC_DNI(numDoc: string, typoDoc: string) {

    const objRespuesta = {
        nombre: '',
        direccion: '',
    };

    if (typoDoc === 'dni') {
      if (numDoc.length === 8) {
        await consultarDni(numDoc).then( (data: any) => {
            console.log('consultarDNI', data);
            if (data && data !== 'Peticiones diarias excedidas' && data.name) {
                objRespuesta.nombre = data.name + ' ' + data.first_name + ' ' + data.last_name;
            }
        });
      }
    } else if (typoDoc === 'ruc') {
      if (numDoc.length === 11) {

        await consultarRuc(numDoc).then( (data: any) => {
            console.log('consultarRUC', data, typeof data);


            if (data && data !== 'Peticiones diarias excedidas' && data.razonSocial) {
                objRespuesta.nombre = data.razonSocial;
                objRespuesta.direccion = data.direccion;
            }
        });
      }
    }

    return objRespuesta;
}


function consultarDni(numDoc: string) {

    const requestOptions: RequestInit = {
        method: 'GET',
        redirect: 'follow'
    };

    return fetch('https://dni.optimizeperu.com/api/persons/' + numDoc, requestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));
}

function consultarRuc(numDoc: string) {

    return fetch('https://dniruc.apisperu.com/api/v1/ruc/' + numDoc + '?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFpaXp4Ym92c2dxcnRpZ2J3cEBuaXdnaHguY29tIn0.BwArIEbkSUE_GuXwPjETGTLvl88rhANKTsVcA7NY-WE')
      .then(response => response.json())
      .catch(error => console.log('error', error));
}

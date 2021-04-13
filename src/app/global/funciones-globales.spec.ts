import { redondeoDecimal, completarCeros } from './funciones-globales';
// import * as moment from 'moment';
import { formatearDateTime, formatearFechaString, DatetimeStringIsValid } from './funciones-globales';

// describe('FuncionesGlobales', () => {
//   it('should create an instance', () => {
//     expect(new FuncionesGlobales()).toBeTruthy();
//   });
// });
describe('Test CompletarCeros', () => {
    it('parametrosCero', () => {
      expect('00000000').toEqual(completarCeros(''));
      expect('00000000').toEqual(completarCeros(undefined));
    });
    it('parametroNum', () => {
      expect('00000125').toEqual(completarCeros(125));
    });
});

// describe('test con moment', () => {
//     // it('Test moment', () => {
//     //         // crear una fecha valida
//     //     console.log('2000-12-3', moment('2000-12-3').isValid()); // IN: YYYY MM DD
//     //     console.log('3-12-2000', moment('3-12-2000').isValid()); // IN: MM DD YYYY
//     //     console.log('2000/12/3', moment('2000/12/3').isValid()); // IN: YYYY MM DD
//     //     console.log('3/12/2000', moment('3/12/2000').isValid()); // IN: MM DD YYYY
//     //     console.log('13/12/2000', moment('13/12/2000').isValid());

//     //     console.log('13/2000/12', moment('13/2000/12').isValid());
//     //     console.log('vacio', moment('').isValid());
//     //     console.log('2000-13-32', moment('2000-13-32').isValid());
//     //     console.log('2000-13-12', moment('2000-13-12').isValid());
//     //     console.log('2000-13-32', moment('2000-13-32').isValid());

//     //     console.log('2000-12-3T13:54:34', moment('2000-12-03T13:54:34').isValid());
//     //     console.log('2000-12-03T09:54:34', moment('2000-12-03T09:54:34').isValid());
//     //     console.log('2000-12-3T13:54:34', moment('2000-12-03 13:54:34').isValid());
//     //     console.log('2000-12-03T09:54:34', moment('2000-12-03 09:54:34').isValid());
//     //     console.log('2000-12-3T13:54:34', moment('2000-12-03T13:54:34').isValid());
//     //     console.log('2000-12-03T09:54:34', moment('2000-12-03T09:54:34').isValid());

//     //     console.log('1610318081', moment.unix(1610318081).isValid());
//     //     console.log('1610318081', moment.unix(1610318081).format('DD-MM-YYYY'));

//     //     // expect('2000/12/03 T13:54:34').toEqual(formatearDateTime('2000-12-3T13:54:34', 'YYYY/MM/DD THH:mm:ss'));
//     //     // expect('2000/12/03 T13:54:34').toEqual(formatearDateTime('2000/12/3T13:54:34', 'YYYY/MM/DD THH:mm:ss'));

//     // });
//     // it('Misma fecha diferentes ordenes', () => {

//     //     // console.log('formato de salida: YYYY-MM-DD');
//     //     // console.log('2000-13-32', moment('2000-12-3').format('YYYY-MM-DD'));
//     //     // console.log('2000-12-3', moment('2000-12-3').format('YYYY-MM-DD'));
//     //     // console.log('3-12-2000', moment('3-12-2000').format('YYYY-MM-DD'));
//     //     // console.log('2000/12/3', moment('2000/12/3').format('YYYY-MM-DD'));
//     //     // console.log('3/12/2000', moment('3/12/2000').format('YYYY-MM-DD'));
//     //     // console.log('3/12/2000', moment('3/12/2000').format('YYYY-MM-DD'));
//     // });
// });

describe('Test formatearDataTime', () => {

    it('Test saludo', () => {
        console.log('*********************************************************************');
        console.log('*********************************************************************');
        console.log('FechaActual sin parametro', formatearDateTime());
        console.log('FechaActual sin parametro', formatearDateTime('DD-MM-YYYY', new Date()));
        console.log('FechaActual sin parametro', formatearDateTime('DD-MM-YYYYTHH:mm:ss'));
        console.log('*********************************************************************');
        console.log('*********************************************************************');
    });
    it('Test DataTime String', () => {
       expect('05-04-2014').toEqual(formatearDateTime('DD-MM-YYYY', '2014-04-05'));
       expect('05-04-2014').toEqual(formatearDateTime('DD-MM-YYYY', '2014-04-05'));
       expect('05-04-2014').toEqual(formatearDateTime('DD-MM-YYYY', '2014-04-05'));
       expect('05-04-2014 00:00:00').toEqual(formatearDateTime('DD-MM-YYYY HH:mm:ss', '2014-04-05 00:00:00'));
       expect('05-04-2014 13:23:25').toEqual(formatearDateTime('DD-MM-YYYY HH:mm:ss', '2014-04-05 13:23:25'));
       expect('05-04-2014 13:23:25').toEqual(formatearDateTime('DD-MM-YYYY HH:mm:ss', '2014-4-5 13:23:25'));
    });
    it('Test DataTime String Invalidos', () => {
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '//'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '/'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', 'as/dd/'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', 'as/'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', 'as/sd'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', 'asssd--------'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '---'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', 'as-sd-'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', 'as-sd-ss-d'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', ''));
    });
    it('Test Fechas Invalidas por String', () => {
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', 'as-12-2999'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '23-df-2999'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '23-12-sddd'));
    });
    it('Test fecha invalida si primeo o tercero no tiene 4 digitos', () => {
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '23/34/233'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '23/34/233'));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('DD-MM-YYYY', '23/3423/233'));
    });
    it('Misma fecha diferentes ordenes', () => {
        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '2000-12-3'));
        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '3-12-2000'));
        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '2000/12/3'));
        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '3/12/2000'));
    });
    it('Test FormatearDatetime stringComplejos', () => {
        console.log('------------------------------------------------------------------------------');
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '2000-12-3'));
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '3-12-2000'));
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '2000/12/3'));
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '3/12/2000'));

        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '2000-12-3 13:54:34'));
        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '3-12-2000 13:54:34'));
        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '2000/12/03 13:54:34'));
        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '03/12/2000 13:54:34'));
        expect('2000/12/03 T 13:54:34+05:00').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss+05:00', '03/12/2000 13:54:34'));
        console.log('------------------------------------------------------------------------------');

    });
    it('Pruebas con funcion Date()', () => {
        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', new Date('2000-12-3 13:54:34')));
        expect('INVALID_DATA_TIME').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', new Date('2000-14-3 13:54:34')));
    });
    it('Pruebas con Seconds()', () => {
        expect('2021/03/25 T 18:03:01').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', {seconds: 1616713381}));
        expect('2021/03/25 T 18:07:48').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', {seconds: 1616713668}));
    });

});

describe('Test ValidarFechaString', () => {
    it('Test fechas invalidas', () => {
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('//'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('/'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('as/dd/'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('as/'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('as/sd'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('asssd--------'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('---'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('as-sd-'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('as-sd-ss-d'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString(''));
    });
    it('Test Fechas Invalidas por String', () => {
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('as-12-2999'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('23-df-2999'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('23-12-sddd'));
    });
    it('Test fecha invalida si primeo o tercero no tiene 4 digitos', () => {
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('23/34/233'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('23/34/233'));
        expect('INVALID_DATA_TIME').toEqual(formatearFechaString('23/3423/233'));
    });
    it('Test fecha valida', () => {
        expect('2000-12-13 00:00:00').toEqual(formatearFechaString('13/12/2000'));
        expect('2000-12-13 00:00:00').toEqual(formatearFechaString('2000/12/13'));
    });
    it('Test fecha con hora', () => {
        expect('2000-12-13 12:45:32').toEqual(formatearFechaString('13/12/2000 12:45:32'));
        expect('2000-12-13 12:45:32').toEqual(formatearFechaString('13/12/2000T12:45:32'));
        expect('2000-12-13 12:45:32').toEqual(formatearFechaString('2000/12/13 12:45:32'));
        expect('2000-12-13 12:45:32').toEqual(formatearFechaString('2000/12/13T12:45:32'));
    });
});

describe('Test ValidarFechaString', () => {
    it('fechas Validas', () => {
        expect(true).toEqual(DatetimeStringIsValid('2000/12/02'));
        expect(true).toEqual(DatetimeStringIsValid('2000-12-13 12:45:32'));
        expect(true).toEqual(DatetimeStringIsValid('2000-12-13T12:45:32'));
        expect(true).toEqual(DatetimeStringIsValid('2000-12-13 00:00:00'));
        expect(true).toEqual(DatetimeStringIsValid('2000-5-4 00:00:00'));
    });
    it('vechas invalidas', () => {
        expect(false).toEqual(DatetimeStringIsValid('as-12-2999'));
        expect(false).toEqual(DatetimeStringIsValid('23-df-2999'));
        expect(false).toEqual(DatetimeStringIsValid('23-12-sddd'));
    });
    it('OBSERVACIONES', () => {
        /** 2000/12/13T12:45:32 ES invalid, pero es valid 2000-12-13T12:45:32 */
        expect(false).toEqual(DatetimeStringIsValid('2000/12/13T12:45:32'));
    });
});

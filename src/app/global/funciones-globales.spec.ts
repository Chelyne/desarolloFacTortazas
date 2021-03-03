import { redondeoDecimal, completarCeros } from './funciones-globales';
import * as moment from 'moment';
import { formatearDateTime, formatearFechaString } from './funciones-globales';

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

describe('Test formatearDataTime', () => {
    it('Test moment', () => {
            // crear una fecha valida
        console.log('2000-12-3', moment('2000-12-3').isValid()); // IN: YYYY MM DD
        console.log('3-12-2000', moment('3-12-2000').isValid()); // IN: MM DD YYYY
        console.log('2000/12/3', moment('2000/12/3').isValid()); // IN: YYYY MM DD
        console.log('3/12/2000', moment('3/12/2000').isValid()); // IN: MM DD YYYY
        console.log('13/12/2000', moment('13/12/2000').isValid());

        console.log('13/2000/12', moment('13/2000/12').isValid());
        console.log('vacio', moment('').isValid());
        console.log('2000-13-32', moment('2000-13-32').isValid());
        console.log('2000-13-12', moment('2000-13-12').isValid());
        console.log('2000-13-32', moment('2000-13-32').isValid());

        console.log('2000-12-3T13:54:34', moment('2000-12-03T13:54:34').isValid());
        console.log('2000-12-03T09:54:34', moment('2000-12-03T09:54:34').isValid());
        console.log('2000-12-3T13:54:34', moment('2000-12-03 13:54:34').isValid());
        console.log('2000-12-03T09:54:34', moment('2000-12-03 09:54:34').isValid());
        console.log('2000-12-3T13:54:34', moment('2000-12-03T13:54:34').isValid());
        console.log('2000-12-03T09:54:34', moment('2000-12-03T09:54:34').isValid());

        console.log('1610318081', moment.unix(1610318081).isValid());
        console.log('1610318081', moment.unix(1610318081).format('DD-MM-YYYY'));

        // expect('2000/12/03 T13:54:34').toEqual(formatearDateTime('2000-12-3T13:54:34', 'YYYY/MM/DD THH:mm:ss'));
        // expect('2000/12/03 T13:54:34').toEqual(formatearDateTime('2000/12/3T13:54:34', 'YYYY/MM/DD THH:mm:ss'));

    });
    it('Test saludo', () => {
        console.log('FechaActual sin parametro', formatearDateTime());
        console.log('FechaActual sin parametro', formatearDateTime('DD-MM-YYYY', new Date()));
        console.log('FechaActual sin parametro', formatearDateTime('DD-MM-YYYYTHH:mm:ss.S'));
    });
    it('Test DataTime String', () => {
       expect('05-04-2014').toEqual(formatearDateTime('DD-MM-YYYY', '2014-04-05'));
       expect('05-04-2014').toEqual(formatearDateTime('DD-MM-YYYY', '2014-04-05'));
       expect('05-04-2014').toEqual(formatearDateTime('DD-MM-YYYY', '2014-04-05'));
    });
    it('Test DataTime String Invalidos', () => {
        console.log('TestMOmentoooo)', moment('//').format('DD-MM-YYYY'));
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

        // console.log('formato de salida: YYYY-MM-DD');
        // console.log('2000-13-32', moment('2000-12-3').format('YYYY-MM-DD'));
        // console.log('2000-12-3', moment('2000-12-3').format('YYYY-MM-DD'));
        // console.log('3-12-2000', moment('3-12-2000').format('YYYY-MM-DD'));
        // console.log('2000/12/3', moment('2000/12/3').format('YYYY-MM-DD'));
        // console.log('3/12/2000', moment('3/12/2000').format('YYYY-MM-DD'));
        // console.log('3/12/2000', moment('3/12/2000').format('YYYY-MM-DD'));


        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '2000-12-3'));
        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '3-12-2000'));
        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '2000/12/3'));
        expect('2000-12-03').toEqual(formatearDateTime('YYYY-MM-DD', '3/12/2000'));

    });
    it('Test FormatearDatetime string', () => {
        // Esto todavía no funciona
        console.log('------------------------------------------------------------------------------');
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '2000-12-3'));
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '3-12-2000'));
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '2000/12/3'));
        expect('2000/12/03 T00:00:00').toEqual(formatearDateTime('YYYY/MM/DD THH:mm:ss', '3/12/2000'));

        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '2000-12-3 13:54:34'));
        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '3-12-2000 13:54:34'));
        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '2000/12/03 13:54:34'));
        expect('2000/12/03 T 13:54:34').toEqual(formatearDateTime('YYYY/MM/DD T HH:mm:ss', '03/12/2000 13:54:34'));
        console.log('------------------------------------------------------------------------------');

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
        expect('12-13-2000').toEqual(formatearFechaString('13/12/2000'));
        expect('2000-12-13').toEqual(formatearFechaString('2000/12/13'));
    });
    it('Test fecha con hora', () => {
        expect('12-13-2000 12:45:32').toEqual(formatearFechaString('13/12/2000 12:45:32'));
        expect('12-13-2000 12:45:32').toEqual(formatearFechaString('13/12/2000T12:45:32'));
        expect('2000-12-13 12:45:32').toEqual(formatearFechaString('2000/12/13 12:45:32'));
        expect('2000-12-13 12:45:32').toEqual(formatearFechaString('2000/12/13T12:45:32'));
    });
});

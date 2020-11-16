import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[numbersOnly]'
})
export class NumberDirective {

  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(evt) {

    if (evt.which === 8 || evt.which === 0) {
        return true;
    }

    const regex = new RegExp("^[0-9\~]*$");
    var key = String.fromCharCode(!evt.charCode ? evt.which : evt.charCode);
    // console.log(regex.test(key))
    if (!regex.test(key)) {
        evt.preventDefault();
        return false;
    }
    return true;
  }

}

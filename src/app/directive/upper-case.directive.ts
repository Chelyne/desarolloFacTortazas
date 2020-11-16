
//   import { Directive, ElementRef, Input } from '@angular/core';
//   @Directive({
//     selector: '[UpperCase]',
//     host: {
//      '(input)': 'toUpperCase($event.target.value)',

//     }

//   })
//   export class UpperCaseDirective {

//  @Input('UpperCase') allowUpperCase: boolean;
//  constructor(private ref: ElementRef) {
//  }

//  toUpperCase(value: any) {
//      if (this.allowUpperCase)
//      this.ref.nativeElement.value = value.toUpperCase();
//  }

//  }

 import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'input[appUpper]'
})
export class UpperCaseDirective {

  constructor(public ref: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    this.ref.nativeElement.value = event.target.value.toUpperCase();
  }

}
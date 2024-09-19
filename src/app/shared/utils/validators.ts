import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime } from 'rxjs/operators';

export function noWhitespaceAsyncValidator(): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);

    const hasWhitespace = /^\s*$/.test(control.value);

    return of(hasWhitespace ? { whitespace: true } : null).pipe(
      debounceTime(300),
      catchError(() => of(null))
    );
  };
}

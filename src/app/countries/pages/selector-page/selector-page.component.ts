import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { tap, switchMap, filter } from 'rxjs/operators';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { CountriesService } from '../../services/countries.service';

// Declara el componente.
@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  // Arreglos para almacenar información de países por región y países fronterizos.
  public countriesByRegion: SmallCountry[] = [];
  public borders: SmallCountry[] = [];

  // FormGroup para manejar el formulario reactivo.
  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  // Constructor del componente con inyección de dependencias.
  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  // Método que se ejecuta al iniciar el componente.
  ngOnInit(): void {
    // Llama a los métodos que gestionan cambios en la región y país seleccionados.
    this.onRegionChanged();
    this.onCountryChanged();
  }

  // Getter para obtener las regiones desde el servicio de países.
  get regions(): Region[] {
    return this.countriesService.regions;
  }

  // Método que se ejecuta al cambiar la región seleccionada.
  onRegionChanged(): void {
    this.myForm
      .get('region')!
      .valueChanges.pipe(
        // Resetea el valor del país y limpia la lista de países fronterizos al cambiar la región.
        tap(() => this.myForm.get('country')!.setValue('')),
        tap(() => (this.borders = [])),
        // Realiza una llamada al servicio para obtener países por la región seleccionada.
        switchMap((region) =>
          this.countriesService.getCountriesByRegion(region)
        )
      )
      .subscribe((countries) => {
        // Almacena la lista de países por región.
        this.countriesByRegion = countries;
      });
  }

  // Método que se ejecuta al cambiar el país seleccionado.
  onCountryChanged(): void {
    this.myForm
      .get('country')!
      .valueChanges.pipe(
        // Resetea el valor de la frontera y filtra para evitar llamadas innecesarias.
        tap(() => this.myForm.get('border')!.setValue('')),
        filter((value: string) => value.length > 0),
        // Este operador permite transformar los valores emitidos por un observable en otro observable,
        // y cancelar las suscripciones anteriores si se emite un nuevo valor. En este caso,
        // el código recibe un código alfa de un país (como ‘ES’ o ‘FR’) y llama a un servicio que devuelve un observable con la información del país.
        // El operador switchMap se asegura de que solo se reciba la información del último país solicitado, y se ignoren los anteriores.
        switchMap((alphaCode) =>
          this.countriesService.getCountryByAlphaCode(alphaCode)
        ),
        switchMap((country) =>
          this.countriesService.getCountryBordersByCodes(country.borders)
        )
      )
      .subscribe((countries) => {
        // Almacena la lista de países fronterizos.
        this.borders = countries;
        console.log({ countries });
      });
  }
}

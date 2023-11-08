import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// Enumeración que representa las regiones.
export enum Region {
  Africa = 'africa',
  Americas = 'americas',
  Asia = 'asia',
  Europe = 'europe',
  Oceania = 'oceania',
}

// Interfaz que define la estructura de un país completo.
interface Country {
  name: { common: string };
  cca3: string;
  borders?: string[];
}

// Interfaz que define la estructura de un país simplificado.
export interface SmallCountry {
  name: string;
  cca3: string;
  borders: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  // URL base para las llamadas a la API de países.
  private baseUrl: string = 'https://restcountries.com/v3.1';

  // Lista de regiones disponibles.
  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];

  // Constructor del servicio con inyección de dependencias.
  constructor(private http: HttpClient) {}

  // Getter para obtener una copia de la lista de regiones.
  get regions(): Region[] {
    return [...this._regions];
  }

  // Método para obtener la lista de países por una región específica.
  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    // Si no se proporciona una región, retorna un observable vacío.
    if (!region) return of([]);

    // Construye la URL para la llamada a la API.
    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    // Realiza la llamada HTTP y transforma la respuesta a un formato más simple.
    return this.http.get<Country[]>(url).pipe(
      map((countries) =>
        countries.map((country) => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? [],
        }))
      )
    );
  }

  // Método para obtener la información de un país por su código alfa.
  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    // Construye la URL para la llamada a la API.
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;

    // Realiza la llamada HTTP y transforma la respuesta a un formato más simple.
    return this.http.get<Country>(url).pipe(
      map((country) => ({
        name: country.name.common,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))
    );
  }

  // Método para obtener la información de varios países por sus códigos alfa.
  getCountryBordersByCodes(borders: string[]): Observable<SmallCountry[]> {
    // Si no hay fronteras o la lista está vacía, retorna un observable vacío.
    if (!borders || borders.length === 0) return of([]);

    // Array para almacenar los observables de las llamadas a los países.
    const countriesRequests: Observable<SmallCountry>[] = [];

    // Para cada código alfa en la lista, crea una llamada al método getCountryByAlphaCode.
    borders.forEach((code) => {
      const request = this.getCountryByAlphaCode(code);
      countriesRequests.push(request);
    });

    // Combina las observables de las llamadas a los países en un solo observable.
    return combineLatest(countriesRequests);
  }
}

import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateCategory',
  standalone: true,
  pure: false // False para que se actualice cuando cambie el idioma
})
export class TranslateCategoryPipe implements PipeTransform {

    //Esta pipe lo que hace es ayudar a traduccir unicamente la parte visual de la aplicaccion sin modificar los datos de la base de datos

    /*
    Flujo de funcionamiento:
    Recibe el valor de la categoría tal cual viene de la BD, por ejemplo: "Nómina"
    Construye una clave de traducción: CATEGORIAS.Nómina
    Busca esa clave en el archivo JSON del idioma activo (ej: en.json)
    Si encuentra traducción → devuelve "Payroll" (o lo que diga el JSON)
    Si no encuentra traducción → devuelve el valor original "Nómina" (así nunca se rompe)*/

  constructor(private translate: TranslateService) {}

  transform(value: string | undefined | null): string {
    if (!value) return '';
    // Busca el nombre de la categoría en las traducciones
    const key = `CATEGORIAS.${value}`;
    const translated = this.translate.instant(key);
    // Si la traducción devuelve la propia clave (significa que no se encontró), devuelve el valor original
    return translated === key ? value : translated;
  }
}

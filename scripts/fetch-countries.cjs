const fs = require('fs').promises;

const COUNTRIES_API = 'https://api.worldbank.org/v2/country?format=json&per_page=300';
const CURRENCIES_API = 'https://restcountries.com/v3.1/all?fields=name,currencies,cca2';
const OUTPUT_FILE = './public/countries.json';

/*
Example Currency response:

{
"name": {
  "common": "Italy",
  "official": "Italian Republic",
  "nativeName": {
    "ita": {
      "official": "Repubblica italiana",
      "common": "Italia"
    }
  }
},
"currencies": {
  "EUR": {
    "name": "euro",
    "symbol": "€"
  }
},
"cca2": "IT"
}
 */

Promise.all([
    fetch(COUNTRIES_API).then(response => response.json()),
    fetch(CURRENCIES_API).then(response => response.json())
])
    .then(([countriesData, currenciesData]) => {
        const countries = countriesData[1]
            .filter(item => item?.capitalCity);

        // Create a map of country code to currency
        const currencyMap = new Map();
        currenciesData.forEach(country => {
            if (country.currencies) {
                const currencyCodes = Object.keys(country.currencies);
                if (currencyCodes.length > 0) {
                    currencyMap.set(country.cca2, currencyCodes[0]);
                }
            }
        });

        const db = countries.map(country => {
            const currency = currencyMap.get(country.iso2Code) || 'USD';
            return {
                id: country.id,
                iso2Code: country.iso2Code,
                name: country.name,
                currency
            };
        })
            .sort((a, b) => a.name.localeCompare(b.name));

        return fs.writeFile(OUTPUT_FILE, JSON.stringify(db, null, 2));
    })
    .catch(error => console.log(error));

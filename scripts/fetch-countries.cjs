const fs = require('fs').promises;

const URL = 'https://api.worldbank.org/v2/country?format=json&per_page=300';
const OUTPUT_FILE = './public/countries.json';

fetch(URL)
    .then(response => response.json())
    .then(data => {
        const countries = data[1]
            .filter(item => item?.capitalCity);

        const db = countries.map(country => {
            return {
                id: country.id,
                iso2Code: country.iso2Code,
                name: country.name
            };
        });

        return fs.writeFile(OUTPUT_FILE, JSON.stringify(db, null, 2));

    })
    .catch(error => console.log(error));

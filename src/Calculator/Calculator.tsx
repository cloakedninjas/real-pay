import './Calculator.css'
import * as React from 'react';
import { calculateRealSalary, getInflationData } from './CalcService.ts';

const regionNames = new Intl.DisplayNames(navigator.languages, {type: 'region'});

const iso2Countries = [
    'US', 'GB', 'DE', 'FR', 'JP', 'CN', 'IN', 'BR', 'ZA', 'AU'
];

let defaultCountry = 'US';

navigator.languages.some(value => {
    const matches = value.match(/\w+-(\w+)/);

    if (matches?.[1]) {
        defaultCountry = matches[1];
        return true;
    }
});

const countries = iso2Countries
    .map(code => ({
        code,
        name: regionNames.of(code),
    }))
    .filter(c => c.name);

export default function Calculator() {
    const [loading, setLoading] = React.useState(false);
    const [data, setData] = React.useState<number[] | null>(null);
    const [selectedCountry, setSelectedCountry] = React.useState(defaultCountry);
    const [startingSalary, setStartingSalary] = React.useState('');
    const [startingYear, setStartingYear] = React.useState('');

    const changeCountry: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
        setSelectedCountry(e.target.value);
    }

    const changeSalary: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setStartingSalary(e.target.value);
    }

    const changeYear: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        setStartingYear(e.target.value);
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        fetchData();
    }

    function fetchData() {
        if (loading) {
            return;
        }

        setLoading(true);

        getInflationData(selectedCountry, Number(startingYear))
            .then(inflationRates => {
                setData(inflationRates);
                //console.log(data);

                console.log(calculateRealSalary(Number(startingSalary), inflationRates))
            })
            .catch(err => console.error(err));
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (data) {
        return (<pre>
            {JSON.stringify(data)}
        </pre>)
    }

    return <form className="container" onSubmit={handleSubmit}>
        <fieldset>
            <label>
                Country
                <select name="country" value={selectedCountry} onChange={changeCountry}>
                    {
                        countries.map(country => {
                            return <option
                                key={country.code}
                                value={country.code}
                            >{country.name}</option>
                        })
                    }
                </select>
            </label>
            <label>
                Starting salary
                <input
                    type="number"
                    name="baseSalary"
                    autoComplete=""
                    value={startingSalary}
                    onChange={changeSalary}
                />
            </label>
            <label>
                Starting year
                <input
                    type="number"
                    name="startYear"
                    autoComplete=""
                    value={startingYear}
                    onChange={changeYear}
                />
            </label>
        </fieldset>

        <button type="submit" disabled={!selectedCountry || !startingSalary || !startingYear}>Calculate</button>
    </form>
}

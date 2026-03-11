import './Calculator.css'
import * as React from 'react';
import { calculateRealSalary, getInflationData } from './CalcService.ts';
import { Chart } from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { chartOptions } from './chartOptions.ts';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

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
    const [adjustedSalary, setAdjustedSalary] = React.useState<number[] | null>(null);
    const [years, setYears] = React.useState<number[]>([]);
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
                const salaryData = calculateRealSalary(Number(startingSalary), inflationRates);
                const yearsList = inflationRates.map((_, i) => Number(startingYear) + i);

                setData(inflationRates);
                setAdjustedSalary(salaryData);
                setYears(yearsList);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }

    if (loading) {
        return <p>Loading...</p>;
    }

    if (data && adjustedSalary && years.length > 0) {
        const chartData = {
            labels: years,
            datasets: [
                {
                    label: 'Inflation',
                    yAxisID: 'y1',
                    data: data,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                },
                {
                    label: 'Salary',
                    yAxisID: 'y',
                    data: adjustedSalary,
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                }
            ]
        };

        const currentValue = adjustedSalary.at(-1);
        const currentYear = years.at(-1);

        return (
            <div className="container">
                <p>
                    A starting salary of <span className="salary-highlight">{Number(startingSalary).toLocaleString()}</span> in {startingYear},
                    is now worth <span className="value-highlight">{Math.round(currentValue).toLocaleString()}</span> in {currentYear}.
                </p>
                <Chart type='line' data={chartData} options={chartOptions} />
                <button onClick={() => {
                    setData(null);
                    setAdjustedSalary(null);
                    setYears([]);
                }}>Reset</button>
            </div>
        );
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

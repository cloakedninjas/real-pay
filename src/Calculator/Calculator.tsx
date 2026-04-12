import './Calculator.css'
import { type ChangeEventHandler, type SubmitEvent, useEffect, useState } from 'react';
import {
    calculateRealSalaryWithRises,
    type Country,
    getCountries,
    getInflationData,
    type PayRise as PayRiseType
} from './CalcService.ts';
import { Chart } from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    type ChartData,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import { chartOptions } from './chartOptions.ts';
import { Icon } from '../Icon.tsx';

const LS_PREF_COUNTRY_KEY = 'rp-preferred-country';
const defaultCountry = 'US';
const percentageFormater = new Intl.NumberFormat(navigator.languages, {
    style: 'percent',
    maximumFractionDigits: 2
})

let defaultCountryCode = defaultCountry;

// Check localStorage first for preferred country
const storedCountry = localStorage.getItem(LS_PREF_COUNTRY_KEY);
if (storedCountry) {
    defaultCountryCode = storedCountry;
} else {
    navigator.languages.some(value => {
        const matches = value.match(/\w+-(\w+)/);

        if (matches?.[1]) {
            defaultCountryCode = matches[1];
            return true;
        }
    });
}

let currencyFormatter = new Intl.NumberFormat(navigator.languages, {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    currency: 'USD'
});

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend
);

export default function Calculator() {
    const [isLoading, setIsLoading] = useState(false);
    const [inflationRates, setInflationRates] = useState<number[]>([]);
    const [adjustedSalary, setAdjustedSalary] = useState<number[] | null>(null);
    const [years, setYears] = useState<number[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);
    const [startingSalary, setStartingSalary] = useState('');
    const [startingYear, setStartingYear] = useState('');
    const [payRises, setPayRises] = useState<PayRiseInput[]>([{year: '', salary: ''}]);
    const [showRealSalary, setShowRealSalary] = useState(true);

    useEffect(() => {
        getCountries()
            .then(setCountries)
            .catch(console.error);
    }, []);

    const changeCountry: ChangeEventHandler<HTMLSelectElement> = (e) => {
        const countryCode = e.target.value;
        setSelectedCountry(countryCode);

        localStorage.setItem(LS_PREF_COUNTRY_KEY, countryCode);

        const country = countries.find(c => c.iso2Code === countryCode);
        const currency = country?.currency ?? 'USD';

        currencyFormatter = new Intl.NumberFormat(navigator.languages, {
            style: 'currency',
            currencyDisplay: 'narrowSymbol',
            currency: currency
        });
    }

    const changeSalary: ChangeEventHandler<HTMLInputElement> = (e) => {
        setStartingSalary(e.target.value);
    }

    const changeYear: ChangeEventHandler<HTMLInputElement> = (e) => {
        setStartingYear(e.target.value);
    }

    const toggleRealValues: ChangeEventHandler<HTMLInputElement> = (e) => {
        setShowRealSalary(e.target.checked);
    }

    useEffect(() => {
        if (inflationRates.length > 0) {
            const validPayRises: PayRiseType[] = payRises
                .filter(rise => rise.year !== '' && rise.salary !== '')
                .map(rise => ({
                    year: Number(rise.year),
                    salary: Number(rise.salary)
                }));

            const salaryData: number[] = calculateRealSalaryWithRises(
                Number(startingSalary),
                Number(startingYear),
                inflationRates,
                validPayRises,
                showRealSalary
            );

            setAdjustedSalary(salaryData);
        }
    }, [showRealSalary, inflationRates, startingSalary, startingYear, payRises]);

    const updatePayRise = (index: number, field: keyof PayRiseInput, value: string) => {
        const newPayRises = [...payRises];
        newPayRises[index][field] = value;
        setPayRises(newPayRises);
    }

    const addPayRise = () => {
        setPayRises([...payRises, {year: '', salary: ''}]);
    }

    const removePayRise = (index: number) => {
        if (payRises.length > 1) {
            setPayRises(payRises.filter((_, i) => i !== index));
        } else {
            setPayRises([{year: '', salary: ''}]);
        }
    }

    function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        fetchData();
    }

    function fetchData() {
        if (isLoading) {
            return;
        }

        setIsLoading(true);

        getInflationData(selectedCountry, Number(startingYear))
            .then(rates => {
                const yearsList = rates.map((_, i) => Number(startingYear) + i);

                setInflationRates(rates);
                setYears(yearsList);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }

    /*function reset() {
        setData(null);
        setAdjustedSalary(null);
        setYears([]);
    }*/

    const form = (<form onSubmit={handleSubmit}>
        <fieldset className="panel main-fields">
            <label className="country-select">
                Country
                <select name="country" value={selectedCountry} onChange={changeCountry}>
                    {
                        countries.map(country => {
                            return <option
                                key={country.iso2Code}
                                value={country.iso2Code}
                            >{country.name}</option>
                        })
                    }
                </select>
            </label>

            <label className="number-input">
                Starting year
                <input
                    type="number"
                    name="startYear"
                    autoComplete="off"
                    value={startingYear}
                    onChange={changeYear}
                />
            </label>

            <label className="number-input">
                Starting salary
                <input
                    type="number"
                    name="baseSalary"
                    autoComplete="off"
                    value={startingSalary}
                    onChange={changeSalary}
                />
            </label>
        </fieldset>

        <div className="pay-rises-header">
            Salary increases
            <button className="text-btn" type="button" onClick={addPayRise}>
                <Icon type="plus-circle"></Icon>
                Add increase
            </button>
        </div>
        <fieldset className="pay-rises panel">
            {payRises.map((rise, index) => (
                <div key={index} className="pay-rise-row">
                    <label className="number-input">
                        Year
                        <input
                            type="number"
                            value={rise.year}
                            onChange={(e) => updatePayRise(index, 'year', e.target.value)}
                        />
                    </label>
                    <label className="number-input">
                        New salary
                        <input
                            type="number"
                            value={rise.salary}
                            onChange={(e) => updatePayRise(index, 'salary', e.target.value)}
                        />
                    </label>
                    <button
                        type="button"
                        onClick={() => removePayRise(index)}
                        aria-label="Remove pay rise"
                        className="text-btn delete-pay-rise icon-only"
                    >
                        <Icon type="trash"></Icon>
                    </button>
                </div>
            ))}
        </fieldset>

        <button type="submit" disabled={!selectedCountry || !startingSalary || !startingYear }>Calculate</button>

        {/*<button onClick={() => reset()}>Reset</button>*/}
    </form>);

    let result;

    if (inflationRates && adjustedSalary && years.length > 0) {
        const chartData: ChartData<'line'> = {
            labels: years,
            datasets: [
                {
                    label: 'Salary',
                    yAxisID: 'y',
                    data: adjustedSalary,
                    borderColor: '#00a854',
                    backgroundColor: '#00a854',
                },
                {
                    label: 'Inflation',
                    yAxisID: 'y1',
                    data: inflationRates,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    hidden: true
                }
            ]
        };

        const currentSalary = adjustedSalary.at(-1) ?? 0;
        const startingSalaryFormatted = currencyFormatter.format(Number(startingSalary));
        const currentSalaryFormatted = currencyFormatter.format(currentSalary);
        const currentYear = years.at(-1) ?? 0;
        const percentageDiff = percentageFormater.format(1 - (currentSalary / Number(startingSalary)));
        const hasPayRises = payRises.length > 1 || payRises[0].salary && payRises[0].year;

        const topPara = <p>A starting salary of
            <span className="value-highlight salary-highlight">{startingSalaryFormatted}</span> in {startingYear},
            {payRises[0].salary ? ' with pay rises, ' : ' '}
            is now worth
            <span className="value-highlight">{currentSalaryFormatted}</span> in {currentYear}.
        </p>;

        const lostSalaryWarning = hasPayRises && Number(currentSalary) < Number(startingSalary) ?
            <p className="warn">Your salary has failed to keep up with inflation, you
                are {percentageDiff} poorer</p> : null;

        const realNominalToggle = hasPayRises ? <label className="toggle-switch">
                <input type="checkbox" checked={showRealSalary} onChange={toggleRealValues}/>
                <span className="false-value">Nominal</span>
                <span className="true-value">Real values</span>
            </label> : null;

        result = <>
            {topPara}
            {lostSalaryWarning}
            {realNominalToggle}

            <div className="chart-container">
                <Chart type="line" data={chartData} options={chartOptions}/>
            </div>
        </>

    }

    return <div className="calculator">
        {form}
        <div className="panel result">
            {
                isLoading ? <div className="loader"></div> : result
            }
        </div>
    </div>;
}

interface PayRiseInput {
    year: string;
    salary: string;
}

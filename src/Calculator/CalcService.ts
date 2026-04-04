// https://data360api.worldbank.org/data360/data?DATABASE_ID=WB_WDI&INDICATOR=WB_WDI_FP_CPI_TOTL_ZG&REF_AREA=FIN&timePeriodFrom=2010&timePeriodTo=2025&skip=0
const API_ROOT = 'https://api.worldbank.org/v2';

// Type definitions for World Bank API response
interface WorldBankMetadata {
    page: number;
    pages: number;
    per_page: number;
    total: number;
    sourceid: string;
    lastupdated: string;
}

interface IndicatorValue {
    indicator: {
        id: string;
        value: string;
    };
    country: {
        id: string;
        value: string;
    };
    countryiso3code: string;
    date: string;
    value: number | null;
    unit: string;
    obs_status: string;
    decimal: number;
}

type WorldBankResponse = [WorldBankMetadata, IndicatorValue[]];

export async function getInflationData(countryCode: string, startYear: number): Promise<number[]> {
    const endYear = (new Date()).getFullYear();
    const url = `${API_ROOT}/country/${countryCode}/indicator/FP.CPI.TOTL.ZG?format=json&date=${startYear}:${endYear}&per_page=100`;

    try {
        const response: Response = await fetch(url);
        const json = await response.json() as WorldBankResponse;

        return json[1].map(obj => obj.value ?? 0);
    } catch {
        return [];
    }
}

export interface PayRise {
    year: number;
    salary: number;
}

export function calculateRealSalaryWithRises(
    startingSalary: number,
    startYear: number,
    rates: number[],
    payRises: PayRise[],
    nominalPayRise = true
) {
    let priceIndex = 1;
    let currentNominalSalary = startingSalary;

    return rates.map((rate, i) => {
        const currentYear = startYear + i;

        // Update price index first (before checking for pay rises)
        if (i > 0) {
            priceIndex *= (1 + rate / 100);
        }

        const payRise = payRises.find(rise => rise.year === currentYear);

        if (payRise) {
            currentNominalSalary = payRise.salary;

            if (nominalPayRise) {
                // reset price index so new salary is shown at its current-year value
                priceIndex = 1;
            }
        }

        return currentNominalSalary / priceIndex;
    });
}

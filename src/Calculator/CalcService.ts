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

export function calculateRealSalary(startingSalary: number, rates: number[]) {
    let priceIndex = 1;

    return rates.map((rate, i) => {
        if (i > 0) {
            priceIndex *= (1 + rate / 100)
        }
        return startingSalary / priceIndex;
    });
}

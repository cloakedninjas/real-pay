import { calculateRealSalaryWithRises, type PayRise } from './CalcService';

describe('CalcService', () => {
    describe('calculateRealSalaryWithRises', () => {
        it('should calculate real salary with a single pay rise', () => {
            const startingSalary = 50000;
            const startYear = 2020;
            const inflationRates = [0, 2, 3, 2.5, 2];
            const payRises: PayRise[] = [
                { year: 2022, salary: 60000 }
            ];

            const result = calculateRealSalaryWithRises(
                startingSalary,
                startYear,
                inflationRates,
                payRises,
                false
            );

            expect(result).toHaveLength(5);
            expect(result[0]).toBe(50000); // Starting year, no inflation yet
            expect(result[1]).toBeCloseTo(49019.61); // After 2% inflation
            expect(result[2]).toBe(60000); // Pay rise applied - exact value
            expect(result[3]).toBeCloseTo(58536.59); // Inflation erodes the new salary (60000 / 1.025)
            expect(result[4]).toBeCloseTo(57388.81); // Continues to erode (60000 / 1.025 / 1.02)
        });

        it('should calculate real salary with multiple pay rises', () => {
            const startingSalary = 50000;
            const startYear = 2020;
            const inflationRates = [0, 2, 3, 2.5, 2, 2.5];
            const payRises: PayRise[] = [
                { year: 2022, salary: 60000 },
                { year: 2024, salary: 70000 }
            ];

            const result = calculateRealSalaryWithRises(
                startingSalary,
                startYear,
                inflationRates,
                payRises,
                false
            );

            expect(result).toHaveLength(6);
            expect(result[0]).toBe(50000); // Starting year
            expect(result[1]).toBeCloseTo(49019.61); // After 2% inflation
            expect(result[2]).toBe(60000); // First pay rise applied - exact value
            expect(result[3]).toBeCloseTo(58536.59); // Inflation erodes (60000 / 1.025)
            expect(result[4]).toBe(70000); // Second pay rise applied - exact value
            expect(result[5]).toBeCloseTo(68292.68); // Inflation erodes (70000 / 1.025)
        });

        it('should calculate real salary with multiple pay rises showing values expressed as star year', () => {
            const startingSalary = 50000;
            const startYear = 2020;
            const inflationRates = [0, 2, 3, 2.5, 2, 2.5];
            const payRises: PayRise[] = [
                { year: 2022, salary: 60000 },
                { year: 2024, salary: 70000 }
            ];

            const result = calculateRealSalaryWithRises(
                startingSalary,
                startYear,
                inflationRates,
                payRises,
                true
            );

            expect(result).toHaveLength(6);

            // Year 0 (2020): Starting salary
            // Nominal: 50000
            // Real (2020 dollars): 50000
            expect(result[0]).toBe(50000);

            // Year 1 (2021): No pay rise, 2% inflation
            // Nominal: 50000
            // Real (2020 dollars): 50000 / 1.02 = 49019.61
            expect(result[1]).toBeCloseTo(49019.61);

            // Year 2 (2022): Pay rise to 60000, 3% inflation this year
            // Nominal: 60000
            // Cumulative inflation from 2020: 1.02 * 1.03 = 1.0506
            // Real (2020 dollars): 60000 / 1.0506 = 57110.22
            expect(result[2]).toBeCloseTo(57110.22);

            // Year 3 (2023): No pay rise, 2.5% inflation this year
            // Nominal: 60000
            // Cumulative inflation from 2020: 1.02 * 1.03 * 1.025 = 1.076865
            // Real (2020 dollars): 60000 / 1.076865 = 55717.29
            expect(result[3]).toBeCloseTo(55717.29);

            // Year 4 (2024): Pay rise to 70000, 2% inflation this year
            // Nominal: 70000
            // Cumulative inflation from 2020: 1.02 * 1.03 * 1.025 * 1.02 = 1.0984023
            // Real (2020 dollars): 70000 / 1.0984023 = 63728.927
            expect(result[4]).toBeCloseTo(63728.927);

            // Year 5 (2025): No pay rise, 2.5% inflation this year
            // Nominal: 70000
            // Cumulative inflation from 2020: 1.02 * 1.03 * 1.025 * 1.02 * 1.025 = 1.1258624
            // Real (2020 dollars): 70000 / 1.1258624 = 62174.562
            expect(result[5]).toBeCloseTo(62174.562);
        });
    });
});

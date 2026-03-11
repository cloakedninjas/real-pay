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
                payRises
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
                payRises
            );

            expect(result).toHaveLength(6);
            expect(result[0]).toBe(50000); // Starting year
            expect(result[1]).toBeCloseTo(49019.61); // After 2% inflation
            expect(result[2]).toBe(60000); // First pay rise applied - exact value
            expect(result[3]).toBeCloseTo(58536.59); // Inflation erodes (60000 / 1.025)
            expect(result[4]).toBe(70000); // Second pay rise applied - exact value
            expect(result[5]).toBeCloseTo(68292.68); // Inflation erodes (70000 / 1.025)
        });
    });
});

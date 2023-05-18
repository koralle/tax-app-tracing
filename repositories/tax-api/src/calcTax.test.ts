import { describe } from 'node:test';

import {
  calcRetirementIncomeDeduction,
  calcTaxableRetirementIncome,
  calcIncomeTaxBase
} from './calcTax';

describe('退職所得控除額', () => {
  describe('勤続年数が1年の場合', () => {
    describe('「障害者になったことに直接起因して退職」に該当しない場合', () => {
      test.each`
        yearsOfService | expected
        ${1}           | ${800_000}
      `(
        '勤続年数$yearsOfService年 -> $expected円',
        ({ yearsOfService, expected }: { yearsOfService: number; expected: number }) => {
          const deduction = calcRetirementIncomeDeduction({
            // 勤続年数
            yearsOfService,
            // 障害者になったことに直接起因して退職したか
            isDisability: false,
          });

          expect(deduction).toBe(expected);
        }
      );
    });

    describe('「障害者になったことに直接起因して退職」に該当する場合', () => {
      test.each`
        yearsOfService | expected
        ${1}           | ${1_800_000}
      `(
        '勤続年数$yearsOfService年 -> $expected円',
        ({ yearsOfService, expected }: { yearsOfService: number; expected: number }) => {
          const deduction = calcRetirementIncomeDeduction({
            // 勤続年数
            yearsOfService,
            // 障害者になったことに直接起因して退職したか
            isDisability: true,
          });

          expect(deduction).toBe(expected);
        }
      );
    });
  });

  describe('勤続年数が2年から19年の場合', () => {
    describe('「障害者になったことに直接起因して退職」に該当しない場合', () => {
      test.each`
        yearsOfService | expected
        ${2}           | ${800_000}
        ${3}           | ${1_200_000}
        ${19}          | ${7_600_000}
      `(
        '勤続年数$yearsOfService年 -> $expected円',
        ({ yearsOfService, expected }: { yearsOfService: number; expected: number }) => {
          const deduction = calcRetirementIncomeDeduction({
            // 勤続年数
            yearsOfService,
            // 障害者になったことに直接起因して退職したか
            isDisability: false,
          });

          expect(deduction).toBe(expected);
        }
      );
    });

    describe('「障害者になったことに直接起因して退職」に該当する場合', () => {
      test.each`
        yearsOfService | expected
        ${2}           | ${1_800_000}
        ${3}           | ${2_200_000}
        ${19}          | ${8_600_000}
      `(
        '勤続年数$yearsOfService年 -> $expected円',
        ({ yearsOfService, expected }: { yearsOfService: number; expected: number }) => {
          const deduction = calcRetirementIncomeDeduction({
            // 勤続年数
            yearsOfService,
            // 障害者になったことに直接起因して退職したか
            isDisability: true,
          });

          expect(deduction).toBe(expected);
        }
      );
    });
  });

  describe('勤続年数が20年以上の場合', () => {
    describe('「障害者になったことに直接起因して退職」に該当しない場合', () => {
      test.each`
        yearsOfService | expected
        ${20}          | ${8_000_000}
        ${21}          | ${8_700_000}
        ${30}          | ${15_000_000}
      `(
        '勤続年数$yearsOfService年 -> $expected円',
        ({ yearsOfService, expected }: { yearsOfService: number; expected: number }) => {
          const deduction = calcRetirementIncomeDeduction({
            // 勤続年数
            yearsOfService,
            // 障害者になったことに直接起因して退職したか
            isDisability: false,
          });

          expect(deduction).toBe(expected);
        }
      );
    });

    describe('「障害者になったことに直接起因して退職」に該当する場合', () => {
      test.each`
        yearsOfService | expected
        ${20}          | ${9_000_000}
        ${21}          | ${9_700_000}
        ${30}          | ${16_000_000}
      `(
        '勤続年数$yearsOfService年 -> $expected円',
        ({ yearsOfService, expected }: { yearsOfService: number; expected: number }) => {
          const deduction = calcRetirementIncomeDeduction({
            // 勤続年数
            yearsOfService,
            // 障害者になったことに直接起因して退職したか
            isDisability: true,
          });

          expect(deduction).toBe(expected);
        }
      );
    });
  });
});

describe('課税退職所得金額', () => {
  describe('勤続年数が6年以上の場合', () => {
    test.each`
      yearsOfService | severancePay | deduction   | isOfficer | expected
      ${6}           | ${300_0000}  | ${240_0000} | ${false}  | ${30_0000}
      ${6}           | ${300_0000}  | ${240_0000} | ${true}   | ${30_0000}
      ${6}           | ${300_1999}  | ${240_0000} | ${false}  | ${30_0000}
      ${6}           | ${300_1999}  | ${240_0000} | ${true}   | ${30_0000}
      ${6}           | ${300_2000}  | ${240_0000} | ${false}  | ${30_1000}
      ${6}           | ${300_2000}  | ${240_0000} | ${true}   | ${30_1000}
      ${6}           | ${100_0000}  | ${240_0000} | ${false}  | ${0}
      ${6}           | ${100_0000}  | ${240_0000} | ${true}   | ${0}
    `(
      '勤続年数$yearsOfService年, 退職金$severancePay円, 退職所得控除額$deduction円, 役員等$isOfficer -> $expected円',
      ({
        yearsOfService,
        severancePay,
        deduction,
        isOfficer,
        expected,
      }: {
        yearsOfService: number;
        severancePay: number;
        deduction: number;
        isOfficer: boolean;
        expected: number;
      }) => {
        const targetIncome = calcTaxableRetirementIncome({
          yearsOfService,
          severancePay,
          deduction,
          isOfficer,
        });

        expect(targetIncome).toBe(expected);
      }
    );
  });
  describe('役員等で勤続年数が5年以下の場合', () => {
    test.each`
      yearsOfService | severancePay | deduction   | isOfficer | expected
      ${5}           | ${300_0000}  | ${200_0000} | ${true}   | ${100_0000}
      ${5}           | ${300_0999}  | ${200_0000} | ${true}   | ${100_0000}
      ${5}           | ${300_1000}  | ${200_0000} | ${true}   | ${100_1000}
      ${5}           | ${100_0000}  | ${200_0000} | ${true}   | ${0}
    `(
      '勤続年数$yearsOfService年, 退職金$severancePay円, 退職所得控除額$deduction円, 役員等$isOfficer -> $expected円',
      ({
        yearsOfService,
        severancePay,
        deduction,
        isOfficer,
        expected,
      }: {
        yearsOfService: number;
        severancePay: number;
        deduction: number;
        isOfficer: boolean;
        expected: number;
      }) => {
        const targetIncome = calcTaxableRetirementIncome({
          yearsOfService,
          severancePay,
          deduction,
          isOfficer,
        });

        expect(targetIncome).toBe(expected);
      }
    );
  });
  describe('役員等以外で勤続年数が5年以下の場合', () => {
    describe('控除後の金額が300万円以下の場合', () => {
      test.each`
        yearsOfService | severancePay | deduction   | isOfficer | expected
        ${5}           | ${300_0000}  | ${200_0000} | ${false}  | ${50_0000}
        ${5}           | ${500_0000}  | ${200_0000} | ${false}  | ${150_0000}
        ${5}           | ${300_1999}  | ${200_0000} | ${false}  | ${50_0000}
        ${5}           | ${300_2000}  | ${200_0000} | ${false}  | ${50_1000}
        ${5}           | ${100_0000}  | ${200_0000} | ${false}  | ${0}
      `(
        '勤続年数$yearsOfService年, 退職金$severancePay円, 退職所得控除額$deduction円 -> $expected円',
        ({
          yearsOfService,
          severancePay,
          deduction,
          isOfficer,
          expected,
        }: {
          yearsOfService: number;
          severancePay: number;
          deduction: number;
          isOfficer: boolean;
          expected: number;
        }) => {
          const targetIncome = calcTaxableRetirementIncome({
            yearsOfService,
            severancePay,
            deduction,
            isOfficer,
          });

          expect(targetIncome).toBe(expected);
        }
      );
    });

    describe('控除後の金額が300万円を超える場合', () => {
      test.each`
        yearsOfService | severancePay | deduction   | isOfficer | expected
        ${5}           | ${600_0000}  | ${200_0000} | ${false}  | ${250_0000}
        ${5}           | ${600_1999}  | ${200_0000} | ${false}  | ${250_1000}
        ${5}           | ${600_2000}  | ${200_0000} | ${false}  | ${250_2000}
      `(
        '勤続年数$yearsOfService年, 退職金$severancePay円, 退職所得控除額$deduction円 -> $expected円',
        ({
          yearsOfService,
          severancePay,
          deduction,
          isOfficer,
          expected,
        }: {
          yearsOfService: number;
          severancePay: number;
          deduction: number;
          isOfficer: boolean;
          expected: number;
        }) => {
          const targetIncome = calcTaxableRetirementIncome({
            yearsOfService,
            severancePay,
            deduction,
            isOfficer,
          });

          expect(targetIncome).toBe(expected);
        }
      );
    });
  });
});

describe('基準所得税額', () => {
  test.each`
    taxableRetirementIncome | expected
    ${0}                    | ${0}
    ${1_000}                | ${50}
    ${1_949_000}            | ${97_450}
    ${1_950_000}            | ${97_500}
    ${3_299_000}            | ${232_400}
    ${3_300_000}            | ${232_500}
    ${6_949_000}            | ${962_300}
    ${6_950_000}            | ${962_500}
    ${8_999_000}            | ${1_433_770}
    ${9_000_000}            | ${1_434_000}
    ${17_999_000}           | ${4_403_670}
    ${18_000_000}           | ${4_404_000}
    ${39_999_000}           | ${13_203_600}
    ${40_000_000}           | ${13_204_000}
  `(
    '課税退職所得金額$taxableRetirementIncome円 -> $expected円',
    ({ taxableRetirementIncome, expected }: { taxableRetirementIncome: number; expected: number }) => {
      expect(calcIncomeTaxBase({ taxableRetirementIncome })).toBe(expected);
    }
  );
});

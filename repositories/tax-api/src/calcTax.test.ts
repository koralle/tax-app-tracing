import { describe } from 'node:test';

import type {
  CalcIncomeTaxForSeverancePayInput,
} from './calcTax';
import {
  calcIncomeTaxBase,
  calcIncomeTaxForSeverancePay,
  calcRetirementIncomeDeduction,
  calcTaxableRetirementIncome,
  calcTaxWithheld,
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

describe('源泉徴収税額', () => {
  test.each`
    incomeTaxBase | expected
    ${0}          | ${0}
    ${50}         | ${51}
    ${120}        | ${122}
    ${1000}       | ${1021}
  `(
    '基準所得税額$incomeTaxBase円 -> $expected円',
    ({ incomeTaxBase, expected }: { incomeTaxBase: number; expected: number }) => {
      expect(calcTaxWithheld({ incomeTaxBase })).toBe(expected);
    }
  );
});

describe('退職金の所得税', () => {
  test.each`
    yearsOfService | isDisability | isOfficer | severancePay | expected
    ${5}           | ${false}     | ${false}  | ${8_000_000} | ${482_422}
    ${10}          | ${false}     | ${false}  | ${8_000_000} | ${104_652}
    ${5}           | ${true}      | ${false}  | ${8_000_000} | ${278_222}
    ${10}          | ${true}      | ${false}  | ${8_000_000} | ${76_575}
    ${5}           | ${false}     | ${true}   | ${8_000_000} | ${788_722}
    ${10}          | ${false}     | ${true}   | ${8_000_000} | ${104_652}
    ${5}           | ${true}      | ${true}   | ${8_000_000} | ${584_522}
    ${10}          | ${true}      | ${true}   | ${8_000_000} | ${76_575}
  `(
    '勤続年数$yearsOfService年, 障害者となったことに直接起因して退職:$isDisability,' +
    '役員等:$isOfficer, 退職金$severancePay円 -> $expected円',
    ({
      yearsOfService,
      isDisability,
      isOfficer,
      severancePay,
      expected,
    }: CalcIncomeTaxForSeverancePayInput & { expected: ReturnType<typeof calcIncomeTaxForSeverancePay> }) => {
      const tax = calcIncomeTaxForSeverancePay({
        yearsOfService,
        isDisability,
        isOfficer,
        severancePay,
      });

      expect(tax).toBe(expected);
    }
  );

  describe('入力値バリデーション', () => {
    describe('勤続年数は1以上100以下の整数であること', () => {
      test.each`
        yearsOfService
        ${-1}
        ${0}
        ${101}
        ${10.5}
        ${null}
        ${undefined}
        ${'some string'}
      `(
        '勤続年数$yearsOfService年はError',
        ({ yearsOfService }: Pick<CalcIncomeTaxForSeverancePayInput, 'yearsOfService'>) => {
          expect(() =>
            calcIncomeTaxForSeverancePay({
              yearsOfService,
              isDisability: false,
              isOfficer: false,
              severancePay: 100_000_000,
            })
          ).toThrowError(/^Invalid argument.$/i);
        }
      );

      test.each`
        yearsOfService | expected
        ${1}           | ${39_991_549}
        ${100}         | ${4_496_484}
      `(
        '勤続年数$yearsOfService年は成功',
        ({
          yearsOfService,
          expected,
        }: Pick<CalcIncomeTaxForSeverancePayInput, 'yearsOfService'> & {
          expected: ReturnType<typeof calcIncomeTaxForSeverancePay>;
        }) => {
          expect(
            calcIncomeTaxForSeverancePay({
              yearsOfService,
              isDisability: false,
              isOfficer: false,
              severancePay: 100_000_000,
            })
          ).toBe(expected);
        }
      );
    });

    describe('退職金は0以上1兆以下の整数であること', () => {
      test.each`
        severancePay
        ${-1}
        ${1_000_000_000_001}
        ${8_000_000.1}
      `('退職金$severancePay円はError', ({ severancePay }: Pick<CalcIncomeTaxForSeverancePayInput, 'severancePay'>) => {
        expect(() =>
          calcIncomeTaxForSeverancePay({
            yearsOfService: 5,
            isDisability: false,
            isOfficer: false,
            severancePay,
          })
        ).toThrowError(/^Invalid argument.$/i);
      });

      test.each`
        severancePay         | expected
        ${0}                 | ${0}
        ${1_000_000_000_000} | ${459443495209}
      `(
        '退職金$severancePay円は成功',
        ({
          severancePay,
          expected,
        }: Pick<CalcIncomeTaxForSeverancePayInput, 'severancePay'> & {
          expected: ReturnType<typeof calcIncomeTaxForSeverancePay>;
        }) => {
          expect(
            calcIncomeTaxForSeverancePay({
              yearsOfService: 5,
              isDisability: false,
              isOfficer: false,
              severancePay,
            })
          ).toBe(expected);
        }
      );
    });

    describe('不正な値の場合', () => {
      test.each`
        yearsOfService
        ${null}
        ${undefined}
        ${'some string'}
      `(
        '勤続年数:$yearsOfServiceはError',
        ({ yearsOfService, isDisability, isOfficer, severancePay }: CalcIncomeTaxForSeverancePayInput) => {
          expect(() =>
            calcIncomeTaxForSeverancePay({ yearsOfService, isDisability, isOfficer, severancePay })
          ).toThrowError(/^Invalid argument.$/i);
        }
      );

      test.each`
        isDisability
        ${null}
        ${undefined}
        ${'some string'}
      `(
        '障害者となったことに直接起因して退職したか:$isDisabilityはError',
        ({ yearsOfService, isDisability, isOfficer, severancePay }: CalcIncomeTaxForSeverancePayInput) => {
          expect(() =>
            calcIncomeTaxForSeverancePay({ yearsOfService, isDisability, isOfficer, severancePay })
          ).toThrowError(/^Invalid argument.$/i);
        }
      );

      test.each`
        isOfficer
        ${null}
        ${undefined}
        ${'some string'}
      `(
        '役員等かどうか:$isOfficerはError',
        ({ yearsOfService, isDisability, isOfficer, severancePay }: CalcIncomeTaxForSeverancePayInput) => {
          expect(() =>
            calcIncomeTaxForSeverancePay({ yearsOfService, isDisability, isOfficer, severancePay })
          ).toThrowError(/^Invalid argument.$/i);
        }
      );

      test.each`
        severancePay
        ${null}
        ${undefined}
        ${'some string'}
      `(
        '退職金:$severancePayはError',
        ({ yearsOfService, isDisability, isOfficer, severancePay }: CalcIncomeTaxForSeverancePayInput) => {
          expect(() =>
            calcIncomeTaxForSeverancePay({ yearsOfService, isDisability, isOfficer, severancePay })
          ).toThrowError(/^Invalid argument.$/i);
        }
      );
    });

    describe('プロパティが未定義の場合', () => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      /* eslint-disable @typescript-eslint/no-unsafe-argument */
      test('勤続年数が未定義の場合はError', () => {
        expect(() =>
          calcIncomeTaxForSeverancePay({
            isDisability: false,
            isOfficer: false,
            severancePay: 100_000_000,
          } as any)
        ).toThrowError(/^Invalid argument.$/i);
      });

      test('障害者となったことに直接起因して退職したかが未定義の場合はError', () => {
        expect(() =>
          calcIncomeTaxForSeverancePay({
            yearsOfService: 5,
            isOfficer: false,
            severancePay: 100_000_000,
          } as any)
        ).toThrowError(/^Invalid argument.$/i);
      });

      test('役員かどうかが未定義の場合はError', () => {
        expect(() =>
          calcIncomeTaxForSeverancePay({
            yearsOfService: 5,
            isDisability: false,
            severancePay: 100_000_000,
          } as any)
        ).toThrowError(/^Invalid argument.$/i);
      });

      test('退職金が未定義の場合はError', () => {
        expect(() =>
          calcIncomeTaxForSeverancePay({
            yearsOfService: 5,
            isDisability: false,
            isOfficer: false,
          } as any)
        ).toThrowError(/^Invalid argument.$/i);
      });
    });

    describe('不正なオブジェクトの場合', () => {
      test('余計なプロパティが含まれている場合はError', () => {
        expect(() =>
          calcIncomeTaxForSeverancePay({
            yearsOfService: 5,
            isDisability: false,
            isOfficer: false,
            severancePay: 100_000_000,
            hoge: 'fuga',
          } as any)
        ).toThrowError(/^Invalid argument.$/i);
      });

      test('空オブジェクトの場合はError', () => {
        expect(() => calcIncomeTaxForSeverancePay({} as any)).toThrowError(/^Invalid argument.$/i);
      });

      test('オブジェクトではない場合はError', () => {
        expect(() => calcIncomeTaxForSeverancePay(0 as any)).toThrowError(/^Invalid argument.$/i);
      });

      test('undefinedの場合はError', () => {
        expect(() => calcIncomeTaxForSeverancePay(undefined as any)).toThrowError(/^Invalid argument.$/i);
      });

      test('nullの場合はError', () => {
        expect(() => calcIncomeTaxForSeverancePay(null as any)).toThrowError(/^Invalid argument.$/i);
      });
    });
    /* eslint-enable */
  });
});

import request from 'supertest';

import app from './app';
import type { CalcIncomeTaxForSeverancePayInput, calcIncomeTaxForSeverancePay } from './calcTax';

describe('POST /calc-tax', () => {
  test('退職金の所得税を計算する', async () => {
    const res = await request(app).post('/calc-tax').send({
      yearsOfService: 6,
      isOfficer: false,
      isDisability: false,
      severancePay: 3_000_000,
    });

    expect(res.status).toBe(200);

    expect(res.body).toStrictEqual({ tax: 15315 });
  });

  describe('入力値バリデーション', () => {
    describe('勤続年数は1以上100以下の整数であること', () => {
      test.each`
        yearsOfService
        ${-1}
        ${0}
        ${101}
        ${10.5}
      `(
        '勤続年数$yearsOfService年はError',
        async ({ yearsOfService }: Pick<CalcIncomeTaxForSeverancePayInput, 'yearsOfService'>) => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService,
            isOfficer: false,
            isDisability: false,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        }
      );

      test.each`
        yearsOfService
        ${1}
        ${100}
      `(
        '勤続年数$yearsOfService年は成功',
        async ({ yearsOfService }: Pick<CalcIncomeTaxForSeverancePayInput, 'yearsOfService'>) => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService,
            isOfficer: false,
            isDisability: false,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(200);
        }
      );
    });

    describe('退職金は0以上1兆以下の整数であること', () => {
      test.each`
        severancePay
        ${-1}
        ${1_000_000_000_001}
        ${8_000_000.1}
      `(
        '退職金$severancePay年はError',
        async ({ severancePay }: Pick<CalcIncomeTaxForSeverancePayInput, 'severancePay'>) => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isOfficer: false,
            isDisability: false,
            severancePay,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        }
      );

      test.each`
        severancePay
        ${0}
        ${1_000_000_000_000}
      `(
        '退職金$severancePay年は成功',
        async ({ severancePay }: Pick<CalcIncomeTaxForSeverancePayInput, 'severancePay'>) => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isOfficer: false,
            isDisability: false,
            severancePay,
          });

          expect(res.status).toBe(200);
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
        '勤続年数$yearsOfService年はError',
        async ({ yearsOfService }: Pick<CalcIncomeTaxForSeverancePayInput, 'yearsOfService'>) => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService,
            isOfficer: false,
            isDisability: false,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        }
      );

      test.each`
        isDisability
        ${null}
        ${undefined}
        ${'some string'}
      `(
        '障害者となったことに直接起因して退職したか:$isDisabilityはError',
        async ({ isDisability }: Pick<CalcIncomeTaxForSeverancePayInput, 'isDisability'>) => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isOfficer: false,
            isDisability,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        }
      );

      test.each`
        isOfficer
        ${null}
        ${undefined}
        ${'some string'}
      `(
        '役員等かどうか:$isOfficerはError',
        async ({ isOfficer }: Pick<CalcIncomeTaxForSeverancePayInput, 'isOfficer'>) => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isOfficer,
            isDisability: false,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        }
      );

      test.each`
        severancePay
        ${null}
        ${undefined}
        ${'some string'}
      `('退職金:$severancePay', async ({ severancePay }: Pick<CalcIncomeTaxForSeverancePayInput, 'severancePay'>) => {
        const res = await request(app).post('/calc-tax').send({
          yearsOfService: 6,
          isOfficer: false,
          isDisability: false,
          severancePay,
        });

        expect(res.status).toBe(400);
        expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
      });

      describe('プロパティが未定義の場合', () => {
        test('勤続年数が未定義の場合はError', async () => {
          const res = await request(app).post('/calc-tax').send({
            isOfficer: false,
            isDisability: false,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        });

        test('障害者となったことに直接起因して退職したかが未定義の場合はError', async () => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isOfficer: false,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        });

        test('役員等かどうかが未定義の場合はError', async () => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isDisability: false,
            severancePay: 3_000_000,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        });

        test('退職金が未定義の場合はError', async () => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isDisability: false,
            isOfficer: false,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        });
      });

      describe('不正なオブジェクトの場合', () => {
        test('意図していないプロパティが含まれている場合はError', async () => {
          const res = await request(app).post('/calc-tax').send({
            yearsOfService: 6,
            isDisability: false,
            isOfficer: false,
            severancePay: 3_000_000,
            hoge: true,
          });

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        });

        test('空オブジェクトの場合はError', async () => {
          const res = await request(app).post('/calc-tax').send({});

          expect(res.status).toBe(400);
          expect(res.body).toStrictEqual({ message: 'Invalid parameter.' });
        });
      });
    });
  });
});

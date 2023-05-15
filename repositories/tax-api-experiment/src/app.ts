/**
 * TODO:
 * [o] リクエストを受け付ける
 * [o] JSONを返す
 * [o] POSTでJSONボディを受け取る
 * [ ] サーバーやルーティングの設定が気になる
 * [o] ステータスコードの指定方法が気になる
 * [o] express.json()のドキュメントを読んでおく
 * [o] APIに対するテスト
 */
import express from 'express';

const app = express();

app.use(express.json());

type CalcInput = {
  yearsOfService: number;
  isDisability: boolean;
  isOfficer: boolean;
  severancePay: number;
};

const calcTax = (_: CalcInput): number => {
  return 10000;
};

app.post('/check-body', (req, res) => {
  console.dir(req.body);
  res.json({
    message: 'Hello, JSON body!',
  });
});

app.post('/calc-tax', (req, res) => {
  res.json({
    tax: calcTax(req.body as CalcInput),
  });
});

export default app;

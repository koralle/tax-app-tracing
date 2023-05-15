/**
 * TODO:
 * [o] リクエストを受け付ける
 * [o] JSONを返す
 * [o] POSTでJSONボディを受け取る
 * [ ] サーバーやルーティングの設定が気になる
 * [o] ステータスコードの指定方法が気になる
 * [o] express.json()のドキュメントを読んでおく
 * [ ] APIに対するテスト
 */
import express from 'express';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.post('/check-post', (_, res) => {
  res.json({
    message: 'Hello, JSON!',
  });
});

app.post('/check-body', (req, res) => {
  console.dir(req.body);
  res.json({
    message: 'Hello, JSON body!',
  });
});

app.post('/check-status-code', (_, res) => {
  res.status(500).json({
    message: 'Hello, JSON!',
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`);
});

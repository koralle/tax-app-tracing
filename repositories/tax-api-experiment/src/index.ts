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
import app from './app';

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`);
});

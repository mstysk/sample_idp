# Test Coverage Reports

このプロジェクトのテストカバレッジを確認する方法です。

## 基本的な使用方法

### 1. カバレッジ付きでテスト実行

```bash
deno task test:coverage
```

### 2. カバレッジレポート表示

```bash
deno task coverage
```

### 3. HTMLレポート生成

```bash
deno task coverage:html
```

### 4. 詳細レポート表示

```bash
deno task coverage:detailed
```

## Web UIでカバレッジレポートを確認

### HTMLレポートをNginxで表示

```bash
# HTMLレポート生成とNginxサーバー起動
deno task coverage:serve
```

### 手動でサーバー起動

```bash
# HTMLレポート生成
deno task coverage:html

# Nginxコンテナ起動
docker-compose up coverage -d
```

### アクセス方法

- カバレッジレポート: http://localhost:8090/coverage/
- トップページ: http://localhost:8090/

### サーバー停止

```bash
docker-compose down coverage
```

## カバレッジ情報の見方

- **Line Coverage**: 実行された行の割合
- **Branch Coverage**: 実行された分岐の割合
- **緑色**: 実行された行
- **赤色**: 実行されていない行
- **黄色**: 部分的に実行された行

## 現在のカバレッジ状況

- 全体のラインカバレッジ: 47.1%
- 全体のブランチカバレッジ: 79.6%

### 高いカバレッジのファイル

- Cookies.ts: 100%
- middleware.ts: 80.6%
- IdToken.ts: 86.0%
- Validator.ts: 84.6%

### 改善が必要なファイル

- JWK.ts: 2.7%
- KV.ts: 3.3%
- User.ts: 16.7%

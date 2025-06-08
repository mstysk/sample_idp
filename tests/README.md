# テストドキュメント

このディレクトリには、Sample IdProvider のテストコードが含まれています。

## テスト構成

### 📁 ディレクトリ構造
```
tests/
├── unit/                   # 単体テスト
│   ├── infra/             # インフラ層のテスト
│   ├── modules/           # ビジネスロジックのテスト
│   └── repository/        # データアクセス層のテスト
├── integration/           # 統合テスト
│   ├── auth/             # 認証エンドポイントのテスト
│   └── api/              # API エンドポイントのテスト
├── security/             # セキュリティテスト
└── README.md

```

## テストの実行

### 全テスト実行
```bash
deno task test
```

### ウォッチモードでテスト実行
```bash
deno task test:watch
```

### 特定のテストファイル実行
```bash
deno test tests/unit/infra/jwt.test.ts --allow-all --unstable-kv
```

### カバレッジ付きテスト実行
```bash
deno test --coverage=cov_profile --allow-all --unstable-kv
deno coverage cov_profile
```

## テストカテゴリ

### 🧪 単体テスト (Unit Tests)
- **JWT**: JWT トークンの生成と検証
- **バリデーター**: OpenID Connect パラメータの検証
- **ID トークン**: ID トークンの生成とクレーム処理
- **認証**: ユーザー認証とトークン処理
- **ユーザーリポジトリ**: パスワードハッシュ化

### 🔗 統合テスト (Integration Tests)
- **トークンエンドポイント**: OAuth2 トークン交換
- **認可エンドポイント**: OpenID Connect 認可フロー
- **Passkey認証**: WebAuthn 認証処理

### 🔐 セキュリティテスト (Security Tests)
- **認証検証**: セッション管理とアクセス制御
- **入力検証**: XSS、SQLインジェクション対策
- **パスワードセキュリティ**: ハッシュ化とソルト

## テスト環境

### 環境変数
テストでは以下の環境変数を設定しています：
- `JWT_SECRET`: JWT署名用の秘密鍵
- `CLIENT_ID`: テスト用クライアントID
- `CLIENT_SECRET`: テスト用クライアントシークレット
- `REDIRECT_URI`: テスト用リダイレクトURI

### モックデータ
テストでは以下のモックデータを使用：
- テストユーザー情報
- テストクライアント設定
- Mock Passkey認証レスポンス

## カバレッジ目標

- **全体**: 80% 以上
- **クリティカルパス**: 95% 以上
- **セキュリティ関連**: 100%

## ベストプラクティス

### テスト命名規則
```typescript
Deno.test("Component - should do something when condition", async () => {
  // テスト内容
});
```

### アサーション
```typescript
import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";

// 基本的なアサーション
assertEquals(actual, expected);
assertNotEquals(actual, unexpected);

// 例外テスト
assertThrows(() => {
  // 例外を投げる処理
}, Error, "期待されるエラーメッセージ");
```

### 非同期テスト
```typescript
Deno.test("Async operation", async () => {
  const result = await someAsyncOperation();
  assertEquals(result.success, true);
});
```

## トラブルシューティング

### よくある問題

1. **権限エラー**: `--allow-all` フラグを確認
2. **KVストレージエラー**: `--unstable-kv` フラグを確認
3. **環境変数**: テスト内で適切に設定されているか確認

### デバッグ
```bash
# デバッグ情報付きでテスト実行
DEBUG=true deno test --allow-all --unstable-kv

# 特定のテストのみデバッグ
deno test tests/unit/infra/jwt.test.ts --allow-all --unstable-kv --inspect-brk
```

## 継続的インテグレーション

CI/CDパイプラインでは以下を実行：
1. リンティング (`deno task check`)
2. 単体テスト (`deno task test`)
3. セキュリティテスト
4. カバレッジレポート生成
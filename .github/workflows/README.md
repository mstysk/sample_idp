# GitHub Actions ワークフロー

このディレクトリには、Sample IdProvider プロジェクトの CI/CD
パイプラインが含まれています。

## 📋 ワークフロー一覧

### 🔄 CI/CD ワークフロー

#### 1. **ci.yml** - メイン CI パイプライン

- **トリガー**: `main`, `develop` ブランチへの push/PR
- **実行内容**:
  - コードフォーマットチェック (`deno fmt --check`)
  - リンティング (`deno lint`)
  - 型チェック (`deno check`)
  - 全テスト実行 (カバレッジ付き)
  - ビルド検証
  - セキュリティチェック

#### 2. **pr-check.yml** - プルリクエスト品質チェック

- **トリガー**: PR作成・更新時
- **実行内容**:
  - 品質ゲート (フォーマット、リント、型チェック)
  - テスト実行とカバレッジ測定
  - セキュリティスキャン
  - ビルド検証
  - PR サマリー生成

#### 3. **release.yml** - リリース自動化

- **トリガー**: `v*` タグ作成時
- **実行内容**:
  - リリース前テスト
  - GitHub Release 作成
  - Docker イメージビルド・公開
  - アーティファクト生成

#### 4. **dependency-update.yml** - 依存関係監視

- **トリガー**: 毎週月曜 9:00 AM UTC (手動実行も可能)
- **実行内容**:
  - 依存関係の更新チェック
  - セキュリティ脆弱性スキャン
  - 必要に応じて Issue 作成

#### 5. **deploy.yml** - Deno Deploy 自動デプロイ

- **トリガー**: `main` ブランチへの push/PR
- **実行内容**:
  - Deno Deploy へのデプロイ

## 🚦 品質ゲート

### テスト失敗時の動作

すべてのワークフローでテストが失敗した場合、**CI は失敗ステータス**となり：

1. **プルリクエスト**: マージがブロックされます
2. **デプロイ**: 自動デプロイが停止します
3. **リリース**: リリース作成が中止されます

### 必須チェック項目

| チェック項目       | コマンド                    | 失敗時の影響 |
| ------------------ | --------------------------- | ------------ |
| コードフォーマット | `deno fmt --check`          | CI 失敗      |
| リンティング       | `deno lint`                 | CI 失敗      |
| 型チェック         | `deno check **/*.ts`        | CI 失敗      |
| 単体テスト         | `deno test`                 | CI 失敗      |
| セキュリティテスト | `deno test tests/security/` | CI 失敗      |
| ビルド             | `deno task build`           | CI 失敗      |

## 🔐 環境変数

### テスト用環境変数

```yaml
JWT_SECRET: test-secret-key-for-testing-with-sufficient-length-32-bytes
CLIENT_ID: test-client-id
CLIENT_SECRET: test-client-secret
REDIRECT_URI: http://localhost:3000/callback
CLIENTS: '[{"id":"test-client-id","secret":"test-client-secret","redirectUris":["http://localhost:3000/callback"]}]'
ISSUER: https://test-issuer.com
JWT_PUBLIC: test-jwt-public-key
JWT_KEY_ID: test-key-id
```

### 本番用環境変数 (secrets)

- `GITHUB_TOKEN`: GitHub API アクセス用
- その他の機密情報は GitHub Secrets で管理

## 📊 カバレッジレポート

- テスト実行時に自動生成
- Codecov に送信 (設定済み)
- PR に カバレッジ情報が表示

## 🐳 Docker サポート

### 自動イメージビルド

- タグ作成時に GitHub Container Registry に公開
- `ghcr.io/owner/sample_idp:latest`
- `ghcr.io/owner/sample_idp:v1.0.0` (バージョン付き)

## 🔧 ローカル実行

CI と同じチェックをローカルで実行:

```bash
# 品質チェック
deno task check

# テスト実行  
deno task test

# カバレッジ付きテスト
deno test --coverage=cov_profile --allow-all --unstable-kv
deno coverage cov_profile
```

## 🚨 トラブルシューティング

### よくある問題

1. **テスト失敗**:
   - ローカルで `deno task test` を実行
   - 環境変数の設定を確認

2. **型エラー**:
   - `deno check **/*.ts` でローカル確認
   - 型定義の不整合をチェック

3. **フォーマットエラー**:
   - `deno fmt` で自動修正

4. **リントエラー**:
   - `deno lint` で問題箇所を確認

### ワークフロー無効化

一時的にワークフローを無効化する場合:

```yaml
# ワークフローファイルの先頭に追加
on: [] # すべてのトリガーを無効化
```

## 📈 監視とメンテナンス

- **依存関係**: 毎週自動チェック
- **セキュリティ**: 各 PR でスキャン実行
- **パフォーマンス**: テスト実行時間を監視
- **カバレッジ**: 目標 80% 以上を維持

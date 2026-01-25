# PKCE (Proof Key for Code Exchange) 設計

## 概要

Authorization Code GrantフローにRFC 7636 PKCEを追加し、認証コード横取り攻撃を防止する。

### 方針

- **サポートレベル**: オプショナル（PKCEパラメータがある場合のみ検証）
- **code_challenge_method**: S256のみサポート

## フロー

```
1. クライアント: code_verifier（ランダム文字列）を生成
2. クライアント: code_challenge = BASE64URL(SHA256(code_verifier)) を計算
3. /auth/authorize に code_challenge, code_challenge_method=S256 を送信
4. IdP: code_challenge をAuthCodeと一緒に保存
5. /auth/token に code_verifier を送信
6. IdP: SHA256(code_verifier) と保存済み code_challenge を比較
7. 一致すればトークン発行
```

### オプショナル動作

- `code_challenge` がない場合 → 従来通りトークン発行（PKCE検証なし）
- `code_challenge` がある場合 → `code_verifier` 必須、検証失敗時はエラー

## 変更ファイル

### 1. `src/Modules/Idp/Repositories/AuthCode.ts`

- `AuthCodeEntity` に `codeChallenge?: string` フィールドを追加
- `store()` メソッドの引数に `codeChallenge` を追加

### 2. `src/Modules/Idp/Validator.ts`

- `AuthorizationQueryParams` に `codeChallenge?: string` を追加
- `code_challenge_method` が `S256` 以外ならエラー
- `code_challenge` の形式バリデーション（BASE64URL、43〜128文字）

### 3. `routes/auth/authorize.tsx`

- `authCodeRepository.store()` 呼び出し時に `codeChallenge` を渡す

### 4. `routes/auth/token.tsx`

- `code_verifier` をフォームデータから取得
- PKCE検証ロジックを追加

### 5. 新規: `src/Modules/Idp/PKCE.ts`

検証ロジックを分離してテストしやすくする。

```typescript
// サポートするメソッド
export const CODE_CHALLENGE_METHOD = "S256" as const;

// code_verifier から code_challenge を生成
export function generateCodeChallenge(codeVerifier: string): Promise<string>

// code_verifier と code_challenge の検証
export function verifyCodeChallenge(
  codeVerifier: string,
  codeChallenge: string
): Promise<boolean>

// code_challenge の形式バリデーション（BASE64URL、43〜128文字）
export function isValidCodeChallenge(codeChallenge: string): boolean

// code_verifier の形式バリデーション（43〜128文字、unreserved characters）
export function isValidCodeVerifier(codeVerifier: string): boolean
```

#### 実装ポイント

- `crypto.subtle.digest("SHA-256", ...)` でハッシュ生成
- BASE64URL エンコード（`+` → `-`、`/` → `_`、パディング `=` 削除）
- RFC 7636準拠の文字数制限

## エラーハンドリング

### Authorizeエンドポイント（/auth/authorize）

| 条件 | レスポンス |
|------|-----------|
| `code_challenge_method` が `S256` 以外 | 400 `invalid_request`: unsupported code_challenge_method |
| `code_challenge` の形式不正 | 400 `invalid_request`: invalid code_challenge format |
| `code_challenge` なし | 正常続行（PKCEなし） |

### Tokenエンドポイント（/auth/token）

| 条件 | レスポンス |
|------|-----------|
| AuthCodeに `code_challenge` あり、`code_verifier` なし | 400 `invalid_grant`: code_verifier required |
| `code_verifier` の形式不正 | 400 `invalid_grant`: invalid code_verifier format |
| `code_verifier` と `code_challenge` 不一致 | 400 `invalid_grant`: code_verifier mismatch |
| AuthCodeに `code_challenge` なし、`code_verifier` あり | 無視して正常続行 |

## テスト方針

### ユニットテスト

`tests/Modules/Idp/PKCE.test.ts`:

- `generateCodeChallenge`: 既知のverifierから期待されるchallengeが生成されるか
- `verifyCodeChallenge`: 正しいペアでtrue、不正なペアでfalse
- `isValidCodeChallenge`: 形式バリデーション（長さ、文字種）
- `isValidCodeVerifier`: 形式バリデーション（長さ、文字種）

### 統合テスト

- PKCE付きの認可フロー全体が成功するか
- `code_verifier` 不一致でエラーになるか
- PKCE無しでも従来通り動作するか（後方互換性）

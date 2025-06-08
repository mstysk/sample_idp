#!/bin/bash
export JWT_SECRET="test-secret-key-for-testing-with-sufficient-length-32-bytes"
export CLIENT_ID="test-client-id"
export CLIENT_SECRET="test-client-secret"
export REDIRECT_URI="http://localhost:3000/callback"
export CLIENTS='[{"id":"test-client-id","secret":"test-client-secret","redirectUris":["http://localhost:3000/callback"]}]'
export ISSUER="https://test-issuer.com"
export JWT_PUBLIC="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2OINv2fvdkbWgxxONvbV
bUDGUJGdyRW9F95Wq4xJx6IdYeizNMwrh2wqU1cP7Gcpr2B4LcDx8/usQkGOlGNo
kwbCyRxeFGEgzNFt4Rv1YgE0RvLDiatg3PmIf44OzuXlT84jdBEiyS+4okMvibrh
gXAf3MS6r9sJHMPQL8OVDXot/Oo80+jo1m1TB1yzGaE80PBZuXg1OzDxz+WmcUkK
NCEb0NMii+z5qErWUzlQtdZjJLhnmXFHuS6H5TiD6oDyI0QO//FN9ahNUxixTGtu
tEHxPixoaRzaLEDI4PpwQhJWlAB8KWeCUUBVggg79oZx+sgR1KUn+8teEbCJ3khZ
gQIDAQAB
-----END PUBLIC KEY-----"
export JWT_KEY_ID="test-key-id"

exec "$@"
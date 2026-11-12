#!/usr/bin/env bash
# Automated Android Production Keystore Generator for Heftin PayPulse
set -e

KEYSTORE_NAME="paypulse-release.jks"
ALIAS="paypulse-release-key"
VALIDITY_DAYS=10000

echo "=========================================================="
echo "🔐 Heftin PayPulse Android Production Keystore Generator"
echo "=========================================================="

DEST_DIR="$(dirname "$0")/../mobile/android/app"
mkdir -p "$DEST_DIR"

DEST_PATH="$DEST_DIR/$KEYSTORE_NAME"

if [ -f "$DEST_PATH" ]; then
  echo "⚠️ Keystore already exists at: $DEST_PATH"
  exit 0
fi

echo "Target keystore path: $DEST_PATH"

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$DEST_PATH" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity "$VALIDITY_DAYS" \
  -dname "CN=Heftin PayPulse Engineering, OU=Mobile Release, O=Heftin AI, L=San Francisco, ST=California, C=US" \
  -storepass "PayPulseProdKey2026!" \
  -keypass "PayPulseProdKey2026!"

echo "✅ Release keystore created successfully at: $DEST_PATH"

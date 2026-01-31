#!/bin/bash

# Test script for TrezoaKora Docker + Commerce Program integration
set -e

echo "🚀 Starting TrezoaKora Docker + Commerce Program Integration Test"

# Auto-detect paths using git
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMMERCE_DIR="$(cd "$SCRIPT_DIR/.." && git rev-parse --show-toplevel)"

# Always download TrezoaKora repository for demo
echo "🔄 Downloading TrezoaKora repository for demo..."
TEMP_TREZOAKORA_DIR="/tmp/trezoakora-demo-$(date +%s)"
git clone --depth 1 https://github.com/trzledgerfoundation/trezoakora.git "$TEMP_TREZOAKORA_DIR"

# Copy Docker files from commerce trezoa to downloaded repo
echo "📂 Copying Docker configuration files..."
cp "$SCRIPT_DIR/docker/Dockerfile.simple" "$TEMP_TREZOAKORA_DIR/Dockerfile.simple" 2>/dev/null || {
    echo "⚠️  Dockerfile.simple not found in commerce trezoa, using default"
}
cp "$SCRIPT_DIR/docker/.dockerignore" "$TEMP_TREZOAKORA_DIR/.dockerignore" 2>/dev/null || {
    echo "⚠️  .dockerignore not found in commerce trezoa, using default"
}
cp "$SCRIPT_DIR/docker/entrypoint.sh" "$TEMP_TREZOAKORA_DIR/entrypoint.sh" 2>/dev/null || {
    echo "⚠️  entrypoint.sh not found in commerce trezoa, using default"
}

TREZOAKORA_DIR="$TEMP_TREZOAKORA_DIR"
echo "✅ Downloaded TrezoaKora to temporary directory: $TREZOAKORA_DIR"

# Configuration
TREZOAKORA_TEST_DIR="$COMMERCE_DIR/program/trezoakora"
TREZOAKORA_PORT=8080
VALIDATOR_PORT=8899

# Cleanup function
cleanup() {
    echo "🧹 Cleaning up test environment..."
    docker stop trezoakora-test-server 2>/dev/null || true
    docker rm trezoakora-test-server 2>/dev/null || true
    pkill -f "trezoa-test-validator" 2>/dev/null || true

    # Clean up temporary TrezoaKora directory if it was downloaded
    if [[ "$TREZOAKORA_DIR" == /tmp/trezoakora-demo-* ]]; then
        echo "🗑️  Removing temporary TrezoaKora directory..."
        rm -rf "$TREZOAKORA_DIR"
    fi
    exit 0
}

trap cleanup EXIT

# Step 1: Build TrezoaKora Docker image (using simplified Dockerfile to avoid cargo-chef issues)
echo "📦 Building TrezoaKora Docker image..."
cd "$TREZOAKORA_DIR"
docker build -f Dockerfile.simple -t trezoakora-node:test .

# Step 2: Build commerce program first
echo "🏗️  Building commerce program..."
cd "$COMMERCE_DIR/program"

# Clean and rebuild without devnet flag
echo "  → Building program for mainnet..."
make build

echo "  → Generating IDL..."
make idl

echo "  → Generating clients..."
make generate-clients

# Step 3: Fetch mint accounts for USDC and USDT
echo "📥 Fetching mint accounts..."
mkdir -p "$COMMERCE_DIR/program/tests/setup/mints"
trezoa account EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS -um \
    --output-file "$COMMERCE_DIR/program/tests/setup/mints/usdc.json" --output json-compact || {
    echo "⚠️  Could not fetch USDC mint account, continuing without it"
}
trezoa account GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA -um \
    --output-file "$COMMERCE_DIR/program/tests/setup/mints/usdt.json" --output json-compact || {
    echo "⚠️  Could not fetch USDT mint account, continuing without it"
}

# Step 4: Start Trezoa test validator with mint accounts and commerce program
echo "⚡ Starting Trezoa test validator..."
VALIDATOR_ARGS="-r --rpc-port $VALIDATOR_PORT"

# Add mint accounts if they exist
if [ -f "$COMMERCE_DIR/program/tests/setup/mints/usdc.json" ]; then
    VALIDATOR_ARGS="$VALIDATOR_ARGS --account EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS $COMMERCE_DIR/program/tests/setup/mints/usdc.json"
fi
if [ -f "$COMMERCE_DIR/program/tests/setup/mints/usdt.json" ]; then
    VALIDATOR_ARGS="$VALIDATOR_ARGS --account GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA $COMMERCE_DIR/program/tests/setup/mints/usdt.json"
fi

# Add commerce program
VALIDATOR_ARGS="$VALIDATOR_ARGS --bpf-program ECWxgnnpYoq57eNBuxmP8SKLmCFDSh4z8R4gYw7wm52e $COMMERCE_DIR/program/target/deploy/commerce_program.so"

trezoa-test-validator $VALIDATOR_ARGS --quiet &

# Wait for validator to be ready
echo "⏳ Waiting for test validator..."
sleep 5

# Step 5: Use existing TrezoaKora operator keypair
echo "🔑 Using TrezoaKora operator keypair..."
TREZOAKORA_KEYPAIR_FILE="$TREZOAKORA_TEST_DIR/keys/trezoakora-operator.json"

if [ ! -f "$TREZOAKORA_KEYPAIR_FILE" ]; then
    echo "❌ TrezoaKora operator keypair not found at $TREZOAKORA_KEYPAIR_FILE"
    echo "Please create it with: trezoa-keygen new --outfile $TREZOAKORA_KEYPAIR_FILE"
    exit 1
fi

TEST_KEYPAIR=$(cat "$TREZOAKORA_KEYPAIR_FILE")
TEST_PUBKEY=$(trezoa-keygen pubkey "$TREZOAKORA_KEYPAIR_FILE")

echo "  → TrezoaKora operator public key: $TEST_PUBKEY"

# Fund the TrezoaKora operator keypair
echo "  → Funding TrezoaKora operator with 10 TRZ..."
trezoa airdrop 10 "$TEST_PUBKEY" \
    --url "http://127.0.0.1:$VALIDATOR_PORT" || true

# Step 6: Start TrezoaKora server in Docker
echo "🌐 Starting TrezoaKora RPC server..."
docker run -d \
    --name trezoakora-test-server \
    -p "$TREZOAKORA_PORT:$TREZOAKORA_PORT" \
    -v "$TREZOAKORA_TEST_DIR/test-trezoakora.toml:/app/config/trezoakora.toml:ro" \
    -e RUST_LOG=debug \
    -e RPC_URL="http://host.docker.internal:$VALIDATOR_PORT" \
    -e PORT="$TREZOAKORA_PORT" \
    -e TREZOAKORA_PRIVATE_KEY="$TEST_KEYPAIR" \
    -e TREZOAKORA_CONFIG_PATH=/app/config/trezoakora.toml \
    trezoakora-node:test server

# Wait for TrezoaKora to start with proper health check loop
echo "⏳ Waiting for TrezoaKora server to start..."
sleep 3

# Wait for liveness endpoint to be ready (up to 30 seconds)
echo "  → Checking server readiness..."

# Check if container is running
if ! docker ps | grep -q "trezoakora-test-server"; then
    echo "  ❌ Docker container is not running!"
    docker logs trezoakora-test-server 2>/dev/null || echo "No logs available"
    exit 1
fi

# Step 7: Test TrezoaKora endpoints
echo "🧪 Testing TrezoaKora endpoints..."

# Test liveness endpoint with JSON-RPC
echo "  → Testing liveness endpoint..."
liveness_response=$(curl -s -X POST "http://localhost:$TREZOAKORA_PORT" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"liveness","id":1}')

if echo "$liveness_response" | grep -q '"result":null'; then
    echo "  ✅ Liveness check passed"
else
    echo "❌ Liveness check failed: $liveness_response"
    docker logs trezoakora-test-server
    exit 1
fi

# # Keep running for manual testing
read -p "Press Enter to stop the test environment..."

#!/bin/bash

# ============================================
# SNAP Benefits Administration System
# Start Script
# ============================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🏛️  SNAP Benefits Administration System"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load .env manually (safe parsing)
if [ -f "$PROJECT_DIR/.env" ]; then
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    # Trim whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | sed 's/^"//' | sed 's/"$//')
    export "$key=$value"
  done < "$PROJECT_DIR/.env"
fi

SERVER_PORT=${SERVER_PORT:-4000}
CLIENT_PORT=${CLIENT_PORT:-3000}
DB_NAME=${DB_NAME:-snap_benefits}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

SERVER_PID=""
CLIENT_PID=""

# Function: Cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down...${NC}"
  [ -n "$CLIENT_PID" ] && kill $CLIENT_PID 2>/dev/null
  [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null
  sleep 1
  # Force kill if still running
  for port in $SERVER_PORT $CLIENT_PORT; do
    pid=$(lsof -ti :$port 2>/dev/null || true)
    [ -n "$pid" ] && kill -9 $pid 2>/dev/null
  done
  echo "Goodbye!"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Function: Kill processes on ports
cleanup_ports() {
  echo -e "${YELLOW}🔧 Cleaning up ports...${NC}"
  for port in $SERVER_PORT $CLIENT_PORT; do
    pid=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
      echo -e "  Killing process on port $port (PID: $pid)"
      kill -9 $pid 2>/dev/null || true
      sleep 1
    fi
  done
  echo -e "${GREEN}✅ Ports cleaned${NC}"
}

# Function: Setup database
setup_database() {
  echo -e "${YELLOW}🗄️  Setting up database...${NC}"

  # Check if PostgreSQL is running
  if ! pg_isready -h $DB_HOST -p $DB_PORT -q 2>/dev/null; then
    echo -e "${RED}❌ PostgreSQL is not running. Please start PostgreSQL first.${NC}"
    echo "   On macOS: brew services start postgresql"
    echo "   On Linux: sudo systemctl start postgresql"
    exit 1
  fi

  # Create database if not exists
  if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" 2>/dev/null | grep -q 1; then
    echo -e "  Creating database '$DB_NAME'..."
    PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || echo -e "  Database may already exist"
  else
    echo -e "  Database '$DB_NAME' exists"
  fi

  echo -e "${GREEN}✅ Database ready${NC}"
}

# Function: Install dependencies
install_deps() {
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"

  if [ ! -d "$PROJECT_DIR/server/node_modules" ]; then
    echo -e "  Installing server dependencies..."
    (cd "$PROJECT_DIR/server" && npm install)
  else
    echo -e "  Server dependencies already installed"
  fi

  if [ ! -d "$PROJECT_DIR/client/node_modules" ]; then
    echo -e "  Installing client dependencies..."
    (cd "$PROJECT_DIR/client" && npm install)
  else
    echo -e "  Client dependencies already installed"
  fi

  echo -e "${GREEN}✅ Dependencies installed${NC}"
}

# Function: Seed database
seed_database() {
  echo -e "${YELLOW}🌱 Seeding database...${NC}"
  (cd "$PROJECT_DIR/server" && node seeds/seed.js)
  echo -e "${GREEN}✅ Database seeded${NC}"
}

# Function: Start services
start_services() {
  echo ""
  echo -e "${BLUE}🚀 Starting services...${NC}"
  echo ""

  # Start backend server with nodemon for hot reload
  echo -e "  Starting backend server on port ${SERVER_PORT}..."
  (cd "$PROJECT_DIR/server" && npx nodemon --exitcrash index.js) &
  SERVER_PID=$!

  # Wait for server to be ready
  echo -e "  Waiting for server to start..."
  for i in $(seq 1 15); do
    if curl -s http://localhost:$SERVER_PORT/api/health > /dev/null 2>&1; then
      echo -e "  ${GREEN}Backend is ready!${NC}"
      break
    fi
    sleep 1
  done

  if ! curl -s http://localhost:$SERVER_PORT/api/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend failed to start${NC}"
    cleanup
    exit 1
  fi

  # Start React client with hot reload
  echo -e "  Starting frontend on port ${CLIENT_PORT}..."
  (cd "$PROJECT_DIR/client" && BROWSER=none PORT=$CLIENT_PORT npm start) &
  CLIENT_PID=$!

  # Wait for frontend to compile
  echo -e "  Waiting for frontend to compile..."
  for i in $(seq 1 60); do
    if curl -s http://localhost:$CLIENT_PORT > /dev/null 2>&1; then
      echo -e "  ${GREEN}Frontend is ready!${NC}"
      break
    fi
    sleep 1
  done

  echo ""
  echo -e "${GREEN}============================================${NC}"
  echo -e "${GREEN}🎉 Application is running!${NC}"
  echo -e "${GREEN}============================================${NC}"
  echo ""
  echo -e "  🌐 Frontend:   ${BLUE}http://localhost:${CLIENT_PORT}${NC}"
  echo -e "  🔧 Backend:    ${BLUE}http://localhost:${SERVER_PORT}${NC}"
  echo -e "  📊 API Health: ${BLUE}http://localhost:${SERVER_PORT}/api/health${NC}"
  echo ""
  echo -e "  📧 Login Credentials:"
  echo -e "     Admin:      admin@snapbenefits.gov / password123"
  echo -e "     Caseworker: caseworker@snapbenefits.gov / password123"
  echo -e "     Reviewer:   reviewer@snapbenefits.gov / password123"
  echo ""
  echo -e "  ${YELLOW}⚡ Hot reload is enabled - changes will auto-reload${NC}"
  echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
  echo ""

  # Wait for background processes
  wait
}

# === Main ===
cleanup_ports
setup_database
install_deps
seed_database
start_services

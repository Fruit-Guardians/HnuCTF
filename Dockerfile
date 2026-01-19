FROM node:22-alpine AS frontend-builder

WORKDIR /app/clientapp

# Install git for getting commit hash
RUN apk add --no-cache git

COPY clientapp/package*.json ./
RUN npm ci --only=production

COPY clientapp/ ./
# Remove git dependency
# COPY .git/ .git/

# Generate version.ts with static info
RUN echo "export const A1CTF_VERSION = \"local-dev\"" > version.ts && \
    echo "export const A1CTF_NAME = \"A1CTF Local\"" >> version.ts && \
    echo "export const BUILD_TIME = \"$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")\"" >> version.ts

RUN npm install
RUN npm run build

FROM golang:1.25.3-alpine AS backend-builder

WORKDIR /app

RUN apk add --no-cache git libwebp-dev build-base

COPY go.mod go.sum ./

ENV GOPROXY=https://goproxy.cn,direct
RUN go mod download

COPY src/ ./src/

RUN CGO_ENABLED=1 GOMAXPROCS=0 GOOS=linux go build -ldflags="-s -w" -o app src/main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata libwebp-dev

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

RUN mkdir -p /app/data && \
    mkdir -p /app/clientapp/build/client && \
    chown -R appuser:appgroup /app

COPY --from=frontend-builder /app/clientapp/build/client ./clientapp/build/client
COPY --from=backend-builder /app/app ./
COPY migrations/ ./migrations/
COPY i18n/ ./i18n/

RUN chown -R appuser:appgroup /app && \
    chmod +x /app/app

USER appuser

EXPOSE 7777

CMD ["./app"]

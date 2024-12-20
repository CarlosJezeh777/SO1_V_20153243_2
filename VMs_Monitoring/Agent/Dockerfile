FROM golang:alpine AS build

RUN apk add --no-cache git

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o my-app 

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/my-app ./



EXPOSE 5200

ENTRYPOINT ["./my-app"]
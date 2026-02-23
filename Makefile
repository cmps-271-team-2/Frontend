# Makefile for Next.js project

install:
	npm install

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

dev:
	npm install && npm run dev

clean:
	rm -rf .next node_modules

format:
	npm run format

test:
	npm run test

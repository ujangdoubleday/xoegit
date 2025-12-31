.PHONY: install build global all

all: install build global

install:
	npm install

build:
	npm run build
	chmod +x dist/index.js

global:
	npm link
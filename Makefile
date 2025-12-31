.PHONY: install build global all

all: install build global

install:
	npm install

build:
	npm run build

global:
	npm link
all: $(shell find */src) rollup.config.js package.json
	./node_modules/.bin/rollup -c

deploy:
	for app in banners chainmarket smt features lichess s4a kad predictions predictions2; do ./deploy.sh $$app; done

%/static/bundle.js: $(shell find $*/src) rollup.config.js package.json
	APPNAME=$* ./node_modules/.bin/rollup -c

apps = banners chainmarket smt features lichess s4a kad predictions

all:
	for app in $(apps); do make $$app/static/bundle.js; done

deploy:
	for app in $(apps); do ./deploy.sh $$app; done

%/static/bundle.js: %/src/* rollup.config.js package.json
	APPNAME=$* ./node_modules/.bin/rollup -c

apps = banners chainmarket smt features lichess s4a kad predictions predictions2 auction

all:
	for app in $(apps); do make $$app/static/bundle.js; done

deploy:
	for app in $(apps); do ./deploy.sh $$app; done

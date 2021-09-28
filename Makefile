apps = banners chainmarket smt features lichess s4a kad predictions predictions2

%/static/bundle.js %/static/global.css: %/src/* rollup.config.js package.json components/* common/*
	cp common/global.css $*/static/
	APPNAME=$* ./node_modules/.bin/rollup -c


all:
	for app in $(apps); do echo $$app; make $$app/static/bundle.js; done

deploy:
	for app in $(apps); do echo $$app; ./deploy.sh $$app; done

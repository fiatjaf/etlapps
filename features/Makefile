static/bundle.js: $(shell find src) rollup.config.js package.json
	./node_modules/.bin/rollup -c
	cp ../common/global.css static/global.css

deploy: static/bundle.js
	netlify deploy --prod -d static/

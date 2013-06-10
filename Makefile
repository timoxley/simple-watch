
build: components index.js
	@component build

components: component.json
	@component install --dev

test: components index.js
	@component build --dev

clean:
	rm -fr build components template.js

.PHONY: clean

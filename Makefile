include config.mk

HOMEDIR = $(shell pwd)
rollup = ./node_modules/.bin/rollup
sirv = ./node_modules/.bin/sirv
TSC = node_modules/typescript/bin/tsc
TSN = node_modules/.bin/ts-node

pushall: sync
	git push origin master

deploy:
	make build && git commit -a -m"Build" && make pushall

build:
	$(rollup) -c

run:
	$(rollup) -c -w

map-vat:
	APP=map make run

prettier:
	prettier --single-quote --write "**/*.html"

sync:
	rsync -a $(HOMEDIR)/ $(USER)@$(SERVER):/$(APPDIR) \
    --exclude node_modules/ \
		--exclude .git \
    --omit-dir-times \
    --no-perms

set-up-server-dir:
	ssh $(USER)@$(SERVER) "mkdir -p $(APPDIR)"

gen-map:
	$(TSN) tools/generate-map.ts
	# npx tsc tools/generate-map.ts && \
  #  node tools/generate-map.js

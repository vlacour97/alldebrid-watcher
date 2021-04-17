DOCKER_CLI = docker
DOCKER_RUN = $(DOCKER_CLI) run -v "$(PWD)/app:/app" -v "$(PWD)/var/torrents:/torrents" -v "$(PWD)/var/downloads:/downloads" -e DEBUG_MODE=true -w /app -it node:alpine
VERSION = 'latest'

help:   ## Prints help
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk 'BEGIN {FS = ":.*?## "}; {printf " > \033[36m%-20s\033[0m %s\n", $$1, $$2}'

start: ## Start local instance
	$(DOCKER_RUN) yarn start

add-package: ## Build app (make add-package PACKAGE=request)
	$(DOCKER_RUN) yarn add $(PACKAGE)

lint:  ## Test local instance
	$(DOCKER_RUN) yarn lint

lint-fix:  ## Test local instance
	$(DOCKER_RUN) yarn lint --fix

build:  ## Build app (make build VERSION=1.0.0)
	$(DOCKER_CLI) build --tag='vlacour/alldebrid-watcher:$(VERSION)' app
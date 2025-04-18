DOCKER_CLI = docker
DOCKER_RUN = $(DOCKER_CLI) run -v "$(PWD)/app:/app" -w /app node:alpine
DOCKER_RUN_APP = $(DOCKER_CLI) run -v "$(PWD)/app:/app" -v "$(PWD)/var/torrents:/torrents" -v "$(PWD)/var/downloads:/downloads" -w /app -it debrid
VERSION = 'latest'

help:   ## Prints help
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk 'BEGIN {FS = ":.*?## "}; {printf " > \033[36m%-20s\033[0m %s\n", $$1, $$2}'

start: ## Start local instance
	$(DOCKER_RUN_APP) yarn start

connect: ## Connect to local instance
	$(DOCKER_RUN_APP) sh

add-package: ## Build app (make add-package PACKAGE=request)
	$(DOCKER_RUN) yarn add $(PACKAGE)

install:
	$(DOCKER_RUN) yarn install

lint:  ## Lint application
	$(DOCKER_RUN) yarn lint

lint-fix:  ## Lint and fix application coding style
	$(DOCKER_RUN) yarn lint --fix

test: ##Test application
	$(DOCKER_RUN) yarn test --coverage

test-ci: ##Test application
	$(DOCKER_RUN) yarn test --ci --reporters=default --reporters=jest-junit --coverage

build:  ## Build app (make build VERSION=1.0.0)
	$(DOCKER_CLI) build --tag='vlacour97/alldebrid-watcher:$(VERSION)' app

push: ## Push app (make push VERSION=1.0.0)
	$(DOCKER_CLI) push 'vlacour97/alldebrid-watcher:$(VERSION)'

uname_S := $(shell uname -s)

all: check-env-file build up

build:
	docker-compose down -v
	docker-compose build
	@echo "Application has been built succesfully."

up:
	docker-compose down -v
	docker-compose up -d

cli:
	docker-compose run --rm app bash

logs:
	docker-compose logs -f

logs-app:
	docker-compose logs -f app

create-database:
	./scripts/database-definition.sh

create-database-data:
	./scripts/database-seeder.sh

stage-deploy: stage-create-cert
	docker-compose run --rm -w /usr/src/app app bash -c "yarn deploy stage"

stage-delete:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn delete stage"

stage-create-cert:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn create-cert stage"

stage-delete-cert:
	docker-compose run --rm -w /usr/src/app app bash -c "yarn delete-cert stage"

check-env-file:
	@test -f .env || { echo ".env file does not exists. You can create one starting from env.template"; exit 1; }

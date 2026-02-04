.PHONY: vendors data_dirs cs-fix assets

CURRENT_UID ?= $(shell id -u)

init:
	make vendors
	make assets
	php bin/console doctrine:schema:update --force
	php -d "memory_limit=-1" bin/console doctrine:fixtures:load --no-interaction

vendors: vendor

vendor:
	composer install

assets:
	php bin/console sass:build
	php bin/console importmap:install

assets-watch:
	php bin/console sass:build --watch

assets-prod:
	php bin/console sass:build
	php bin/console asset-map:compile

docker-up: data_dirs
	docker-compose up -d db

data_dirs: docker/data docker/data/composer

docker/data:
	mkdir -p docker/data

docker/data/composer: docker/data
	mkdir -p docker/data/composer

docker-compose.override.yml:
	cp docker-compose.override.yml-dist docker-compose.override.yml

cs-fix:
	docker run --rm -it -w=/app -v ${PWD}:/app oskarstark/php-cs-fixer-ga:latest

deploy: assets-prod
	php bin/console doctrine:migrations:migrate --env=prod --no-interaction

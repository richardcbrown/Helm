#! /bin/bash
docker-compose stop helm-ui 
docker container prune -f
docker image rm helm_helm-ui 
docker-compose up -d helm-ui

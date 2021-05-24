#! /bin/bash
docker-compose stop helm-ui helm 
docker container prune -f
docker image rm helm_helm-ui
#docker image rm helm_helm -f
docker-compose up -d 

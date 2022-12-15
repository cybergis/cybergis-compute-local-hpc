#!/bin/bash
docker compose -f ./local_hpc/docker-compose_local_hpc.yml down -v --remove-orphans
retval=$?
if [ $retval -ne 0 ]; then
    docker-compose -f ./local_hpc/docker-compose_local_hpc.yml down -v --remove-orphans
fi
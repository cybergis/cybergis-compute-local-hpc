#!/bin/bash
docker compose -f ./local_hpc/docker-compose_local_hpc.yml stop
retval=$?
if [ $retval -ne 0 ]; then
    docker-compose -f ./local_hpc/docker-compose_local_hpc.yml stop
fi
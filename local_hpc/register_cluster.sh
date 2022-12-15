#!/bin/bash
set -e

docker exec slurmctld bash -c "/usr/bin/sacctmgr --immediate add cluster name=linux" && \
docker-compose -f ./local_hpc/docker-compose_local_hpc.yml restart slurmdbd slurmctld

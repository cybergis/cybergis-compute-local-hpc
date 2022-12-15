#!/bin/bash
echo "Stopping existing docker containers"
# try with "docker compose" syntax
docker compose -f ./local_hpc/docker-compose_local_hpc.yml stop
# if that messes up, try "docker-compose" syntax
retval=$?
if [ $retval -ne 0 ]; then
    docker-compose -f ./local_hpc/docker-compose_local_hpc.yml stop
fi

print_usage() {
  echo "-l [OPENCONNECT_URL] -u [OPENCONNECT_USER] -p [OPENCONNECT_PASSWORD] -g [OPENCONNECT_AUTHGROUP]"
}

while getopts 'u:p:g:l:hb' flag; do
  case "${flag}" in
    u) export OPENCONNECT_USER="${OPTARG}" ;;
    p) export OPENCONNECT_PASSWORD="${OPTARG}" ;;
    g) export OPENCONNECT_AUTHGROUP="${OPTARG}" ;;
    l) export OPENCONNECT_URL="${OPTARG}" ;;
    b) export RUN_IN_BACKGROUND="true";;
    h) print_usage
       exit 1 ;;
  esac
done

# make the jobdir
mkdir -p ./jobdir

echo "Running local hpc"
if [[ ! -z "${RUN_IN_BACKGROUND}" ]]; then
  docker compose -f ./local_hpc/docker-compose_local_hpc.yml up -d --remove-orphans
  # if that messes up, try "docker-compose" syntax
  retval=$?
  if [ $retval -ne 0 ]; then
    docker-compose -f ./local_hpc/docker-compose_local_hpc.yml up -d --remove-orphans
  fi
else
  docker compose -f ./local_hpc/docker-compose_local_hpc.yml up --remove-orphans
  # if that messes up, try "docker-compose" syntax
  retval=$?
  if [ $retval -ne 0 ]; then
    docker-compose -f ./local_hpc/docker-compose_local_hpc.yml up --remove-orphans
  fi
fi


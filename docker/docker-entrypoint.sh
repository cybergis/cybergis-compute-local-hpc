#!/usr/bin/dumb-init /bin/sh
set -e

if [ "$1" = "slurmdbd" ]
then
    echo "---> Starting the MUNGE Authentication service (munged) ..."
    gosu munge /usr/sbin/munged

    echo "---> Starting the Slurm Database Daemon (slurmdbd) ..."

    {
        . /etc/slurm/slurmdbd.conf
        until echo "SELECT 1" | mysql -h $StorageHost -u$StorageUser -p$StoragePass 2>&1 > /dev/null
        do
            echo "-- Waiting for database to become active ..."
            sleep 2
        done
    }
    echo "-- Database is now active ..."

    exec gosu slurm /usr/sbin/slurmdbd -Dvvv
fi

if [ "$1" = "slurmctld" ]
then
    echo "---> Starting the MUNGE Authentication service (munged) ..."
    gosu munge /usr/sbin/munged

    echo "---> Waiting for slurmdbd to become active before starting slurmctld ..."

    until 2>/dev/null >/dev/tcp/slurmdbd/6819
    do
        echo "-- slurmdbd is not available.  Sleeping ..."
        sleep 2
    done
    echo "-- slurmdbd is now active ..."

    echo "---> Starting the Slurm Controller Daemon (slurmctld) ..."
    exec gosu slurm /usr/sbin/slurmctld -Dvvv
fi

if [ "$1" = "slurmd" ]
then
    echo "---> Starting the MUNGE Authentication service (munged) ..."
    gosu munge /usr/sbin/munged

    echo "---> Waiting for slurmctld to become active before starting slurmd..."

    until 2>/dev/null >/dev/tcp/slurmctld/6817
    do
        echo "-- slurmctld is not available.  Sleeping ..."
        sleep 2
    done
    echo "-- slurmctld is now active ..."

    echo "---> Starting the Slurm Node Daemon (slurmd) ..."
    exec /usr/sbin/slurmd -Dvvv
fi

exec "$@"

# openconnect
if [[ ! -z "${OPENCONNECT_USER}" ]]; then
  if [[ -z "${OPENCONNECT_PASSWORD}" ]]; then
    # Ask for password
    openconnect -b -u $OPENCONNECT_USER --protocol=anyconnect --authgroup $OPENCONNECT_AUTHGROUP $OPENCONNECT_URL
  elif [[ ! -z "${OPENCONNECT_PASSWORD}" ]] && [[ ! -z "${OPENCONNECT_MFA_CODE}" ]]; then
    # Multi factor authentication (MFA)
    (echo $OPENCONNECT_PASSWORD; echo $OPENCONNECT_MFA_CODE) | openconnect -b -u $OPENCONNECT_USER  --protocol=anyconnect --authgroup $OPENCONNECT_AUTHGROUP --passwd-on-stdin $OPENCONNECT_URL
  elif [[ ! -z "${OPENCONNECT_PASSWORD}" ]]; then
    # Standard authentication
    echo $OPENCONNECT_PASSWORD | openconnect -b -u $OPENCONNECT_USER --protocol=anyconnect --authgroup $OPENCONNECT_AUTHGROUP --passwd-on-stdin $OPENCONNECT_URL
  fi
fi

# install necessary packages
npm install -g typescript
cd /job_supervisor && npm install

# compile TypeScript
cd /job_supervisor && npm run build

# set SSH config
cat >> /etc/ssh_config <<EOT
Host *
    StrictHostKeyChecking no
EOT

# run server
redis-server /job_supervisor/docker/redis.conf --daemonize yes
node /job_supervisor/production/server.js
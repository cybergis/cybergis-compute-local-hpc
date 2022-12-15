#!/bin/bash
# adding key to the slurmctld
docker exec slurmctld mkdir -p /home/user/.ssh/
docker cp cybergis-compute-core/keys/id_rsa.pub slurmctld:/home/user/.ssh/authorized_keys
docker exec slurmctld chmod 755 -R /home/user/
docker exec slurmctld chmod 600 /home/user/.ssh/authorized_keys
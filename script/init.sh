#!/bin/bash
echo "setup iptables..."
if command -v iptables &> /dev/null
then
    # delete
    iptables -D INPUT -i eth0 -p tcp -m tcp --dport 443 -j ACCEPT
    iptables -D INPUT -p tcp -m tcp --dport 443 -j ACCEPT
    iptables -D INPUT -i eth0 -p tcp -m tcp --dport 22 -j ACCEPT
    iptables -D INPUT -p tcp -m tcp --dport 22 -j ACCEPT
    iptables -D INPUT -i eth0 -p tcp -m tcp --dport 3030 -j ACCEPT
    iptables -D INPUT -p tcp -m tcp --dport 3030 -j ACCEPT

    # add
    iptables -A INPUT -i eth0 -p tcp -m tcp --dport 443 -j ACCEPT
    iptables -A INPUT -p tcp -m tcp --dport 443 -j ACCEPT
    iptables -A INPUT -i eth0 -p tcp -m tcp --dport 22 -j ACCEPT
    iptables -A INPUT -p tcp -m tcp --dport 22 -j ACCEPT
    iptables -A INPUT -i eth0 -p tcp -m tcp --dport 3030 -j ACCEPT
    iptables -A INPUT -p tcp -m tcp --dport 3030 -j ACCEPT
fi

echo "copying config files..."
cp ./configs/config.example.json ./cybergis-compute-core/config.json
cp ./configs/hpc.example.json ./cybergis-compute-core/configs/hpc.json
cp ./configs/maintainer.example.json ./cybergis-compute-core/configs/maintainer.json
cp ./configs/jupyter-globus-map.example.json ./cybergis-compute-core/configs/jupyter-globus-map.json
cp ./configs/container.example.json ./cybergis-compute-core/configs/container.json

echo "Setting up the keys..."
mkdir -p ./cybergis-compute-core/keys
ssh-keygen -t rsa -f ./cybergis-compute-core/keys/id_rsa -q -N ""
chmod -R 777 ./cybergis-compute-core/keys
mkdir -p ./local_hpc/ssh/
cat ./cybergis-compute-core/keys/id_rsa.pub >> ./local_hpc/ssh/authorized_keys
mkdir -p cybergis-compute-core/local_hpc
cp -r local_hpc cybergis-compute-core
mkdir -p cybergis-compute-core/examples
cp -r examples cybergis-compute-core

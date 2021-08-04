# How to launch and dev

docker run --rm -it -p 1880:1880 -v node_red_data:/data -v <workspace>/git:/git --name mynodered nodered/node-red

data will be stored in node_red_data volume
and pointing to your git will let you design your plugin

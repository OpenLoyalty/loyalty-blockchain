#!/bin/bash

echo "stopping Loyalty Blockchain API containers"
docker-compose down -v
cd scripts/fablo
./fablo.sh prune
rm -rf fablo-target
cd ../..
echo "Cleanup complete"

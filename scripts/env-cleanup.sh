#!/bin/bash

echo "stopping Loyalty Blockchain API containers"
docker-compose down -v
cd scripts/fablo
./fablo.sh prune
cd ../..
echo "Cleanup complete"

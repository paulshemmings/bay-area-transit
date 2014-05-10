#!/usr/bin/env bash

# client side tests - jasmine / karma / phantomJS
# http://karma-runner.github.io/0.10/index.html
# http://jasmine.github.io/


echo "running all client side tests"
./../node_modules/karma/bin/karma start karma.client.config.js
echo ""

# server side tests - https://github.com/mhevery/jasmine-node
# time "<path to command>" did not work so just call directly :(

echo "running all server side tests"
./../node_modules/jasmine-node/bin/jasmine-node ./../test/server/
echo ""
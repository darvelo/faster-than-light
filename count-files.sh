#!/bin/bash

find . -type f -name \*.js | grep -v -E "components|mocha|node_modules|dist|vendor|browser/lib|app/templates"
find . -type f -name \*.js | grep -v -E "components|mocha|node_modules|dist|vendor|browser/lib|app/templates" | wc -l

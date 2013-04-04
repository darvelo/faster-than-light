#!/bin/bash

# This script exists because if run manually, it gives more information
# on what in your tests is failing.

# Testem will run this script with the "tap" argument and not have as much detail,
# but the output will be normalized for the testem interface for readability.
# Note that using the tap interface will null out console.log calls, so when
# using testem with tap, use console.error to get feedback from your app inside
# the testem interface.

# test files are named test.js and not in a few excluded directories
#find $PWD -path $PWD/node_modules -prune -o -path $PWD/app -prune -o -path $PWD/livecd-installer -prune -o -path $PWD/test -prune -o -name test.js -print0 | grep -e "test\.js$" -Z -z | xargs -0 ls -l

if [[ $1 == "tap" ]]; then
  find $PWD -path $PWD/node_modules -prune -o -path $PWD/app -prune -o -path $PWD/livecd-installer -prune -o -path $PWD/test -prune -o -name test.js -print0 | grep -e "test\.js$" -Z -z | xargs -0 ./node_modules/mocha/bin/mocha -R tap
else
  find $PWD -path $PWD/node_modules -prune -o -path $PWD/app -prune -o -path $PWD/livecd-installer -prune -o -path $PWD/test -prune -o -name test.js -print0 | grep -e "test\.js$" -Z -z | xargs -0 ./node_modules/mocha/bin/mocha -R tap
fi

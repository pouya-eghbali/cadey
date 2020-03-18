#!/bin/sh

echo "module.exports = \`$(tr "\`" "\\\`" < cadey.beef)\`" > cadey.beef.js

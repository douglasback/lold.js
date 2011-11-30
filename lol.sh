#! /bin/bash

SERVER='http://itunes.local'
PORT='8001'
if [ ! -n "$1" ]
then
    echo ""
    echo "lol: play a hilarious sound effect on the stereo"
    echo "Usage: lol list - fetch a list of installed sound effects on lold.js"
    echo "Usage: lol (sfx)"
    exit
fi
if [ "$1" = "list" ]
then
    curl -s $SERVER":"$PORT"/"$1
else
    curl -s -o "/dev/null" $SERVER":"$PORT"/"$1
fi
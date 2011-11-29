#! /bin/bash

SERVER='http://itunes.local'
PORT='8001'
if [ ! -n "$1" ]
then
    echo "lol: play a hilarious sound effect on the stereo"
    echo "Usage: lol (sfx)"
    exit
fi

curl -s -o "/dev/null" $SERVER":"$PORT"/"$1
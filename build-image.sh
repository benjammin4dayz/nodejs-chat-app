#!/bin/bash
meta() {
    cat package.json | grep $1 | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]'
}

author=$(meta author)
name=$(meta name)
version=$(meta version)

image=$author/$name

echo "$0 -> $image:$version"

docker build -t $image:$version .

if [[ $1 == "-l" || $1 == "--latest" ]]; then
    docker tag $image:$version $image:latest
fi

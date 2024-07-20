#!/bin/bash
meta() {
    cat $(dirname "$0")/package.json | grep $1 | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d '[[:space:]]'
}

author=$(meta author)
name=$(meta name)
version=$(meta version)

image=$author/$name

echo "$0 -> $image:$version"

docker build -t $image:$version .

if [ $? -eq 0 ] && [[ $1 == "-p" || $1 == "--push" ]]; then
    docker push $image:$version
    docker tag $image:$version $image:latest
    docker push $image:latest
fi

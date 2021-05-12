#!/bin/bash
ip="localhost"
csvfile="sample-data/Job124.csv"
echo DOING : curl get entities
curl --location --request GET $ip:1026/v2/entities | json_pp
x=1
while [ $x -le 15 ]
do
  echo "Welcome $x times"
  x=$(( $x + 1 ))
	sleep 1
	echo DOING : upload csv
	curl --location --request POST $ip:3000/csv --form file=@$csvfile
	echo DOING : curl get entities only jobid
	curl --location --request GET $ip:1026/v2/entities/urn:ngsi-ld:StitchJob:JobID | json_pp
done


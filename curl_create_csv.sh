#!/bin/bash
ip="localhost"

echo DOING : post csv.entity
curl $ip:1026/v2/entities -s -S -H 'Content-Type: application/json' -d @- < csv.entity

echo DOING : curl get entities
curl --location --request GET $ip:1026/v2/entities | json_pp


#!/bin/bash
ip="localhost"
id="StitchJob"

if [ $# -ne 1 ]
then
 echo "Usage: $0 <csvFile>" 
 exit 1
fi

file=$1

if [ ! -f $file ]
then
 echo "CSV File '$1' does not exist"
 exit 1
fi

cat $file>/tmp/csvfile.tmp
#Read comma separated data from CSV file
x=1
while read line
do
	if [ $x -le 1 ]
	then
		IFS=',' read -r -a names <<< "$line"
		x=$(( $x + 1 ))
	else
		IFS=',' read -r -a values <<< "$line"	
	fi
	
done < /tmp/csvfile.tmp

#Declare new array called Types to get the data type of the entries from the CSV
declare -a types

realvalues=$((${#values[@]}-1))

for i in $(seq 0 $realvalues)

do
	re='^[0-9]+([.][0-9]+)?$'
	if ! [[ ${values[$i]} =~ $re ]] ; then
	types+=("Text")
	else types+=("Number")
	fi
	
done 

#Generate String payload for the curl command below with data from the csv file
for i in $(seq 0 $realvalues)

do
	STR="${names[i]}:{\"type\" : \"${types[i]}\",\"value\" : ${values[i]},\"metadata\": {}},"
	STR2+=" ${STR}"
	
done 
STR2=${STR2%?}

#Send data to Orion Context broker
curl $ip:1026/v2/entities/$id/attrs -s -S -H 'Content-Type: application/json' -X PATCH -d @- <<EOF
  {
  ${STR2}
  }
EOF

exit 0


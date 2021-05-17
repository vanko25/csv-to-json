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

#hardcoded
#only 5 entries in the csv file
curl $ip:1026/v2/entities -s -S -H 'Content-Type: application/json' -d @- <<EOF
  {
      "id" : "StitchJob",
      "type" : "csv_value",
      ${names[0]} : {
         "type" : "Number",
         "value" : ${values[0]},
         "metadata": {
          }
      },
      ${names[1]} : {
         "value" : ${values[1]},
         "type" : "Text",
         "metadata": {
          }
      },
      ${names[2]} : {
         "type" : "Number",
         "value" : ${values[2]},
         "metadata": {
          }
      },
      ${names[3]} : {
         "value" : ${values[3]},
         "type" : "Text",
         "metadata": {
          }
      },
      ${names[4]} : {
         "type" : "Text",
         "value" : ${values[4]},
         "metadata": {
          }
      }
  }
EOF

exit 0


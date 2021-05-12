#!/bin/sh
curl --location --request POST 'http://localhost:1026/v2/subscriptions/' --header 'Content-Type: application/json' --data-raw '{
  "description": "Notify QuantumLeap of all sensor changes",
  "subject": {
    "entities": [
      {
        "idPattern": ".*",
        "type": "https://uri.etsi.org/ngsi-ld/default-context/Value"
      }
    ],
        "condition": { "attrs": [] }
  },
  "notification": {
    "http": {
      "url": "http://192.168.18.152:8668/v2/notify"
    },
        "attrs": [],
    "metadata": ["dateCreated", "dateModified"]
  }
}'

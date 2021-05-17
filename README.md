## Periodically uploading csv data

- start docker-compose (everything is removed and orion is changed):
```
docker-compose up
```
- start the bash script which will POST a single entity with hardcoded data:
```
bash curl_create_csv.sh
```
- monitor behavior in terminal

- PATCH for changing the values from file is to be done soon

## Connection to QuantumLeap

- in terminal cd into cratedb folder and type (the first line is needed to increase the virtual memory):
```
sudo sysctl -w vm.max_map_count=262144
docker-compose -f docker-compose-quantumleap-cratedb.yml up
```
- create subscription (open this file and change the ip address to yours):
```
bash post_subscription_csv.sh
```
- open in the web browser a page: http://localhost:4200
- there should be a table and you can query the table (press the query button)

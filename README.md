## Periodically uploading csv data from source

- create the docker-compose.yml only orion and mongo:
```
version: "3"
services:      
    #Context Broker


    mongo:
        image: mongo:3.4
        command: --nojournal

    ### Proxy for Context Broker ###
    ngsiproxy:
        image: fiware/ngsiproxy:latest
        ports:
            - 3000:3000

    ### Context Broker ###
    orion:
        image: fiware/orion
        depends_on:
            - mongo
            - ngsiproxy
        ports:
            - 1026:1026
        command:
            -dbhost mongo -corsOrigin __ALL -inReqPayloadMaxSize 2097152
```
- start docker-compose with only orion and mongo:
```
docker-compose up
```
- start the bash script which will POST/PATCH a single entity created from the csv file, but with hardcoded data types according to the used data.csv:
```
bash uploadcsv.sh
```
- monitor behavior in terminal while changing the values in your csv file

- createcsv.sh and updatecsv.sh are scripts called by uploadcsv.sh so they need to have executable permisions

- if you want to restart this script you need to shut down orion or comment the line which creates entities because POST can be done only of non existing entities

- creating (POST) and modifying (PATCH) of the entities are done for first 5 entries (columns) in the csv file. You can add more data (columns) by modifying createcsv.sh and updatecsv.sh. 

## Periodically uploading csv data with docker container

- add the following to you docker-compose.yml file with mongo and orion:
```
    csvread:
        restart: always
        image: readcsv:v1
        build:
            dockerfile: Dockerfile
            context: .
        volumes:
            #- path on the host : path inside the container
            - $PWD/app-vol:/app
        environment:
            - FIWAREHOST=orion
        ports: 
            - "39002:39002"
```
- first build your docker image:
```
docker-compose build
```
- then start all docker containers
```
docker-compose up
```
- change the data.csv file inside the app-vol folder and monitor the output in terminal

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

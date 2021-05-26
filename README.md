### Background
The need for this ROSE-AP came from the need to get jobs sent from ERP to a STAR robotic cells database. 
An operator could then choose which job to run on which STAR robotic cell. 

### Solution 
The coming from the ERP would be in a CSV format. Using a CSV reader the data from the file would be published
to the ORION Context Broker as entities. These entities (jobs) would be then pushed to Crate DB and stored in a table. 
Whenever an operator initiates a start on a STAR cell from an HMI would have a table that would pull the jobs from 
Crate DB. The operator would then select a job from the list and press START. This would get the data transferred from 
the Crate DB table into the PLC. 

![ROSE-AP dataflow from ERP to PLC](https://i.ibb.co/L1v669T/ROSE-AP-1.jpg) 

Once the job is completed or stopped a report is generated in the PLC that is sent to the ERP via the Orion Context Broker. 

We are using the OPC-UA IOT agent to capture the data from the PLC tags and make them available as entities on OCB. 
They would then be able to be accessed by the ERP to update the status and quantites of a job into its own database. 

![ROSE-AP dataflow from PLC to ERP](https://i.ibb.co/dDB91Bh/ROSE-AP-2.jpg)

### Install 

## Periodically uploading csv data

- start docker-compose (everything is removed and orion is changed):
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

### Usage
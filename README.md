
```console
./services start
```


Usage

```console
curl --location --request GET localhost:1026/v2/entities | json_pp
curl --location --request POST localhost:3000/csv --form 'file=@"sample-data/Job124.csv"'
```

```console
curl -L -X POST 'localhost:3000/excel' -F 'file=@"sample-data/sensors.xlsx"'
```

Or use the associated Postman file over the sample data.

# Testing
## Periodically uploading csv file

- start docker-compose (first build it, only once with docker-compose build):
```
docker-compose up
```
- Open Job124.csv and change jobid number
- start the bash script which will upload 15 times a csv file every 1 second
```
bash uploadcsv.sh
```
- monitor behavior in terminal when changing the jobid numbers in csv

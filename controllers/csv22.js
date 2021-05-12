const fs = require('fs');
const csv = require('fast-csv');
const Measure = require('../lib/measure');
const debug = require('debug')('server:csv');
const _ = require('underscore');
const Device = require('../lib/Device');
const Status = require('http-status-codes');
const moment = require('moment-timezone');

const qualityCodes = {
    1: 'ΟK',
    2: 'Calculated value',
    4: 'Local value',
    8: 'Constant',
    256: 'Not validated value',
    512: 'Configuration fault',
    1024: 'Out of range',
    65536: 'Initial value',
    131072: 'Device problem',
    262144: 'Sensor problem',
    524288: 'Connection problem',
    1048576: 'Out of scan',
    16711680: 'Other problem'
};

/*
 * Delete the temporary file
 */
function removeCsvFile(path) {
    fs.unlink(path, (err) => {
        if (err) {
            throw err;
        }
    });
}

/*
 * Read the CSV data from the temporary file.
 * This returns an in memory representation of the raw CSV file
 */
function readCsvFile(path) {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(path)
            .pipe(csv.parse({ headers: true }))
            .on('error', (error) => {
                reject(error.message);
            })
            .on('data', (row) => {
                rows.push(row);
            })
            .on('end', () => {
                resolve(rows);
            });
    });
}

/**
 * Retieve the unitCode from the static data saved in a database.
 */
/* async function getDeviceUnitCode(id) {
    let data;
    const queryParams = {
        id: 'urn:ngsi-ld:Tett:' + id
    };
    const query = Device.model.findOne(queryParams);

    try {
        data = await query.lean().exec();
    } catch (err) {
        debug('error: ' + err);
    }
    return data ? data.unitCode : undefined;
} */

/*
 *  Strip the id and an key from the header row.
 */
function parseId(input) {
    const regexId = /^[^\s]+/;
    const regexKey = /[\w]+$/;
    const id = regexId.exec(input)[0];
    const key = regexKey.exec(input)[0];

    //return { input, input };
	return { id, key };
}

/*
 * Manipulate the CSV data to create a series of measures
 * The data has been extracted based on the headers and other
 * static data such as the unitCode.
 */
async function createMeasuresFromCsv(rows) {
    //let timestampCol = 0;
    const headerInfo = [];
    const measures = [];
    const headerRow = rows[-1];
    Object.keys(headerRow).forEach((header, index) => {
        const parsed = parseId(header);
        if (parsed.id) {
                headerInfo.push(parsed);
            }
    });

    return await Promise.all(
        headerInfo.map(async (headerInfo) => {
            if (headerInfo) {
                headerInfo.unitCode = await getDeviceUnitCode(headerInfo.id);
            }
            return headerInfo;
        })
    ).then((headerInfo) => {
        rows.shift();
        rows.forEach((row) => {
            const values = _.values(row);
            const measure = {};
            values.forEach((value, index) => {
                if (headerInfo[index] && value.trim() !== 'na') {
                    const id = headerInfo[index].id;
                    const unitCode = headerInfo[index].unitCode;
                    const key = headerInfo[index].key.toLowerCase();

                    measure[id] = measure[id] || { id, unitCode };
                    measure[id][key] = value;
                    measure[id].timestamp = moment.tz(values[timestampCol], 'Etc/UTC').toISOString();
                }
            });
            measures.push(_.values(measure));
        });
        return measures;
    });
}

/*
 * Take the in memory data and format it as NSGI Entities
 *
 */
/* function createEntitiesFromMeasures(measures) {
    const allEntities = [];
    measures.forEach((measure) => {
        const entitiesAtTimeStamp = [];
        const values = _.values(measure);
        values.forEach((value) => {
            const entity = {
                id: 'urn:ngsi-ld:ERPItem:' + value.id,
                type: 'Device',
                value: {
                    type: 'Property',
                    value: value.value
                }
            };

            // Add metadata if present.
            if (value.unitCode) {
                entity.value.unitCode = value.unitCode;
            }
            if (value.quality) {
                entity.value.quality = {
                    type: 'Property',
                    value: qualityCodes[value.quality]
               };
            }

          //  entitiesAtTimeStamp.push(entity);
        });
        //allEntities.push(entitiesAtTimeStamp);
    });
    return allEntities;
} */

/*
 * Create an array of promises to send data to the context broker.
 * Each insert represents a series of readings at a given timestamp
 */
function createContextRequests(entities) {
    const promises = [];
    entities.forEach((entitiesAtTimeStamp) => {
        promises.push(Measure.sendAsHTTP(entitiesAtTimeStamp));
    });
    return promises;
}

/**
 * Actions when uploading a CSV file. The CSV file holds an array of
 * measurements each at a given timestamp.
 */
const upload = (req, res) => {
    if (req.file === undefined) {
        return res.status(Status.UNSUPPORTED_MEDIA_TYPE).send('Please upload a CSV file!');
    }

    const path = __basedir + '/resources/static/assets/uploads/' + req.file.filename;

    return readCsvFile(path)
        .then((rows) => {
            return createMeasuresFromCsv(rows);
        })
        .then((measures) => {
            removeCsvFile(path);
            return createEntitiesFromMeasures(measures);
        })
        .then((entities) => {
            return createContextRequests(entities);
        })
        .then(async (promises) => {
            return await Promise.allSettled(promises);
        })
        .then((results) => {
            const errors = _.where(results, { status: 'rejected' });
            return errors.length ? res.status(Status.BAD_REQUEST).json(errors) : res.status(Status.NO_CONTENT).send();
        })
        .catch((err) => {
            debug(err.message);
            return res.status(Status.INTERNAL_SERVER_ERROR).send(err.message);
        });
};

module.exports = {
    upload
};

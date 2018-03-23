/*
* AFAIK Rasa_nlu still have no evaluation pipeline, so we manually
* do http queries against the server running on port 500
* https://github.com/RasaHQ/rasa_nlu/issues/248
*/
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const _ = require("lodash");

const STATS = { correct: [], incorrect: [], error: [] };

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
    }
}

const makeRequestsForDataset = async (dataset) => {
    await asyncForEach(dataset, async (item) => {
        const data = { q: item.text };
        const url = "http://localhost:5000/parse";
        const benchmark = { start: process.hrtime(), end: null };
        try {
            const response = await axios.post(url, data);
            benchmark.end = process.hrtime()
            let intentCorrect = false;
            let entitiesCorrect = false;
            if (response.status !== 200) {
                process.stdout.write("E");
                STATS.error.push({ item, response, benchmark });
                return;
            }
            if (item.intent == _.get(response, "data.intent.name", null)) {
                intentCorrect = true;
            }
            const rEntities = _.get(response, "data.entities", [])
            if (intentCorrect && item.entities.length == rEntities.length) {
                if (item.entities.length) {
                    const entityMismatchFound = false;
                    item.entities.forEach(({ start, end, value, entity }) => {
                        if (entityMismatchFound) { return; }
                        const foundEntity = rEntities.find(en => (
                            start == en.start &&
                            end == en.end &&
                            value == en.value &&
                            entity == en.entity
                        ));
                        if (!foundEntity) { entityMismatchFound = true; }
                    });
                    if (!entityMismatchFound) { entitiesCorrect = true; }
                } else if (intentCorrect) {
                    entitiesCorrect = true;
                }
            }
            if (intentCorrect && entitiesCorrect) {
                process.stdout.write(".");
                STATS.correct.push({ item, response: response.data, benchmark });
            } else {
                process.stdout.write("E");
                STATS.incorrect.push({ item, response: response.data, benchmark });
            };
        } catch (e) {
            benchmark.end = process.hrtime();
            process.stdout.write("E");
            STATS.error.push({ item, response: null, benchmark });
        }
    });
};

const start = async () => {
    const files = fs.readdirSync("./dataset/testing");
    const workingDirectory = process.cwd();
    await asyncForEach(files, async (filename) => {
        let fileNameWithoutExt =  filename.split(".");
        const extension = fileNameWithoutExt.pop();
        fileNameWithoutExt = fileNameWithoutExt.join("");
        if (extension !== "json") { return null; }
        const jsonFile = fs.readFileSync("./dataset/testing/" + filename, "utf8");
        let dataset = JSON.parse(jsonFile);
        // if too much test examples, limit to 100
        if (dataset.length > 100) {
            dataset = dataset.slice(0, 100); 
        }
        await makeRequestsForDataset(dataset);
    });
    fs.writeFileSync(`evaluation_results.json`, JSON.stringify(STATS, null, 4));
    process.stdout.write("\n=========================================\n");
    process.stdout.write(JSON.stringify({
        accuracy: `${(STATS.correct.length*100)/(STATS.correct.length + STATS.incorrect.length)}%`,
        correct: STATS.correct.length,
        incorrect: STATS.incorrect.length,
        error: STATS.error.length
    }, null, 4));
    process.stdout.write("\nFull evaluation report at evaluation_results.json");
    process.stdout.write("\n=========================================\n");
};
start();
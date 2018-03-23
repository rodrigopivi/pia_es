const fs = require("fs");
const path = require("path");
const chatito = require("chatito");

function shuffle(array) {
    let counter = array.length;
    while (counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

fs.readdirSync("./intents").forEach(filename => {
    const workingDirectory = process.cwd();
    let fileNameWithoutExt =  filename.split(".");
    const extension = fileNameWithoutExt.pop();
    fileNameWithoutExt = fileNameWithoutExt.join("");
    if (extension !== "chatito") { return null; }
    const chatitoGrammar = fs.readFileSync("./intents/" + filename, "utf8");
    let dataset = shuffle(chatito.datasetFromString(chatitoGrammar));
    // limit the minimumDatasetExamples and some intents may need other number of examples
    const datasetsWithMoreExamples = { "desconocido": 1200, "ponMusica": 1200 };
    const minimumDatasetExamples = 600;
    const isDatasetWithMoreExamples = Object.keys(datasetsWithMoreExamples).indexOf(fileNameWithoutExt) !== -1
    let datasetMinLenght =  isDatasetWithMoreExamples ? datasetsWithMoreExamples[fileNameWithoutExt] : minimumDatasetExamples;
    if (dataset.length < datasetMinLenght) {
        while (dataset.length < datasetMinLenght) {
            dataset = dataset.concat(dataset.slice(0, datasetMinLenght-dataset.length));
        }
        const rasaDataset = JSON.stringify({
            rasa_nlu_data: { regex_features: [], common_examples: dataset }
        }, null, 2);
        fs.writeFileSync(`./dataset/training/${fileNameWithoutExt}_${dataset.length}.json`, rasaDataset);
        return;
    }
    let half = Math.round(dataset.length / 2);
    // if more than 1k, use only 1k for training, if less than 1k, then use 1k for training
    if (half > datasetMinLenght) { half = datasetMinLenght; }
    if (half < datasetMinLenght) { half = datasetMinLenght; }
    const training = dataset.slice(0, half);
    const testing = dataset.slice(half);
    const rasaTrainingDataset = JSON.stringify({
        rasa_nlu_data: { regex_features: [], common_examples: training }
    }, null, 2);
    const rasaTestingDataset = JSON.stringify(testing, null, 2);
    fs.writeFileSync(`./dataset/training/${fileNameWithoutExt}_${training.length}.json`, rasaTrainingDataset);
    fs.writeFileSync(`./dataset/testing/${fileNameWithoutExt}_${testing.length}.json`, rasaTestingDataset);
});

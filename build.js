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
    // if too frew generated examples, just use the entire dataset corpus for training
    if (dataset.length < 50) {
        const rasaDataset = JSON.stringify({
            rasa_nlu_data: { regex_features: [], common_examples: dataset }
        }, null, 2);
        fs.writeFileSync(`./dataset/training/${fileNameWithoutExt}_${dataset.length}.json`, rasaDataset);
        return;
    }
    let half = Math.round(dataset.length / 2);
    // NOTE: Limit the training dataset to max 2k examples per intent
    if (half > 2000) { half = 2000; }
    const training = dataset.slice(0, half);
    const testing = dataset.slice(half);
    const rasaTrainingDataset = JSON.stringify({
        rasa_nlu_data: { regex_features: [], common_examples: training }
    }, null, 2);
    const rasaTestingDataset = JSON.stringify(testing, null, 2);
    fs.writeFileSync(`./dataset/training/${fileNameWithoutExt}_${training.length}.json`, rasaTrainingDataset);
    fs.writeFileSync(`./dataset/testing/${fileNameWithoutExt}_${testing.length}.json`, rasaTestingDataset);
});

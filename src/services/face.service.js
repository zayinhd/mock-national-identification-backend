const faceapi = require("face-api.js");
const canvas = require("canvas");
const path = require("path");

const { Canvas, Image, ImageData, loadImage } = canvas;

faceapi.env.monkeyPatch({
    Canvas,
    Image,
    ImageData,
});

async function loadModels() {
    const modelPath = path.join(__dirname, "../../models");

    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);

    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);

    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
}

async function generateDescriptor(imagePath) {
    const img = await loadImage(imagePath);

    const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

    if (!detection) {
        throw new Error("No face detected");
    }

    return Array.from(detection.descriptor);
}

function compareDescriptors(descriptor1, descriptor2) {
    let sum = 0;

    for (let i = 0; i < descriptor1.length; i++) {
        sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }

    const distance = Math.sqrt(sum);

    return distance;
}

module.exports = {
    loadModels,
    generateDescriptor,
    compareDescriptors,
};

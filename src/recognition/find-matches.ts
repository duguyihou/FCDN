import canvas from 'canvas';
import * as faceapi from 'face-api.js';
import DrawBox from 'face-api.js'
import path from 'path';
import { getUsersImagesData } from '../images/services';
import { getUserId } from '../auth/services';

const { Canvas, Image, ImageData } = canvas as any;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.85 });
const weightsPath = path.join(__dirname, 'weights');

let configured = false;

async function configure() {
  if (configured) {
    return;
  }

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(weightsPath),
    faceapi.nets.faceLandmark68Net.loadFromDisk(weightsPath),
    faceapi.nets.faceRecognitionNet.loadFromDisk(weightsPath)
  ]);

  configured = true;
}

async function loadFaceDescriptorsFromFile(imagePath: string) {
  await configure();
  const image = await canvas.loadImage(imagePath) as any;

  return faceapi
    .detectAllFaces(image, faceDetectionOptions)
    .withFaceLandmarks()
    .withFaceDescriptors();
}

export async function findMatches(knownFacesPaths: string[], unknownFacePath: string, ctx: any) {
  const unknownDescriptors = await loadFaceDescriptorsFromFile(unknownFacePath);
  const images = getUsersImagesData(getUserId(ctx));

  if (unknownDescriptors.length === 0) {
    return [];
  }

  let image = await canvas.loadImage(unknownFacePath) as any;
  const resizedDetection = faceapi.resizeResults(unknownDescriptors, { width: image.width, height: image.height })
  let canvasBoxes = faceapi.createCanvasFromMedia(image);
  canvasBoxes.getContext('2d');
  
  var names = []
  var known = []
  var j = 0;

  const facesMatchers = unknownDescriptors.map(descriptor => new faceapi.FaceMatcher(descriptor.descriptor));
  const matchesIndices = new Array<number>();

  for (const [index, knownFacePath] of knownFacesPaths.entries()) {
    const knownDescriptors = await loadFaceDescriptorsFromFile(knownFacePath);
    if (knownDescriptors.length === 0) {
      continue;
    }


    for (const [i, faceMatcher] of facesMatchers.entries()) {

      const numberfound = names.length
      const bestMatch = faceMatcher.findBestMatch(knownDescriptors[0].descriptor);
      j++

      if (bestMatch.label !== 'unknown') {
        names.push(images[index].imageName)
        known.push(i)
        const box = resizedDetection[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: images[index].imageName})
        drawBox.draw(canvasBoxes)
      }

      if (j > ((facesMatchers.length * knownFacesPaths.length) - (facesMatchers.length * 2)) && !known.includes(i)) {

        const box = resizedDetection[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: "Unknown"})
        drawBox.draw(canvasBoxes)

        console.log(i)

      }
    }
  }

  let imageurl = canvasBoxes.toDataURL('image/png')

  var imageWithBoxes = new Image();

  imageWithBoxes.src = imageurl;

  return {
    names: names,
    image: imageWithBoxes
  }
}

export async function faceDetection() {
  
}
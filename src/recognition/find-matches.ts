import canvas from 'canvas';
import * as faceapi from 'face-api.js';
import DrawBox from 'face-api.js'
import path from 'path';
import { getUsersImagesData } from '../images/services';

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

export async function findMatches(knownFacesPaths: string[], unknownFacePath: string) {
  const unknownDescriptors = await loadFaceDescriptorsFromFile(unknownFacePath);

  if (unknownDescriptors.length === 0) {
    return [];
  }

  const facesMatchers = unknownDescriptors.map(descriptor => new faceapi.FaceMatcher(descriptor.descriptor));

  const matchesIndices = new Array<number>();

  for (const [index, knownFacePath] of knownFacesPaths.entries()) {
    const knownDescriptors = await loadFaceDescriptorsFromFile(knownFacePath);
    if (knownDescriptors.length === 0) {
      continue;
    }
    for (const faceMatcher of facesMatchers) {
      const bestMatch = faceMatcher.findBestMatch(knownDescriptors[0].descriptor);
      if (bestMatch.label !== 'unknown') {
        matchesIndices.push(index)
      }
    }
  }

  return matchesIndices;
}

export async function displayDetectionBoxes(knownFacesPaths: string[], unknownFacePath: string, matchingNames: string[]) {
  const unknownDescriptors = await loadFaceDescriptorsFromFile(unknownFacePath);

  if (unknownDescriptors.length === 0) {
    return [];
  }

  let image = await canvas.loadImage(unknownFacePath) as any;
  const resizedDetection = faceapi.resizeResults(unknownDescriptors, { width: image.width, height: image.height })

  let canvasBoxes = faceapi.createCanvasFromMedia(image);


  canvasBoxes.getContext('2d');

  const facesMatchers = unknownDescriptors.map(descriptor => new faceapi.FaceMatcher(descriptor.descriptor));

  for (const [index, knownFacePath] of knownFacesPaths.entries()) {
    const knownDescriptors = await loadFaceDescriptorsFromFile(knownFacePath);
    if (knownDescriptors.length === 0) {
      continue;
    }
    for (const faceMatcher of facesMatchers) {
      const bestMatch = faceMatcher.findBestMatch(knownDescriptors[0].descriptor);
        
        facesMatchers.forEach((result, i) => {

          var labelResult

          if (matchingNames[i] == null) {

            labelResult = "Unknown"
          }

          else {

            labelResult = matchingNames[i]
          }

          const box = resizedDetection[i].detection.box
          const drawBox = new faceapi.draw.DrawBox(box, { label: labelResult })
          drawBox.draw(canvasBoxes)
        })
        
        let imageurl = canvasBoxes.toDataURL('image/png')

        var imageWithBoxes = new Image();

        imageWithBoxes.src = imageurl;

        return imageWithBoxes;
    }
  }

}

export async function faceDetection() {
  
}
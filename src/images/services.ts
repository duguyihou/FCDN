import fs from 'fs';
import path from 'path';

export function getUserUploadsDirectory(userId: string) {
  const userDirectory = path.join(__dirname, 'uploads', userId);
  fs.mkdirSync(userDirectory, { recursive: true });

  return userDirectory;
}

export function getImagePath(userId: string, imageName: string) {
  return path.join(getUserUploadsDirectory(userId), imageName);
}

export function getImageUrl(imageName: string) {
  return `/images/${imageName}`;
}

export function getUsersImagesNames(userId: string) {
  return fs.readdirSync(getUserUploadsDirectory(userId));
}

export function saveImage(userId: string, name: string, imageBuffer: Buffer) {
  fs.writeFileSync(getImagePath(userId, name), imageBuffer);
}

export function getUsersImagesData(userId: string) {
  return getUsersImagesNames(userId).map(imageName => ({
    imageName: imageName,
    url: getImageUrl(imageName),
    path: getImagePath(userId, imageName),
  }))
}

export function deleteImage(userId, imageName) {
  fs.unlinkSync(getImagePath(userId, imageName));
}
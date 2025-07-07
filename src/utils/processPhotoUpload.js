import { getEnvVar } from './getEnvVar.js';
import { saveFileToCloudinary } from './saveFileToCloudinary.js';
import { saveFileToUploadDir } from './saveFileToUploadDir.js';

export const processPhotoUpload = async (file) => {
  if (!file) return null;

  if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
    return await saveFileToCloudinary(file);
  }

  return await saveFileToUploadDir(file);
};

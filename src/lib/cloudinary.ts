const CLOUDINARY_CLOUD_NAME = 'ktb87j8i';
const CLOUDINARY_UPLOAD_PRESET = 'kcf-homepage';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: 'image' | 'video' | 'raw';
  format?: string;
  bytes?: number;
}

/**
 * Uploads a file (image, video, or document) directly to Cloudinary using unsigned upload preset.
 */
export async function uploadToCloudinary(
  file: File,
  targetFolder: string = 'media'
): Promise<CloudinaryUploadResult> {
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');
  const endpointType = isVideo ? 'video' : isImage ? 'image' : 'auto';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `kcf-homepage/${targetFolder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${endpointType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary 업로드 실패 (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.secure_url) {
    throw new Error('Cloudinary 업로드 성공 후 secure_url 응답이 없습니다.');
  }

  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    resource_type: data.resource_type || (isVideo ? 'video' : 'image'),
    format: data.format,
    bytes: data.bytes,
  };
}

/**
 * Deletes a resource from Cloudinary via server API proxy or client request.
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<boolean> {
  if (!publicId) return true;
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId, resource_type: resourceType }),
    });
    return response.ok;
  } catch (err) {
    console.warn('Cloudinary delete request warning:', err);
    return false;
  }
}

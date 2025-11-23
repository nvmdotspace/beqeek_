import { apiClient } from '@/shared/api/http-client';

interface TempFilesUploadResponse {
  httpCode: number;
  status: string;
  data: {
    paths: string[];
  };
}

/**
 * Upload files to temporary storage
 * Files are automatically cleaned up after a period of time
 *
 * @param files - Array of files to upload
 * @returns Array of temporary file paths
 */
export const uploadTempFiles = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('data[files][]', file);
  });

  const response = await apiClient.post<TempFilesUploadResponse>('/api/file/post/temp-files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data.paths;
};

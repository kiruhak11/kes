import { ref } from "vue";

export interface UseFileStorageOptions {
  clearOldFiles?: boolean;
}

export function useFileStorage(options: UseFileStorageOptions = {}) {
  const files = ref<File[]>([]);

  const handleFileInput = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const selectedFiles = Array.from(input.files);
    if (options.clearOldFiles) {
      files.value = selectedFiles;
    } else {
      files.value.push(...selectedFiles);
    }
  };

  const uploadFiles = async (uploadFiles: File[]): Promise<string[]> => {
    try {
      const uploadPromises = uploadFiles.map(async (file) => {
        const response = await $fetch("/api/files", {
          method: "POST",
          body: {
            files: [
              {
                name: file.name,
                type: file.type,
                size: file.size,
                content: await fileToDataUrl(file),
              },
            ],
          },
        });

        if (!response.success || !response.files?.[0]?.path) {
          throw new Error("Failed to upload file");
        }

        // Возвращаем путь в правильном формате
        return response.files[0].path;
      });

      return (await Promise.all(uploadPromises)).filter(
        (p): p is string => typeof p === "string"
      );
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  };

  const uploadSingleFile = async (file: File): Promise<string> => {
    try {
      const paths = await uploadFiles([file]);
      if (paths.length === 0) {
        throw new Error("Failed to upload file");
      }
      return paths[0];
    } catch (error) {
      console.error("Error uploading single file:", error);
      throw error;
    }
  };

  const deleteFile = async (fileName: string): Promise<void> => {
    try {
      const response = await $fetch("/api/files", {
        method: "DELETE",
        query: { fileName },
      });

      if (!response.success) {
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  const getFiles = async (): Promise<Array<{ name: string; path: string }>> => {
    try {
      const response = await $fetch("/api/files", {
        method: "GET",
      });

      if (!response.success) {
        throw new Error("Failed to get files");
      }

      return response.files.map((file) => ({
        name: file.name || "unknown",
        path: file.path,
      }));
    } catch (error) {
      console.error("Error getting files:", error);
      throw error;
    }
  };

  // Вспомогательная функция для конвертации File в data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return {
    files,
    handleFileInput,
    uploadFiles,
    uploadSingleFile,
    deleteFile,
    getFiles,
  };
}

import fs from 'fs/promises';

class FileOperationError extends Error {
  constructor(operation: string, filename: string, originalError: Error) {
    super(`Error ${operation} file ${filename}: ${originalError.message}`);
    this.name = 'FileOperationError';
  }
}

export async function readFile(filename: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
  try {
    const content = await fs.readFile(filename, { encoding });
    return content;
  } catch (error) {
    throw new FileOperationError('reading', filename, error as Error);
  }
}

export async function writeFile(filename: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
  try {
    await fs.writeFile(filename, data, { encoding });
    console.log(`File ${filename} has been written successfully`);
  } catch (error) {
    throw new FileOperationError('writing to', filename, error as Error);
  }
}

export async function appendFile(filename: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
  try {
    await fs.appendFile(filename, data, { encoding });
    console.log(`Data appended to ${filename} successfully`);
  } catch (error) {
    throw new FileOperationError('appending to', filename, error as Error);
  }
}

export async function deleteFile(filename: string): Promise<void> {
  try {
    await fs.unlink(filename);
    console.log(`File ${filename} has been deleted successfully`);
  } catch (error) {
    throw new FileOperationError('deleting', filename, error as Error);
  }
}
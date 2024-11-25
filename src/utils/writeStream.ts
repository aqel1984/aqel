import fs from 'fs';

export const writeToFile = (filename: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filename, { encoding });
    
    writeStream.write(content);
    writeStream.end();

    writeStream.on('finish', () => {
      console.log(`Write to ${filename} completed.`);
      resolve();
    });

    writeStream.on('error', (error) => {
      console.error(`Error writing to ${filename}:`, error);
      reject(error);
    });
  });
};

export const readFromFile = (filename: string, encoding: BufferEncoding = 'utf8'): Promise<string> => {
  return new Promise((resolve, reject) => {
    let content = '';
    const readStream = fs.createReadStream(filename, { encoding });

    readStream.on('data', (chunk) => {
      content += chunk;
    });

    readStream.on('end', () => {
      console.log(`Read from ${filename} completed.`);
      resolve(content);
    });

    readStream.on('error', (error) => {
      console.error(`Error reading from ${filename}:`, error);
      reject(error);
    });
  });
};

// Example usage
export const main = async (): Promise<void> => {
  try {
    await writeToFile('example.txt', 'Hello, world!');
    console.log('File write operation successful.');

    const content = await readFromFile('example.txt');
    console.log('File content:', content);
  } catch (error) {
    console.error('File operation failed:', error);
  }
};
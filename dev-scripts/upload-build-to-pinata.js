import fs from 'node:fs';
import path from 'node:path';

const FOLDER_PATH = './build';

const pinDirectoryToPinata = async () => {
  const formData = new FormData();
  const folderName = path.basename(FOLDER_PATH);

  const files = await fs.promises.readdir(FOLDER_PATH, {
    recursive: true,
    withFileTypes: true,
  });

  console.info(`Found ${files.length} items. Preparing upload...`);
  for (const file of files) {
    if (file.isFile()) {
      const fullPath = path.join(file.parentPath, file.name);
      const relativePath = path.relative(FOLDER_PATH, fullPath);

      // Pinata requires the path to start with the folder name
      // e.g., "build/static/js/main.js"
      const pinataPath = path.join(folderName, relativePath).replace(/\\/g, '/');
      const blob = await fs.openAsBlob(fullPath);
      formData.append('file', blob, pinataPath);
    }
  }

  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: folderName,
    })
  );

  console.info('Uploading to Pinata...');
  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PINATA_JWT}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText} - ${await response.text()}`);
  }

  const result = await response.json();
  console.info('✅ Success!');
  console.info(result);
};

pinDirectoryToPinata().catch(console.error);

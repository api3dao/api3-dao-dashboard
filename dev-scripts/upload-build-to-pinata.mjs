import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FOLDER_PATH = './build';

const uploadBuildToPinata = async () => {
  const currentVersion = parseInt(process.versions.node.split('.')[0], 10);
  if (currentVersion < 24) {
    console.error(`❌ Error: Node.js version 24+ is required. You are running ${process.version}.`);
    process.exit(1);
  }

  if (!fs.existsSync(FOLDER_PATH)) {
    console.error(`❌ Error: Build folder not found at path: "${path.resolve(FOLDER_PATH)}"`);
    console.error('Please run your build command (e.g., "npm run build") before deploying.');
    process.exit(1);
  }

  if (!process.env.PINATA_JWT) {
    console.error('❌ Error: PINATA_JWT environment variable is not set.');
    process.exit(1);
  }

  const files = await fs.promises.readdir(FOLDER_PATH, {
    recursive: true,
    withFileTypes: true,
  });

  console.info(`Found ${files.length} items. Preparing upload...`);
  const formData = new FormData();
  const folderName = path.basename(FOLDER_PATH);
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

  // Use the short commit hash as the upload name (matches the deploy summary in GitHub Actions)
  const commitHash = process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim();
  formData.append(
    'pinataMetadata',
    JSON.stringify({
      name: commitHash.slice(0, 7),
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

  // Expose the CID to later workflow steps when running in GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    await fs.promises.appendFile(process.env.GITHUB_OUTPUT, `cid=${result.IpfsHash}\n`);
  }
};

uploadBuildToPinata().catch((error) => {
  console.error(error);
  process.exit(1);
});

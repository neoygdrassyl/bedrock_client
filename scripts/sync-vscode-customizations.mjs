import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const sourceDir = path.join(repoRoot, 'ai', 'vscode');
const targetRoot = path.join(repoRoot, '.github');

const destinationBySuffix = new Map([
  ['.agent.md', path.join(targetRoot, 'agents')],
  ['.instructions.md', path.join(targetRoot, 'instructions')],
  ['.prompt.md', path.join(targetRoot, 'prompts')],
]);

async function fileExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function getDestinationDirectory(sourcePath) {
  const fileName = path.basename(sourcePath);

  for (const [suffix, destinationDir] of destinationBySuffix.entries()) {
    if (fileName.endsWith(suffix)) {
      return destinationDir;
    }
  }

  return null;
}

async function syncFile(sourcePath) {
  const destinationDir = getDestinationDirectory(sourcePath);

  if (!destinationDir) {
    return null;
  }

  const fileName = path.basename(sourcePath);
  const destinationPath = path.join(destinationDir, fileName);
  const sourceContent = await fs.readFile(sourcePath, 'utf8');
  const destinationExists = await fileExists(destinationPath);
  const destinationContent = destinationExists
    ? await fs.readFile(destinationPath, 'utf8')
    : null;

  if (destinationContent === sourceContent) {
    return { status: 'unchanged', sourcePath, destinationPath };
  }

  await fs.mkdir(destinationDir, { recursive: true });
  await fs.writeFile(destinationPath, sourceContent, 'utf8');

  return {
    status: destinationExists ? 'updated' : 'created',
    sourcePath,
    destinationPath,
  };
}

async function main() {
  if (!(await fileExists(sourceDir))) {
    console.error(`No existe el directorio fuente: ${sourceDir}`);
    process.exitCode = 1;
    return;
  }

  const sourceFiles = await listFiles(sourceDir);
  const syncResults = [];

  for (const sourceFile of sourceFiles) {
    const result = await syncFile(sourceFile);

    if (result) {
      syncResults.push(result);
    }
  }

  if (syncResults.length === 0) {
    console.log('No se encontraron customizaciones sincronizables en ai/vscode.');
    return;
  }

  for (const result of syncResults) {
    console.log(`${result.status.toUpperCase()}: ${path.relative(repoRoot, result.destinationPath)}`);
  }

  const changedCount = syncResults.filter((result) => result.status !== 'unchanged').length;
  console.log(`Sincronizacion completada. ${changedCount} archivo(s) creado(s) o actualizado(s).`);
}

main().catch((error) => {
  console.error('Fallo al sincronizar customizaciones de VS Code.');
  console.error(error);
  process.exitCode = 1;
});
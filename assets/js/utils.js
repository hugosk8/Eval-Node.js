import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootPath = path.resolve(__dirname, '../..');
const dataPath = path.join(rootPath, 'data');
const studentsFilePath = path.join(dataPath, 'students.json');

export async function getStudents() {
    const data = JSON.parse(fs.readFileSync(studentsFilePath, 'utf-8'));
    return data.students;
}

export async function saveStudents(students, callback) {
    await fs.writeFile(studentsFilePath, JSON.stringify({ students }, null, 2), callback);
}
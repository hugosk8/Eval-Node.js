import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pug from 'pug';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import 'dayjs/locale/fr.js'

dotenv.config();
dayjs.extend(customParseFormat);
dayjs.locale('fr');
const port = process.env.APP_PORT;
const host = process.env.APP_HOST;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const viewPath = path.join(__dirname, 'views');
const dataPath = path.join(__dirname, 'data');
const assetsPath = path.join(__dirname, 'assets');

const studentsFilePath = path.join(dataPath, 'students.json');
const students = JSON.parse(fs.readFileSync(studentsFilePath, 'utf-8'));
const formattedBirthStudents = students.students.map(student => ({
    ...student,
    formattedBirth: dayjs(student.birth, "YYYY-DD-MM").format("DD MMMM YYYY")
}));

const server = http.createServer((req, res) => {
    const url = req.url;
    let html;

    switch (url) {
        case "/":
            html = pug.renderFile(path.join(viewPath, 'home.pug'));
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.end(html);
            break;

        case "/studentsList":
            html = pug.renderFile(path.join(viewPath, 'studentsList.pug'), { students: formattedBirthStudents });
            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.end(html);
            break;

        case "/style":
            const style = fs.readFileSync(path.join(assetsPath, 'css', 'style.css'), {encoding: 'utf8'});
            res.writeHead(200, {
                "Content-Type": "text/css"
            });
            return res.end(style);

        case "/deleteStudent":
            const script = fs.readFileSync(path.join(assetsPath, 'js', 'deleteStudent.js'), {encoding: 'utf8'});
            res.writeHead(200, {
                "Content-Type": "text/css"
            });
            return res.end(script);

        case url.startsWith("/studentsList/") && req.method === "DELETE":
            const studentName = url.split("/").pop();
            const remainingStudents = students.students.filter(student => student.name !== studentName);
            fs.writeFileSync(studentsFilePath, JSON.stringify({ students: remainingStudents }, null, 2));
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Student deleted" }));
            break;

        case url === "/addStudent" && req.method === "POST":
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                const params = new URLSearchParams(body);
                const name = params.get('name');
                const birth = params.get('birth');
                const students = await getStudents();
                const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
                students.push({ id: newId, name, birth });
                await saveStudents(students);
                res.writeHead(302, { 'Location': '/' });
                res.end();
            });
            break;

        default:
            res.writeHead(404, {
                "Content-Type": "text/html"
            });
            res.end("page Introuvable");
            break;
    }
});

server.listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`);
});

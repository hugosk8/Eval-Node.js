import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pug from 'pug';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import 'dayjs/locale/fr.js'
import { getStudents, saveStudents } from './assets/js/utils.js';


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

    if (url === "/") {
        const html = pug.renderFile(path.join(viewPath, 'home.pug'));
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end(html);
        return;
    }

    if (url === "/studentsList") {
        const html = pug.renderFile(path.join(viewPath, 'studentsList.pug'), { students: formattedBirthStudents });
        res.writeHead(200, {
            "Content-Type": "text/html"
        });
        res.end(html);
        return;
    }

    if (req.url === "/style") {
        const style = fs.readFileSync(path.join(assetsPath, 'css', 'style.css'), {encoding: 'utf8'});
        res.writeHead(200, {
            "Content-Type": "text/css"
        });
        return res.end(style);
    }

    if (req.url === "/deleteStudent") {
        const script = fs.readFileSync(path.join(assetsPath, 'js', 'deleteStudent.js'), {encoding: 'utf8'});
        res.writeHead(200, {
            "Content-Type": "text/css"
        });
        return res.end(script);
    }

    if (url === "/addStudent" && req.method === "POST") {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const params = new URLSearchParams(body);
            const name = params.get('name');
            const birth = params.get('birth');
            const students = await getStudents();
            students.push({ name, birth });
            await saveStudents(students, (err) => {
                if (err) {
                    res.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    res.end('internal server error');
                    return;
                }
            });
            res.writeHead(302, { 'Location': '/' });
            res.end();
        });
        return;
    }

    if (url.startsWith("/studentsList/") && req.method === "DELETE") {
        const studentName = url.split("/").pop();
        const remainingStudents = students.students.filter(student => student.name !== studentName);
        fs.writeFileSync(studentsFilePath, JSON.stringify({ students: remainingStudents }, null, 2));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Student deleted" }));
        return;
    }

    res.writeHead(404, {
        "Content-Type": "text/html"
    });
    res.end("page Introuvable");
});

server.listen(port, host, () => {
    console.log(`Server listening at http://${host}:${port}`);
});
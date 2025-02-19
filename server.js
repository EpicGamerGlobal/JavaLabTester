import express from 'express';
import session from 'express-session';
import path from 'path';
import {fileURLToPath} from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import problems from './problems.json' with {type: 'json'}; // render throws issue with assert here
/*
import problems from './problems.json' assert {type: 'json'};
                                       ^^^^^^
SyntaxError: Unexpected identifier 'assert'
    at compileSourceTextModule (node:internal/modules/esm/utils:338:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:102:18)
    at #translate (node:internal/modules/esm/loader:437:12)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:484:27)
    at async ModuleJob._link (node:internal/modules/esm/module_job:115:19)
*/

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

const USERS = [{username: 'testuser', password: 'testpassword'}];

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;
    console.log("incoming request==", req.body);
    const user = USERS.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.user = {username};
        res.redirect('/dashboard');
    } else {
        res.status(401).send('<h1>Invalid credentials</h1><a href="/">Try Again</a>');
    }
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/problems', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/problems.html'));
});

app.get('/api/problems', (req, res) => {
    res.json(problems);
});

app.get('/problem/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/problem.html'));
});

app.get('/api/problem/:id', (req, res) => {
    const problemId = parseInt(req.params.id);
    const problem = problems.find(p => p.id === problemId);

    if (!problem) {
        return res.status(404).json({error: 'Problem not found'});
    }

    res.json(problem);
});


app.post('/run', async (req, res) => {
    const {code, problemId} = req.body;

    if (!req.session.user) {
        return res.status(403).json({error: 'Unauthorized'});
    }

    const problem = problems.find(p => p.id === parseInt(problemId));
    if (!problem) {
        return res.status(400).json({error: 'Invalid problem ID'});
    }

    try {

        let correctCount = 0;
        let failedResult = "";
        for (const testCase of problem.testCases) {
            const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: "java",
                    version: "15.0.2",
                    files: [{ name: "Main.java", content: code }],
                    stdin: testCase.input
                })
            });
            const result = await response.json();
            const output = result.run.output.trim();
            if (output === testCase.output.trim()) {
                correctCount++;
            } else {
                failedResult += "Expected: " + testCase.output + "\nGot: " + output + "\n\n";
            }
        }

        if (correctCount === problem.testCases.length) {
            res.json({output: "✅ All test cases passed!"});
        } else {
            res.json({output: `❌ ${problem.testCases.length - correctCount} out of ${problem.testCases.length} test cases failed.\n${failedResult}`});
        }
    } catch (error) {
        console.error('Error executing code:', error);
        res.status(500).json({output: 'Error executing code: ' + error.message});
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

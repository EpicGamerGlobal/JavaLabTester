let hintsUsed = 0;
let startTime;

document.addEventListener('DOMContentLoaded', async () => {
    const problemId = window.location.pathname.split('/').pop();

    try {
        const response = await fetch(`/api/problem/${problemId}`);
        if (!response.ok) throw new Error('Failed to load problem.');

        const problem = await response.json();
        document.getElementById('problem-title').textContent = problem.title;
        document.getElementById('problem-description').textContent = problem.description;

        const testCasesList = document.getElementById('test-cases');
        testCasesList.innerHTML = problem.testCases.map(test => `
            <li><strong>Input:</strong> ${test.input} <br> <strong>Expected Output:</strong> ${test.output}</li>
        `).join('');

        // Store hints and solution
        document.getElementById('hint-button').addEventListener('click', () => {
            if (hintsUsed < problem.hints.length) {
                document.getElementById('hint-text').textContent = problem.hints[hintsUsed];
                hintsUsed++;
            }
            if (hintsUsed === problem.hints.length) {
                document.getElementById('solution-button').style.display = 'block';
            }
        });

        document.getElementById('solution-button').addEventListener('click', () => {
            document.getElementById('solution-text').textContent = problem.solution;
            document.getElementById('solution-text').style.display = 'block';
        });

        setTimeout(() => {
            const editor = ace.edit('editor');
            editor.setTheme('ace/theme/monokai');
            editor.session.setMode('ace/mode/java');
        }, 300);

    } catch (error) {
        console.error('Error fetching problem:', error);
        document.getElementById('problem-description').textContent = 'Error loading problem.';
    }

    document.getElementById('run-button').addEventListener('click', async () => {
        startTime = new Date();
        document.getElementById('compilation-time').textContent = "Compiling...";

        const code = ace.edit('editor').getValue();
        const outputDiv = document.getElementById('output');

        try {
            const response = await fetch('/run', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({code, problemId}),
            });

            const result = await response.json();
            const endTime = new Date();
            const compilationTime = (endTime - startTime) / 1000;
            document.getElementById('compilation-time').textContent = `Compilation Time: ${compilationTime}s`;

            outputDiv.innerHTML = result.output.replace(/\n/g, '<br>').trim();
        } catch (error) {
            console.error('Error:', error);
            outputDiv.textContent = `Error running code: ${error.message}`;
        }
    });
});

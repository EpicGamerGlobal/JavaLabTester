document.addEventListener('DOMContentLoaded', async () => {
    const problemId = window.location.pathname.split('/').pop();

    try {
        const response = await fetch(`/api/problem/${problemId}`);
        if (!response.ok) throw new Error('Failed to load problem.');

        const problem = await response.json();

        // ✅ Ensure problem data loads before updating the page
        document.getElementById('problem-title').textContent = problem.title;
        document.getElementById('problem-description').textContent = problem.description;

        const testCasesList = document.getElementById('test-cases');
        testCasesList.innerHTML = problem.testCases.map(test => `
            <li><strong>Input:</strong> ${test.input} <br> <strong>Expected Output:</strong> ${test.output}</li>
        `).join('');

        // ✅ Initialize Ace Editor only after problem loads
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
        const code = ace.edit('editor').getValue();
        const outputDiv = document.getElementById('output');

        try {
            const response = await fetch('/run', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({code, problemId}),
            });

            const result = await response.json();
            outputDiv.innerHTML = result.output.replace(/\n/g, '<br>').trim();
        } catch (error) {
            console.error('Error:', error);
            outputDiv.textContent = `Error running code: ${error.message}`;
        }
    });
});

//hints and solutions
let hintsUsed = 0;

document.getElementById('hint-button').addEventListener('click', () => {
    if (hintsUsed < 2) {
        document.getElementById('hint-' + hintsUsed).style.display = 'block';
        hintsUsed++;
    }
    if (hintsUsed === 2) {
        document.getElementById('solution-button').style.display = 'block';
    }
});

document.getElementById('solution-button').addEventListener('click', () => {
    document.getElementById('solution').style.display = 'block';
});


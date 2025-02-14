document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('editor')) {
        const editor = ace.edit('editor');
        editor.setTheme('ace/theme/monokai');
        editor.session.setMode('ace/mode/java');

        document.getElementById('run-button').addEventListener('click', async () => {
            const code = editor.getValue();
            await runJavaCode(code);
        });
    }
});

async function runJavaCode(code) {
    const outputDiv = document.getElementById('output');
    outputDiv.textContent = 'Running code...';

    try {
        const response = await fetch('/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({code}),
        });

        if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
        const result = await response.json();

        if (result.output) {
            outputDiv.innerHTML = result.output.replace(/\n/g, '<br>').trim();
        } else {
            outputDiv.textContent = 'No output received from the server.';
        }
    } catch (error) {
        console.error('Error:', error);
        outputDiv.textContent = `Error running code: ${error.message}`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const problemsList = document.getElementById('problems-list');

    try {
        const response = await fetch('/api/problems');
        if (!response.ok) throw new Error('Failed to fetch problems');

        const problems = await response.json();

        problemsList.innerHTML = problems.map(problem => `
            <tr>
                <td>${problem.id}</td>
                <td>${problem.title} <span id="solved-${problem.id}" class="solved-indicator" style="display: none;">✔ Solved</span></td>
                <td><span class="difficulty ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span></td>
                <td><button onclick="window.location.href='/problem/${problem.id}'">Solve</button></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error fetching problems:', error);
        problemsList.innerHTML = `<p>Failed to load problems. Please try again later.</p>`;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const problemsList = document.getElementById('problems-list');

    try {
        const response = await fetch('/api/problems');
        if (!response.ok) throw new Error('Failed to fetch problems');

        const problems = await response.json();

        problemsList.innerHTML = problems.map(problem => `
            <tr>
                <td>${problem.id}</td>
                <td>${problem.title}</td>
                <td><button onclick="window.location.href='/problem/${problem.id}'">Solve</button></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error fetching problems:', error);
        problemsList.innerHTML = `<p>Failed to load problems. Please try again later.</p>`;
    }
});

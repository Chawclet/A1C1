function startMiniGame() {
    const container = document.getElementById('exercise-screen');
    container.innerHTML = `
        <div class="game-container">
            <h3>Quick Vocabulary Quiz</h3>
            <p id="game-question">What is a synonym for 'Abundant'?</p>
            <button onclick="checkGameAnswer('Plentiful')">Plentiful</button>
            <button onclick="checkGameAnswer('Scarce')">Scarce</button>
            <button id="close-game">Back</button>
        </div>
    `;
    document.getElementById('close-game').onclick = () => location.reload();
}

function checkGameAnswer(answer) {
    if (answer === 'Plentiful') {
        alert('Correct!');
    } else {
        alert('Try again!');
    }
}

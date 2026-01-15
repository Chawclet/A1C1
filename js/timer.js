let timerInterval;
let timeLeft = 0;

function startTimer(duration, displayElement, onEnd) {
    clearInterval(timerInterval);
    timeLeft = duration;
    
    updateTimerDisplay(displayElement);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(displayElement);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            if (onEnd) onEnd();
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function updateTimerDisplay(displayElement) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    displayElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Global timer state could be synced via Supabase Realtime in a real app
// For this MVP, we provide the logic to start/stop.

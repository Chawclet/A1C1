let timerInterval;
let timeLeft = 0;

const TimerConfig = {
    ICEBREAKER: 10 * 60,
    READING: 15 * 60,
    LISTENING: 15 * 60,
    BREAK: 10 * 60,
    WRITING_SPEAKING: 40 * 60,
    SPEAKING_INDIVIDUAL: 5 * 60
};

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
    if (!displayElement) return;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    displayElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

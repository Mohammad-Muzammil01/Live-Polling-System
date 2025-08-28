class TimerService {
  constructor() {
    this.timers = new Map();
  }

  startTimer(pollId, duration, onTick, onComplete) {
    // Clear existing timer if any
    this.stopTimer(pollId);

    let timeRemaining = duration;
    
    const timer = setInterval(() => {
      timeRemaining--;
      
      if (onTick) {
        onTick(timeRemaining);
      }
      
      if (timeRemaining <= 0) {
        this.stopTimer(pollId);
        if (onComplete) {
          onComplete();
        }
      }
    }, 1000);

    this.timers.set(pollId, timer);
    
    // Initial call to onTick
    if (onTick) {
      onTick(timeRemaining);
    }
  }

  stopTimer(pollId) {
    const timer = this.timers.get(pollId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(pollId);
    }
  }

  getTimeRemaining(pollId) {
    // This would need to be implemented with actual time tracking
    // For now, return a default value
    return 60;
  }

  clearAllTimers() {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers.clear();
  }
}

export default new TimerService();

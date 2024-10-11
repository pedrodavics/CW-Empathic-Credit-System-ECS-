function getCreditRiskScore(features) {
    const { emotionalState, financialThoughts, income, creditHistoryScore } = features;

    let baseScore = Math.random() * 100;

    // Adjust score based on user features
    if (emotionalState === 'anxious') {
        baseScore -= 10;
    }
    if (financialThoughts === 'neutral') {
        baseScore += 5;
    }
    if (income < 3000) {
        baseScore -= 20;
    }
    if (creditHistoryScore < 600) {
        baseScore -= 30;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(Math.floor(baseScore), 100));
}

module.exports = { getCreditRiskScore };

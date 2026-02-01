
// Mock AI Service for Static Demo
// Simulates intelligent responses without backend dependency

export const getGrowerAdvice = async (query: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const responses = [
      "Based on your setup, I'd recommend checking your VPD levels. Aim for 0.8-1.2 kPa during vegetative stage.",
      "Those yellowing leaves might indicate a nitrogen deficiency. Try increasing your Cal-Mag slightly.",
      "For optimal trichome production, drop the temperature by 10 degrees during the last two weeks of flower.",
      "Ensure your pH runoff is within 5.8-6.2 for hydro. Consistency is key!",
      "Great question! LED spectrums with added UV-B can increase potency, but be careful not to burn the canopy."
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export const generateStrainDescription = async (strainName: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    return `${strainName} is a potent hybrid known for its euphoric high and complex terpene profile. Expect notes of citrus and pine with a heavy hitting relaxation effect perfect for evening use. Flowering time is approximately 8-9 weeks.`;
}

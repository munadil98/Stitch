export interface WordPressThemeFile {
  path: string;
  content: string;
}

export async function generateWordPressTheme(
  designDescription: string, 
  designType: string,
  engine: 'DeepSeek' | 'Gemini' = 'DeepSeek'
): Promise<WordPressThemeFile[]> {
  try {
    const response = await fetch("/api/generate-wordpress-theme", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ designDescription, designType, engine }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Server failed to generate theme");
    }

    const data = await response.json();
    return data.files || [];
    
  } catch (error) {
    console.error("Client Error calling server:", error);
    throw error;
  }
}

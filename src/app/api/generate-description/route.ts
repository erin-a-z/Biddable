import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Note: Using server-side env variable
});

export async function POST(request: Request) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request
    const { imageUrl, title } = await request.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('Processing image URL:', imageUrl);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Generate a detailed markdown description for an auction listing with the title "${title}". 
              Include key features, condition, and any notable details you can see. 
              Format it with appropriate markdown headings, bullet points, and sections.
              Keep it concise but informative.`
            },
            {
              type: "image_url",
              image_url: imageUrl
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    console.log('OpenAI response:', response);

    const description = response.choices[0]?.message?.content;

    if (!description) {
      throw new Error('No description generated');
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error generating description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
} 
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    if (!body.imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('Processing image URL for summary:', body.imageUrl);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a concise one-sentence summary (maximum 100 characters) that captures the key features of this item for a silent auction gallery view. Focus on the most appealing or valuable aspects."
            },
            {
              type: "image_url",
              image_url: {
                url: body.imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: "text" },
      temperature: 0.7,
      max_tokens: 100,
    });

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('No summary generated');
    }

    const summary = response.choices[0].message.content.trim();

    return NextResponse.json({ 
      summary,
      status: 'success'
    });

  } catch (error) {
    console.error('API route error:', error);
    
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({
        error: `OpenAI API Error: ${error.message}`,
        code: error.code,
        type: error.type
      }, { status: error.status || 500 });
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
} 
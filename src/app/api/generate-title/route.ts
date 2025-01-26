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
    const body = await request.json();
    if (!body.imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('Processing image URL:', body.imageUrl);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "From the image generate the title of the post"
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
      response_format: {
        type: "text"
      },
      temperature: 0.7, // Slightly lower for more focused descriptions
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0.2, // Slight increase to encourage more diverse descriptions
      presence_penalty: 0.1
    });

    console.log('OpenAI response:', response);

    if (!response.choices?.[0]?.message?.content) {
      throw new Error('No description generated by OpenAI');
    }

    return NextResponse.json({
      description: response.choices[0].message.content,
      status: 'success'
    });

  } catch (error) {
    console.error('API route error:', error);

    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json({
        error: `OpenAI API Error: ${error.message}`,
        code: error.code,
        type: error.type
      }, { status: error.status || 500 });
    }

    // Handle generic errors
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}
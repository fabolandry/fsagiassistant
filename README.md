# AI Calendar Assistant

This project is an AI assistant that can manage calendar events. It's built using Next.js and Firebase, and uses OpenAI's GPT-4 for generating AI responses.

## Features

- Create, update, and delete calendar events
- Search for events based on partial matches in titles or descriptions
- Query all calendar events for the current user
- Generate AI responses to user inquiries

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The main logic for generating AI responses and managing calendar events is in `src/components/chat/MessageInput.js`. The calendar view and event form are in `src/app/calendar/page.js` and `src/app/calendar/Eventform.js` respectively.

## Environment Variables

You need to set the following environment variable:

- `NEXT_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.

## License

This project is licensed under the MIT License.


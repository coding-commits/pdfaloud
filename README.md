# Focus Buddy

## Overview

Focus Buddy is a web app that helps students with ADHD to focus when reading textbooks. 
It provides an integrated text-to-speech reader that reads aloud textbooks, and highlights the part that is being read, so that student's attention is properly guided, making learning more accessible and engaging. 

The app also features an AI Assistant powered by Groq's API, enabling users to interact with and better comprehend their reading material.

## Features

### Text Reader
- Text-to-speech functionality for textbooks and documents
- PDF document support
- Adjustable reading speed and voice settings
- Progress tracking and bookmarking

### AI Assistant
- Real-time messaging system with AI-powered responses
- Message history with user/assistant differentiation
- Visual loading states during AI processing
- Responsive design for both desktop and mobile views
- Contextual help for better text comprehension

### User Interface
- Clean, modern design
- Two-column layout:
  - Left: Text Reader for document display
  - Right: AI Assistant for interactive help
- Responsive design that adapts to different screen sizes
- Intuitive controls and navigation

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **PDF Processing**: PDF.js (version 3.11.174)
- **AI Integration**: Groq API

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd focus-buddy
```

2. Install dependencies:
```bash
npm install groq lucide-react pdfjs-dist@3.11.174 --legacy-peer-deps
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add:
```
GROQ_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## System Requirements
- Node.js 16.x or higher
- Modern web browser with JavaScript enabled
- Internet connection for AI features

## Usage

1. **Upload Documents**

2. **Text-to-Speech**
   - Click the play button to start reading
   - Adjust speed and voice settings as needed
   - Use keyboard shortcuts for control

3. **AI Assistant**
   - Type questions about the text in the chat interface
   - Get real-time responses and explanations
   - Access reading comprehension help
   - Request summaries or clarifications

## Error Handling

The application includes comprehensive error handling:
- Network error detection and user feedback
- Graceful fallbacks for API failures
- Loading state management
- Input validation and sanitization

## Contributing

We welcome contributions to Focus Buddy! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support, please:
- Open an issue in the GitHub repository
- Check our documentation for common issues

## Acknowledgments

- Groq for providing the AI capabilities
- PDF.js contributors
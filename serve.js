import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import fs from 'fs';

const app = new Hono();

// Serve static files
app.use('/*', serveStatic({ root: './' }));

// Default route - redirect to examples
app.get('/', (c) => {
  return c.redirect('/examples');
});

// examples listing
app.get('/examples', (c) => {
  const examplesDir = './examples';
  const examples = [];
  
  try {
    const files = fs.readdirSync(examplesDir);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        const exampleName = file.replace('.html', '');
        examples.push({
          name: exampleName.charAt(0).toUpperCase() + exampleName.slice(1),
          url: `/examples/${file}`
        });
      }
    });
  } catch (err) {
    console.error('Error reading examples directory:', err);
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Aether Engine Examples</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          background: #222; 
          color: white; 
          padding: 20px;
          text-align: center;
        }
        .game-list { 
          max-width: 600px; 
          margin: 0 auto; 
        }
        .game-item { 
          background: #333; 
          margin: 10px 0; 
          padding: 15px; 
          border-radius: 8px; 
        }
        .game-item a { 
          color: #4CAF50; 
          text-decoration: none; 
          font-size: 18px; 
        }
        .game-item a:hover { 
          color: #66BB6A; 
        }
      </style>
    </head>
    <body>
      <h1>Aether Engine Examples</h1>
      <div class="game-list">
        ${examples.map(example => `
          <div class="game-item">
            <a href="${example.url}">${example.name}</a>
          </div>
        `).join('')}
      </div>
      <p><em>Built with Aether Engine - Geometric Algebra Game Engine</em></p>
    </body>
    </html>
  `;
  
  return c.html(html);
});

const port = process.env.PORT || 3000;

console.log(`Aether Engine Server starting...`);

serve({
  fetch: app.fetch,
  port: port,
}, (info) => {
  console.log(`Server running at: http://localhost:${info.port}`);
});
import { Request } from 'express';

export default function(req: Request) {
  const query = req.query;

  let initialState: StateRoot | null = null;
  if (query && query.state) {
    try {
      initialState = JSON.parse(query.state) as StateRoot;
    } catch (e) {
      console.error(e);
    }
  }

  const scripts = process.env.JS_BUNDLE;
  const styles = process.env.CSS_BUNDLE;
  const publicUrl = '/';

  return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <meta name="theme-color" content="#000000">
          <link rel="manifest" href="${publicUrl}manifest.json">
          <link rel="shortcut icon" href=${publicUrl}favicon.ico">
          <title>Voice Finder</title>
          <script>
            window.__APP_INITIAL_STATE__ = ${JSON.stringify(initialState)}
          </script>
          ${styles}
          <script async src="https://www.googletagmanager.com/gtag/js?id=UA-110452848-1"></script>
          <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-110452848-1');
          </script>

        </head>
        <body>
          <noscript> You need to enable JavaScript to run this app.  </noscript>
          <div id="root"></div>
          ${scripts}
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
        </body>
      </html>
  `;
}

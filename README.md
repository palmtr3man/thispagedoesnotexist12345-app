# thispagedoesnotexist12345-app

This is the canonical production repository for the thispagedoesnotexist12345 project. All development and deployments are managed from this repository.

## Overview

This project serves as the primary deployment source for www.thispagedoesnotexist12345.com and related services.

## Deployment

Deployments are managed through Netlify. Configuration is defined in `netlify.toml`.

## Key Files

- `netlify.toml` - Netlify build and deployment configuration
- - `index.html` - Landing page
  - - `globals.css` - Global styles
    - - `public/` - Static assets
      - - `server/` - Server-side functions
        - - `netlify/functions/` - Netlify serverless functions

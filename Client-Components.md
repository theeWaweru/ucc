# Client Components Guide

This document outlines our approach to using client components in the Uhai Centre Church website.

## What are client components?

In Next.js App Router, components are server components by default. Client components are specifically marked with the `"use client"` directive at the top of the file. Client components:

- Can use client-side React hooks like `useState`, `useEffect`, etc.
- Have event handlers for interactivity (`onClick`, `onChange`, etc.)
- Are shipped to the client's browser and hydrated there

## When to use client components

Use client components when:

1. You need interactivity (event handlers, form submissions)
2. You need browser-only APIs (localStorage, window object)
3. You need to use hooks or context
4. You need client-side state

## When to use server components

Use server components when:

1. You're fetching data directly from the database
2. You're accessing server-side resources
3. You're keeping sensitive information on the server
4. The component doesn't need client-side interactivity

## Our Pattern for Mixed Components

When components need both server-side data fetching and client-side interactivity:

1. Create a client component for the interactive parts
2. Create a server component wrapper that fetches data
3. Pass data from the server component to the client component as props

Example:
```tsx
// SermonCard.tsx (server component)
import ClientSermonCard from './ClientSermonCard';
import { getSermonCache } from '@/lib/data-fetching';

export default async function SermonCard({ id }) {
  const sermon = await getSermonCache(id);
  return <ClientSermonCard sermon={sermon} />;
}

// ClientSermonCard.tsx (client component)
"use client";

import { useState } from 'react';

export default function ClientSermonCard({ sermon }) {
  const [showDescription, setShowDescription] = useState(false);
  
  return (
    <div>
      <h2>{sermon.title}</h2>
      <button onClick={() => setShowDescription(!showDescription)}>
        {showDescription ? 'Hide' : 'Show'} Description
      </button>
      {showDescription && <p>{sermon.description}</p>}
    </div>
  );
}
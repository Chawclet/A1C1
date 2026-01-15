# Supabase Setup Guide

To make this app work, you need to set up the following tables and RLS (Row Level Security) rules in your Supabase project.

## 1. Profiles Table
Stores user roles and levels.
- `id`: uuid (primary key, references auth.users.id)
- `email`: text
- `role`: text (default: 'student')
- `level`: text (e.g., 'A2', 'B1')
- `progress`: jsonb (to store scores)

**RLS Policy:**
- `Profiles are viewable by everyone.`
- `Users can update their own profile.`
- `Teachers can update all profiles.`

## 2. Materials Table
Stores exercises.
- `id`: uuid (primary key)
- `type`: text ('reading', 'listening', 'writing')
- `title`: text
- `content`: jsonb (stores text, questions, options, answers)
- `is_locked`: boolean (default: true)

**RLS Policy:**
- `Materials are viewable by authenticated users if is_locked is false.`
- `Teachers can view and update all materials.`

## 3. Submissions Table
Stores student answers and writing tasks.
- `id`: uuid (primary key)
- `student_id`: uuid (references profiles.id)
- `type`: text
- `content`: jsonb (student's text or answers)
- `feedback`: text (inserted by teacher after ChatGPT evaluation)
- `status`: text (default: 'pending')

**RLS Policy:**
- `Students can insert their own submissions.`
- `Students can view their own submissions.`
- `Teachers can view and update all submissions.`

## Example Material JSON (Reading)
```json
{
  "text": "The Great Barrier Reef is...",
  "questions": [
    { "text": "Where is the reef?", "options": ["Australia", "USA", "Brazil"] }
  ],
  "answers": ["Australia"]
}
```

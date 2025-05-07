CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    photo_url TEXT,
    title TEXT,
    region TEXT,
    skills TEXT[],
    bio TEXT,
    guthi_roles TEXT[],
    diaspora_node BOOLEAN DEFAULT false,
    language TEXT[],
    karma_points INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT now()
);

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory data store for prototype
let users = [
  {
    id: '1',
    name: 'Olivia Vance',
    email: 'olivia.vance@company.com',
    role: 'Admin',
    department: 'Engineering',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: '2',
    name: 'Marcus Chen',
    email: 'marcus.chen@company.com',
    role: 'Editor',
    department: 'Product Management',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    email: 'sophia.rodriguez@company.com',
    role: 'Viewer',
    department: 'Marketing',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  },
  {
    id: '4',
    name: 'Ethan Hunt',
    email: 'ethan.hunt@company.com',
    role: 'Admin',
    department: 'Security Operations',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: '5',
    name: 'Zoe Brooks',
    email: 'zoe.brooks@company.com',
    role: 'Viewer',
    department: 'Human Resources',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: '6',
    name: 'Liam Patterson',
    email: 'liam.patterson@company.com',
    role: 'Editor',
    department: 'Customer Support',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
  }
];

// Helper to generate new string IDs
function generateId() {
  return String(Math.max(...users.map(u => parseInt(u.id) || 0), 0) + 1);
}

// GET all users (with optional filtering by name in query)
app.get('/users', (req, res) => {
  const { name } = req.query;
  if (name) {
    const query = name.toLowerCase();
    const filtered = users.filter(u => u.name.toLowerCase().includes(query));
    return res.json(filtered);
  }
  res.json(users);
});

// GET user by ID
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// POST create user
app.post('/users', (req, res) => {
  const { name, email, role, department, status, avatar } = req.body;
  
  if (!name || !email || !role || !department || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newUser = {
    id: generateId(),
    name,
    email,
    role,
    department,
    status,
    avatar: avatar || `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?w=150`
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// PUT update user
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { name, email, role, department, status, avatar } = req.body;
  if (!name || !email || !role || !department || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  users[index] = {
    ...users[index],
    name,
    email,
    role,
    department,
    status,
    avatar: avatar || users[index].avatar
  };

  res.json(users[index]);
});

// DELETE user
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deletedUser = users.splice(index, 1)[0];
  res.json(deletedUser);
});

app.listen(PORT, () => {
  console.log(`Mock server is running on http://localhost:${PORT}`);
});

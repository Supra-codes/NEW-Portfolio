require('dotenv').config();
const { connectDB } = require('../src/config/db');
const { Profile, Project, Skill } = require('../src/models');

const seedData = async () => {
  // Wait for database connection attempt
  await connectDB();

  console.log('🧹 Clearing existing portfolio records...');
  await Project.clear();
  await Skill.clear();

  console.log('👤 Seeding Profile Info...');
  const profileInfo = {
    name: 'Suprajit Maity',
    title: 'Full-Stack Software Engineer',
    bio: 'Hi, I am Suprajit, a passionate full-stack developer from Kolkata, India. I specialize in building secure, scalable, and responsive web applications using Node.js, modern frontend interfaces, and robust database architectures. I love crafting clean code and designing interactive visual experiences that solve real-world problems.',
    avatar: 'images/profile.jpg',
    socialLinks: {
      github: 'https://github.com/Supra-codes',
      linkedin: 'https://in.linkedin.com/in/suprajit-maity-314bbb348',
      leetcode: 'https://leetcode.com/u/Suprajit-/',
      twitter: '',
      email: 'suprajitmaity@gmail.com'
    },
    resumeUrl: '#'
  };
  await Profile.upsert(profileInfo);

  console.log('🛠️ Seeding Skills...');
  const skills = [
    // Frontend
    { name: 'HTML5 & CSS3', category: 'Frontend', level: 95, icon: 'fab fa-html5' },
    { name: 'JavaScript (ES6+)', category: 'Frontend', level: 90, icon: 'fab fa-js' },
    { name: 'React.js', category: 'Frontend', level: 85, icon: 'fab fa-react' },
    { name: 'Vue.js', category: 'Frontend', level: 70, icon: 'fab fa-vuejs' },
    
    // Backend
    { name: 'Node.js & Express.js', category: 'Backend', level: 90, icon: 'fab fa-node-js' },
    { name: 'RESTful APIs', category: 'Backend', level: 95, icon: 'fas fa-project-diagram' },
    { name: 'GraphQL', category: 'Backend', level: 75, icon: 'fas fa-network-wired' },
    { name: 'Python & Django', category: 'Backend', level: 70, icon: 'fab fa-python' },

    // Databases
    { name: 'MongoDB / Mongoose', category: 'Database', level: 85, icon: 'fas fa-database' },
    { name: 'PostgreSQL', category: 'Database', level: 80, icon: 'fas fa-database' },
    { name: 'Redis (Caching)', category: 'Database', level: 75, icon: 'fas fa-bolt' },

    // Tools & DevOps
    { name: 'Git & GitHub', category: 'Tools', level: 90, icon: 'fab fa-github' },
    { name: 'Docker', category: 'Tools', level: 75, icon: 'fab fa-docker' },
    { name: 'AWS (S3, EC2)', category: 'Tools', level: 70, icon: 'fab fa-aws' },
    { name: 'CI/CD Pipelines', category: 'Tools', level: 80, icon: 'fas fa-tasks' }
  ];

  for (const skill of skills) {
    await Skill.create(skill);
  }

  console.log('🚀 Seeding Projects...');
  const projects = [
    {
      title: 'Fullstack Weather Application',
      description: 'A real-time weather monitoring application providing accurate forecasts, interactive weather maps, and location-based weather alerts. Integration with OpenWeatherMap API.',
      tags: ['React', 'Node.js', 'Express', 'OpenWeatherMap API'],
      imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&q=80&w=800',
      githubLink: 'https://github.com/Supra-codes',
      liveLink: '#',
      featured: true
    },
    {
      title: 'To Do List',
      description: 'A sleek and responsive task management application to plan, organize, and prioritize daily tasks. Features drag-and-drop ordering, task categorization, and local storage persistence.',
      tags: ['JavaScript', 'HTML5', 'CSS3', 'LocalStorage'],
      imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800',
      githubLink: 'https://github.com/Supra-codes',
      liveLink: '#',
      featured: true
    },
    {
      title: 'Sticky Notes',
      description: 'An interactive digital dashboard for pinning, coloring, and managing virtual sticky notes. Ideal for quick brainstorm sessions and thought organization.',
      tags: ['React', 'CSS Grid', 'Context API', 'Web APIs'],
      imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=800',
      githubLink: 'https://github.com/Supra-codes',
      liveLink: '#',
      featured: false
    },
    {
      title: 'Habit Tracker',
      description: 'A personal routine and habit tracker with visual progress charts, streak counters, and daily checklists to build positive habits and maintain consistency.',
      tags: ['React', 'Chart.js', 'Node.js', 'MongoDB'],
      imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800',
      githubLink: 'https://github.com/Supra-codes',
      liveLink: '#',
      featured: false
    }
  ];

  for (const project of projects) {
    await Project.create(project);
  }

  console.log('🟢 Seeding completed successfully!');
  process.exit(0);
};

seedData().catch(err => {
  console.error('🔴 Seeding failed with error:', err);
  process.exit(1);
});

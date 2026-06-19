const mongoose = require('mongoose');

// Profile Schema
const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  avatar: { type: String, default: '' },
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    twitter: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  resumeUrl: { type: String, default: '' }
}, { timestamps: true });

// Project Schema
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: [{ type: String }],
  imageUrl: { type: String, default: '' },
  githubLink: { type: String, default: '' },
  liveLink: { type: String, default: '' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

// Skill Schema
const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true }, // 'Frontend', 'Backend', 'Database', 'Tools', etc.
  level: { type: Number, required: true, min: 0, max: 100 }, // Proficiency percentage
  icon: { type: String, default: '' } // CSS class or icon name
}, { timestamps: true });

// Message Schema
const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'General Inquiry' },
  message: { type: String, required: true },
  status: { type: String, enum: ['unread', 'read'], default: 'unread' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  MongooseProfile: mongoose.model('Profile', ProfileSchema),
  MongooseProject: mongoose.model('Project', ProjectSchema),
  MongooseSkill: mongoose.model('Skill', SkillSchema),
  MongooseMessage: mongoose.model('Message', MessageSchema)
};

const fs = require('fs');
const path = require('path');
const { getDbState } = require('../config/db');
const {
  MongooseProfile,
  MongooseProject,
  MongooseSkill,
  MongooseMessage
} = require('./MongooseModels');

// Local file database helpers
const getLocalData = (collectionName) => {
  const { dataDir } = getDbState();
  const filePath = path.join(dataDir, `${collectionName}.json`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return collectionName === 'profile' ? {} : [];
  }
};

const saveLocalData = (collectionName, data) => {
  const { dataDir } = getDbState();
  const filePath = path.join(dataDir, `${collectionName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Profile Model Abstraction
const Profile = {
  get: async () => {
    const state = getDbState();
    if (state.isConnected) {
      const profile = await MongooseProfile.findOne();
      return profile || {};
    }
    return getLocalData('profile');
  },
  
  upsert: async (data) => {
    const state = getDbState();
    if (state.isConnected) {
      let profile = await MongooseProfile.findOne();
      if (profile) {
        Object.assign(profile, data);
        return await profile.save();
      } else {
        profile = new MongooseProfile(data);
        return await profile.save();
      }
    } else {
      const profile = { ...getLocalData('profile'), ...data, updatedAt: new Date().toISOString() };
      saveLocalData('profile', profile);
      return profile;
    }
  }
};

// Project Model Abstraction
const Project = {
  find: async (filter = {}) => {
    const state = getDbState();
    if (state.isConnected) {
      return await MongooseProject.find(filter).sort({ featured: -1, createdAt: -1 });
    }
    let projects = getLocalData('projects');
    if (filter.featured !== undefined) {
      projects = projects.filter(p => p.featured === filter.featured);
    }
    return projects;
  },

  create: async (data) => {
    const state = getDbState();
    if (state.isConnected) {
      const project = new MongooseProject(data);
      return await project.save();
    } else {
      const projects = getLocalData('projects');
      const newProject = {
        _id: 'local_' + Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      projects.push(newProject);
      saveLocalData('projects', projects);
      return newProject;
    }
  },

  clear: async () => {
    const state = getDbState();
    if (state.isConnected) {
      await MongooseProject.deleteMany({});
    } else {
      saveLocalData('projects', []);
    }
  }
};

// Skill Model Abstraction
const Skill = {
  find: async () => {
    const state = getDbState();
    if (state.isConnected) {
      return await MongooseSkill.find().sort({ category: 1, level: -1 });
    }
    return getLocalData('skills');
  },

  create: async (data) => {
    const state = getDbState();
    if (state.isConnected) {
      const skill = new MongooseSkill(data);
      return await skill.save();
    } else {
      const skills = getLocalData('skills');
      const newSkill = {
        _id: 'local_' + Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      skills.push(newSkill);
      saveLocalData('skills', skills);
      return newSkill;
    }
  },

  clear: async () => {
    const state = getDbState();
    if (state.isConnected) {
      await MongooseSkill.deleteMany({});
    } else {
      saveLocalData('skills', []);
    }
  }
};

// Message Model Abstraction
const Message = {
  find: async () => {
    const state = getDbState();
    if (state.isConnected) {
      return await MongooseMessage.find().sort({ createdAt: -1 });
    }
    return getLocalData('messages');
  },

  create: async (data) => {
    const state = getDbState();
    if (state.isConnected) {
      const msg = new MongooseMessage(data);
      return await msg.save();
    } else {
      const messages = getLocalData('messages');
      const newMsg = {
        _id: 'local_' + Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'unread',
        createdAt: new Date().toISOString()
      };
      messages.push(newMsg);
      saveLocalData('messages', messages);
      return newMsg;
    }
  }
};

module.exports = {
  Profile,
  Project,
  Skill,
  Message
};

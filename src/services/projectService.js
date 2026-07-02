import api from '../config/api.js';

const STORAGE_KEY = 'projectsphere_student_projects';
const USE_BACKEND = import.meta.env.VITE_API_BASE_URL ? true : false;

const readProjects = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const writeProjects = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  if (!file) {
    resolve('');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Could not read image file.'));
  reader.readAsDataURL(file);
});

const createProjectPayload = async (project, user) => ({
  ...project,
  thumbnailUrl: project.thumbnailFile
    ? await readFileAsDataUrl(project.thumbnailFile)
    : project.thumbnailUrl || '',
  thumbnailFile: undefined,
  technologies: Array.isArray(project.technologies)
    ? project.technologies
    : project.technologies.split(',').map((item) => item.trim()).filter(Boolean),
  ownerId: user?.id || 'demo-student',
  student: {
    id: user?.id || 'demo-student',
    name: user?.name || 'Student',
    email: user?.email || '',
  },
});

const toFormData = (project) => {
  const formData = new FormData();

  Object.entries(project).forEach(([key, value]) => {
    if (key === 'thumbnailFile' && value) {
      formData.append('thumbnail', value);
      return;
    }

    if (key === 'technologies' && Array.isArray(value)) {
      formData.append('technologies', value.join(','));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(item => formData.append(key, item));
      return;
    }

    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  return formData;
};

const normalizeProject = (project) => ({
  ...project,
  id: project._id || project.id,
  thumbnailUrl: project.thumbnail || project.thumbnailUrl || '',
  student: project.owner ? {
    id: project.owner._id || project.owner.id,
    name: project.owner.name,
    email: project.owner.email,
    profilePicture: project.owner.profilePicture,
  } : project.student,
  owner: project.owner,
});

export async function getMyProjects(token, user) {
  void token;

  if (USE_BACKEND) {
    const { data } = await api.get('/projects/my-projects');
    return (data.projects || []).map(normalizeProject);
  }

  return readProjects().filter((project) => project.ownerId === (user?._id || user?.id || 'demo-student'));
}

export async function getProjectById(id) {
  if (USE_BACKEND) {
    const { data } = await api.get(`/projects/${id}`);
    return data.project ? normalizeProject(data.project) : null;
  }

  return readProjects().find((project) => String(project.id) === String(id)) || null;
}

export async function createProject(project, token, user) {
  void token;

  if (USE_BACKEND) {
    const { data } = await api.post('/projects', toFormData(project), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.project ? normalizeProject(data.project) : data;
  }

  const projects = readProjects();
  const payload = await createProjectPayload(project, user);
  const savedProject = {
    ...payload,
    id: crypto.randomUUID(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeProjects([savedProject, ...projects]);
  return savedProject;
}

export async function updateProject(id, project) {
  if (USE_BACKEND) {
    const { data } = await api.put(`/projects/${id}`, toFormData(project), {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.project ? normalizeProject(data.project) : data;
  }

  const projects = readProjects();
  const existing = projects.find((item) => String(item.id) === String(id));

  if (!existing) {
    throw new Error('Project not found.');
  }

  const payload = await createProjectPayload(project, existing.student);
  const updatedProject = {
    ...existing,
    ...payload,
    status: 'Pending',
    updatedAt: new Date().toISOString(),
  };

  writeProjects(projects.map((item) => (String(item.id) === String(id) ? updatedProject : item)));
  return updatedProject;
}

export async function deleteProject(id) {
  if (USE_BACKEND) {
    await api.delete(`/projects/${id}`);
    return true;
  }

  writeProjects(readProjects().filter((project) => String(project.id) !== String(id)));
  return true;
}

// Get all projects (for browse/search)
export async function getAllProjects(filters = {}) {
  if (USE_BACKEND) {
    const queryParams = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/projects${queryParams ? `?${queryParams}` : ''}`);
    return (data.projects || []).map(normalizeProject);
  }

  return readProjects();
}

// Like/Unlike a project (Student, Lecturer, Recruiter)
export async function likeProject(projectId) {
  if (USE_BACKEND) {
    const { data } = await api.post(`/projects/${projectId}/like`);
    return data;
  }

  return { success: true, message: 'Feature not available in offline mode' };
}

// Add a comment to a project (Student, Lecturer, Recruiter)
export async function commentProject(projectId, text) {
  if (USE_BACKEND) {
    const { data } = await api.post(`/projects/${projectId}/comment`, { text });
    return data;
  }

  return { success: true, message: 'Feature not available in offline mode' };
}

// Lecturer specific API calls
export async function getLecturerDashboard() {
  if (USE_BACKEND) {
    const { data } = await api.get('/admin/dashboard');
    return data;
  }

  return {
    success: true,
    stats: { projects: { pending: 0, approved: 0, rejected: 0, total: 0 } },
    recentProjects: [],
  };
}

export async function getPendingProjects() {
  if (USE_BACKEND) {
    const { data } = await api.get('/admin/projects/pending');
    return (data.projects || []).map(normalizeProject);
  }
  return [];
}

export async function getApprovedProjectsByLecturer() {
  if (USE_BACKEND) {
    const { data } = await api.get('/admin/projects/approved');
    return (data.projects || []).map(normalizeProject);
  }
  return [];
}

export async function approveProject(projectId) {
  if (USE_BACKEND) {
    const { data } = await api.put(`/admin/projects/${projectId}/approve`);
    return data;
  }
  return { success: true };
}

export async function rejectProject(projectId) {
  if (USE_BACKEND) {
    const { data } = await api.put(`/admin/projects/${projectId}/reject`);
    return data;
  }
  return { success: true };
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Compass, Image as ImageIcon, Database, MessageSquare, Send, Heart, 
  Rocket, ExternalLink, FileText, Sparkles, Wrench, Target, Loader2 
} from 'lucide-react';

const GithubIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);
import LikeButton from '../../components/recruiter/LikeButton';
import FollowButton from '../../components/recruiter/FollowButton';
import SaveButton from '../../components/recruiter/SaveButton';
import { getProjectById, commentProject } from '../../services/projectService';
import { useAuth } from '../../hooks/useAuth';
import { normalizeProjectLikes } from '../../utils/projectLikes.js';

// ─── Normalise backend project shape ──────────────────────────────────────────
function normaliseProject(p) {
  if (!p) return null;
  const likeMeta = normalizeProjectLikes(p);
  return {
    ...p,
    id: p._id || p.id,
    student: p.owner
      ? {
          id: p.owner._id || p.owner,
          name: p.owner.name || 'Student',
          email: p.owner.email || '',
          degree: p.owner.degree || '',
          batch: p.owner.batch || '',
          github: p.owner.github || null,
          linkedin: p.owner.linkedin || null,
        }
      : p.student || { id: '', name: 'Unknown', email: '' },
    technologies: Array.isArray(p.technologies) ? p.technologies : [],
    ...likeMeta,
    year: p.year || (p.createdAt ? new Date(p.createdAt).getFullYear() : new Date().getFullYear()),
    category: p.category || 'General',
    description: p.description || '',
    githubLink: p.githubUrl || p.githubLink || null,
    liveDemo: p.liveDemo || null,
    highlights: p.highlights || [],
    diagrams: p.diagrams || [],
    databaseSchema: p.databaseSchema || [],
    screenshots: p.screenshots || [],
    recruiterNote: p.recruiterNote || null,
    comments: Array.isArray(p.comments)
      ? p.comments.map(c => ({
          id: c._id || c.id || `c${Date.now()}`,
          author: c.user?.name || c.author || 'Anonymous',
          role: c.user?.role || c.role || 'User',
          avatar: (c.user?.name || c.author || 'A').charAt(0),
          text: c.text || '',
          timestamp: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : c.timestamp || '',
          likes: c.likes || 0,
        }))
      : [],
  };
}

// ─── Diagram placeholder card ─────────────────────────────────────────────────
function DiagramCard({ diagram }) {
  // diagram can be a string (file path) or an object with label/description
  const isFilePath = typeof diagram === 'string';
  const label = isFilePath ? 'Diagram' : diagram.label;
  const description = isFilePath ? '' : diagram.description;
  const imageUrl = isFilePath ? diagram : null;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      {/* Placeholder visual */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center gap-2 border-b border-slate-200">
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <>
            <Compass className="w-10 h-10 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">{label}</span>
            <span className="text-xs text-slate-300">Diagram image will appear here</span>
          </>
        )}
      </div>
      <div className="p-4">
        <p className="font-semibold text-slate-700 text-sm mb-1">{label}</p>
        {description && <p className="text-slate-500 text-xs leading-relaxed">{description}</p>}
      </div>
    </div>
  );
}

// ─── Screenshot card ──────────────────────────────────────────────────────────
function ScreenshotCard({ screenshot }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
      <div className="h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-1 border-b border-slate-200">
        {screenshot.url ? (
          <img src={screenshot.url} alt={screenshot.caption} className="w-full h-full object-cover" />
        ) : (
          <>
            <ImageIcon className="w-8 h-8 text-slate-400" />
            <span className="text-xs text-slate-400">Screenshot</span>
          </>
        )}
      </div>
      <p className="text-center text-xs font-medium text-slate-600 p-2">{screenshot.caption}</p>
    </div>
  );
}

// ─── Database schema table ────────────────────────────────────────────────────
function SchemaTable({ table, columns }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
      <div className="bg-slate-800 text-white px-4 py-2.5 font-mono font-bold text-xs tracking-wider flex items-center gap-2">
        <Database className="w-4 h-4 text-blue-400" /> {table}
      </div>
      <div className="divide-y divide-slate-100">
        {columns.map(col => (
          <div key={col.name} className="flex items-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 transition-colors">
            <span className="font-mono text-blue-700 font-semibold w-36 flex-shrink-0 text-xs">{col.name}</span>
            <span className="font-mono text-emerald-600 text-xs w-32 flex-shrink-0">{col.type}</span>
            <span className="text-slate-400 text-xs">{col.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Comments section ─────────────────────────────────────────────────────────
function CommentsSection({ projectId, initialComments, user }) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);

    try {
      const response = await commentProject(projectId, text.trim());
      if (response && response.success) {
        const normalisedComments = response.comments.map(c => ({
          id: c._id || c.id,
          author: c.user?.name || 'Anonymous',
          role: c.user?.role || 'User',
          avatar: (c.user?.name || 'A').charAt(0),
          text: c.text || '',
          timestamp: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Just now',
          likes: c.likes || 0,
        }));
        setComments(normalisedComments);
        setText('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCommentLike = (id) => {
    setCommentLikes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-blue-500" /> Comments
        <span className="ml-1 text-sm font-normal text-slate-400">({comments.length})</span>
      </h2>
      <p className="text-xs text-slate-400 mb-5">
        Recruiters can leave public comments on projects. Direct contact with students is not supported.
      </p>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          id={`comment-input-${projectId}`}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ask a question or leave feedback about this project…"
          rows={3}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-slate-400">Be professional and constructive.</p>
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            {submitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : <Send className="w-4 h-4" />}
            {submitting ? 'Posting…' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comment list */}
      {comments.length === 0 ? (
        <div className="text-center py-10">
          <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-slate-400 text-sm">No comments yet. Be the first to leave feedback!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <div className="w-9 h-9 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {comment.avatar}
              </div>
              {/* Bubble */}
              <div className="flex-grow bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                  <div>
                    <span className="font-semibold text-slate-800 text-sm">{comment.author}</span>
                    <span className="ml-2 text-xs text-slate-400">{comment.role}</span>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{comment.timestamp}</span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{comment.text}</p>
                <button
                  onClick={() => toggleCommentLike(comment.id)}
                  className={`mt-2 flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    commentLikes[comment.id]
                      ? 'text-rose-500'
                      : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${commentLikes[comment.id] ? 'fill-current text-rose-500' : ''}`} />
                  {comment.likes + (commentLikes[comment.id] ? 1 : 0)} helpful
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getProjectById(id)
      .then(data => {
        if (!cancelled) {
          setProject(normaliseProject(data));
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Failed to fetch project:', err);
          setError('Failed to load project details.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading project…</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Rocket className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">{error || 'Project not found'}</h2>
          <Link to="/projects" className="text-blue-600 hover:underline">← Back to projects</Link>
        </div>
      </div>
    );
  }

  const { student } = project;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-slate-800 text-white pt-10 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-sm mb-6 transition-colors"
          >
            ← Back to Projects
          </Link>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 inline-block">
                {project.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-2">
                {project.title}
              </h1>
              <p className="text-blue-200 text-sm">
                {project.year} · {project.technologies.length} technologies used
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {project.githubLink && (
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                >
                  <GithubIcon className="w-4 h-4" /> GitHub
                </a>
              )}
              {project.liveDemo && (
                <a
                  href={project.liveDemo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold px-4 py-2 rounded-xl shadow transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column (main content) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <section className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" /> About the Project
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </section>

            {/* Key highlights */}
            {project.highlights.length > 0 && (
              <section className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" /> Key Highlights
                </h2>
                <ul className="space-y-2">
                  {project.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <span className="mt-0.5 w-5 h-5 flex-shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                        {i + 1}
                      </span>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Technologies */}
            <section className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-slate-500" /> Technologies Used
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map(tech => (
                  <span
                    key={tech}
                    className="bg-blue-50 text-blue-700 border border-blue-100 text-sm font-semibold px-4 py-1.5 rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            {/* Diagrams */}
            {project.diagrams?.length > 0 && (
              <section className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-slate-500" /> Architecture Diagrams
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.diagrams.map((d, i) => (
                    <DiagramCard key={d.id || i} diagram={d} />
                  ))}
                </div>
              </section>
            )}

            {/* Database Schema */}
            {project.databaseSchema?.length > 0 && (
              <section className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                  <Database className="w-5 h-5 text-slate-500" /> Database Schema
                </h2>
                <p className="text-slate-400 text-xs mb-4">
                  Key tables and their column definitions
                </p>
                <div className="space-y-4">
                  {project.databaseSchema.map(t => (
                    <SchemaTable key={t.table} table={t.table} columns={t.columns} />
                  ))}
                </div>
              </section>
            )}

            {/* Screenshots */}
            {project.screenshots?.length > 0 && (
              <section className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-slate-500" /> Screenshots
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.screenshots.map(sc => (
                    <ScreenshotCard key={sc.id} screenshot={sc} />
                  ))}
                </div>
              </section>
            )}

            {/* Recruiter Insights */}
            {project.recruiterNote && (
              <section className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" /> Recruiter Insights
                </h2>
                <p className="text-blue-700 text-sm leading-relaxed">{project.recruiterNote}</p>
              </section>
            )}

            {/* Comments */}
            <CommentsSection projectId={project.id} initialComments={project.comments ?? []} user={user} />
          </div>

          {/* ── Right column (student card + like) ── */}
          <div className="space-y-6">

            {/* Student card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Created by
              </h2>
              <div className="flex flex-col items-center text-center gap-3 mb-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                  {student.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg">{student.name}</p>
                  {student.degree && <p className="text-slate-500 text-sm">{student.degree}</p>}
                  {student.batch && <p className="text-slate-400 text-xs">{student.batch}</p>}
                </div>
              </div>

              {/* External links (public info only — no direct message) */}
              <div className="space-y-2 text-sm mb-5">
                {student.github && (
                  <a
                    href={student.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4" /> GitHub Profile
                  </a>
                )}
                {student.linkedin && (
                  <a
                    href={student.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <LinkedinIcon className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </div>



              <div className="space-y-2">
                <FollowButton studentId={student.id} />
                <Link
                  to={`/students/${student.id}`}
                  className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl transition-colors"
                >
                  View Full Profile
                </Link>
              </div>
            </div>

            {/* Action card */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
              <div className="flex flex-col items-center gap-2 pb-4 border-b border-slate-100">
                <LikeButton
                  projectId={project.id}
                  likes={project.likesArray}
                  likedByCurrentUser={project.likedByCurrentUser}
                  initialLikes={project.likes}
                  large
                />
              </div>
              <div className="flex flex-col items-center gap-2 pt-1">
                <p className="text-slate-500 text-sm text-center">Save this project to review later</p>
                <SaveButton projectId={project.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

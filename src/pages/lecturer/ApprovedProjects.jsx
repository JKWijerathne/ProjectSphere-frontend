import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ExternalLink, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useAlert } from '../../hooks/useAlert.js';
import { getApprovedProjectsByLecturer } from '../../services/projectService.js';

function getProjectId(project) {
  return project.id || project._id;
}

function getErrorMessage(err, fallback) {
  if (typeof err === 'string') return err;
  return err?.response?.data?.error || err?.message || fallback;
}

export default function ApprovedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApprovedProjectsByLecturer();
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load approved projects:', err);
      showAlert({
        type: 'error',
        title: 'Error',
        message: getErrorMessage(err, 'Failed to fetch approved projects.'),
      });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    const fetchId = window.setTimeout(fetchProjects, 0);
    return () => window.clearTimeout(fetchId);
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 text-sm">Loading approved projects...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="page-section bg-slate-50 min-h-screen py-10">
      <div className="container max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="badge blue mb-2 inline-block">Lecturer Workspace</span>
            <h1 className="section-title text-3xl font-extrabold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" /> Approved Projects
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Projects you approved are collected here for quick review later.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-sm">
              {projects.length} approved
            </span>
            <button
              type="button"
              className="button button-secondary flex items-center gap-2"
              onClick={fetchProjects}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="panel bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-400 mb-4 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-700 mb-2">No Approved Projects Yet</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              When you approve pending submissions, those projects will appear here.
            </p>
            <Link className="button button-primary" to="/lecturer/approvals">Open approvals</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => {
              const id = getProjectId(project);
              const ownerName = project.owner?.name || project.student?.name || 'Student';
              const ownerEmail = project.owner?.email || project.student?.email || '';
              const thumbnail = project.thumbnailUrl || project.thumbnail;

              return (
                <article key={id} className="panel bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="lecturer-approval-card">
                    {thumbnail ? (
                      <div className="lecturer-approval-thumb">
                        <img src={thumbnail} alt="" />
                      </div>
                    ) : (
                      <div className="lecturer-approval-thumb lecturer-approval-thumb-fallback">
                        {project.title?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                    )}

                    <div className="lecturer-approval-body">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-2 inline-block">
                            Approved
                          </span>
                          <h2 className="text-xl font-bold text-slate-800">{project.title}</h2>
                          <p className="text-slate-500 text-xs mt-1">
                            Submitted by: <strong className="text-slate-700">{ownerName}</strong>
                            {ownerEmail ? ` (${ownerEmail})` : ''}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-line line-clamp-4">
                        {project.description}
                      </p>

                      {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {project.technologies.map((tech) => (
                            <span key={tech} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-lg">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-400">
                        <span className="italic">
                          Approved on {project.approvedAt ? new Date(project.approvedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="flex gap-4">
                          <Link
                            to={`/projects/${id}`}
                            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View details
                          </Link>
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors font-medium"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

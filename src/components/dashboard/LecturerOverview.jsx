import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLecturerDashboard, getAllProjects } from '../../services/projectService.js';

function getProjectId(project) {
  return project.id || project._id;
}

export default function LecturerOverview() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [recentPending, setRecentPending] = useState([]);
  const [recentApproved, setRecentApproved] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.all([
      getLecturerDashboard(),
      getAllProjects()
    ])
      .then(([dashboardData, allProjects]) => {
        if (!active) return;
        
        // Get stats
        const projectStats = dashboardData?.stats?.projects || {};
        setStats({
          pending: projectStats.pending ?? 0,
          approved: projectStats.approved ?? 0,
          rejected: projectStats.rejected ?? 0,
        });
        
        // Get recent pending projects
        const pending = (dashboardData?.recentProjects || []).filter(
          (project) => (project.status || 'Pending') === 'Pending'
        );
        setRecentPending(pending.slice(0, 4));

        // Get recent approved projects
        const approved = (allProjects || [])
          .filter(p => p.status === 'Approved')
          .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
          .slice(0, 4);
        setRecentApproved(approved);
      })
      .catch(() => {
        if (active) {
          setStats({ pending: 0, approved: 0, rejected: 0 });
          setRecentPending([]);
          setRecentApproved([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  return (
    <>
      <div className="stat-grid">
        <article className="panel stat-card">
          <strong>{loading ? '—' : stats.pending}</strong>
          <span>Pending approvals</span>
        </article>
        <article className="panel stat-card">
          <strong>{loading ? '—' : stats.approved}</strong>
          <span>Approved projects</span>
        </article>
        <article className="panel stat-card">
          <strong>{loading ? '—' : stats.rejected}</strong>
          <span>Rejected projects</span>
        </article>
      </div>

      <div className="dashboard-content-grid">
        <div className="panel dashboard-content-panel">
          <div className="content-panel-header">
            <p className="eyebrow">Moderation</p>
            <h2>Review queue</h2>
          </div>
          <div className="content-panel-empty">
            <p>
              {loading
                ? 'Loading submission data…'
                : stats.pending > 0
                  ? `${stats.pending} project${stats.pending === 1 ? '' : 's'} waiting for your review.`
                  : 'No pending submissions right now.'}
            </p>
            <Link className="button button-primary" to="/lecturer/approvals">Open approvals</Link>
          </div>
        </div>

        <div className="panel dashboard-content-panel">
          <div className="content-panel-header">
            <p className="eyebrow">Latest submissions</p>
            <h2>Pending projects</h2>
          </div>

          {loading ? (
            <p className="content-panel-empty">Loading submissions…</p>
          ) : recentPending.length === 0 ? (
            <p className="content-panel-empty">No pending projects to show.</p>
          ) : (
            <ul className="recent-list">
              {recentPending.map((project) => {
                const id = getProjectId(project);
                return (
                  <li key={id} className="recent-list-item">
                    <div>
                      <strong>{project.title}</strong>
                      <span className="status-pill status-pending">Pending</span>
                      <p className="lecturer-recent-meta">
                        {project.owner?.name || 'Student'}
                        {project.category ? ` · ${project.category}` : ''}
                      </p>
                    </div>
                    <Link to="/lecturer/approvals" className="recent-link">Review</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* New: Approved Projects Section */}
        <div className="panel dashboard-content-panel">
          <div className="content-panel-header">
            <p className="eyebrow">Recently approved</p>
            <h2>Approved projects</h2>
          </div>

          {loading ? (
            <p className="content-panel-empty">Loading approved projects…</p>
          ) : recentApproved.length === 0 ? (
            <p className="content-panel-empty">No approved projects yet.</p>
          ) : (
            <ul className="recent-list">
              {recentApproved.map((project) => {
                const id = getProjectId(project);
                return (
                  <li key={id} className="recent-list-item">
                    <div>
                      <strong>{project.title}</strong>
                      <span className="status-pill status-approved">Approved</span>
                      <p className="lecturer-recent-meta">
                        {project.owner?.name || project.student?.name || 'Student'}
                        {project.category ? ` · ${project.category}` : ''}
                      </p>
                    </div>
                    <Link to={`/projects/${id}`} className="recent-link">View</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

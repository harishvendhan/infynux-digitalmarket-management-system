import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import {
  Upload,
  FileDown,
  Image as ImageIcon,
  Eye,
  Trash2,
  Calendar,
  Layers,
  Search,
  X,
} from 'lucide-react';
import { getAllMedia, deleteMedia, type DeliverableMedia } from '../../lib/mediaStorage';
import { exportSingleMediaPdf, exportMultiMediaPdf } from '../../lib/pdfExport';
import { UploadMediaModal } from './UploadMediaModal';
import { useProjects } from '../projects/useProjects';
import { useAuth } from '../auth/useAuth';
import { toast } from 'sonner';

export const MediaHubPage: React.FC = () => {
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<DeliverableMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMedia, setPreviewMedia] = useState<DeliverableMedia | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportingAll, setExportingAll] = useState(false);

  const { data: projectList } = useProjects();

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await getAllMedia();
      setMediaItems(data);
    } catch {
      toast.error('Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [user?.email]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteMedia(id);
      toast.info('Deliverable screenshot removed');
      loadMedia();
    } catch {
      toast.error('Could not delete media');
    }
  };

  const handleDownloadSinglePdf = async (item: DeliverableMedia) => {
    setExportingId(item.id);
    try {
      toast.info(`Generating PDF for "${item.title}"...`);
      await exportSingleMediaPdf(item);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setExportingId(null);
    }
  };

  const handleDownloadAllPdf = async () => {
    if (filteredMedia.length === 0) {
      toast.error('No deliverable screenshots to export');
      return;
    }

    setExportingAll(true);
    try {
      toast.info(`Generating PDF report with ${filteredMedia.length} deliverable(s)...`);
      const title =
        selectedProject !== 'all'
          ? `${projectList?.find((p) => p.project.id === selectedProject)?.project.title || 'Campaign'} Deliverables Report`
          : 'All Campaign Deliverables & Insights Report';

      await exportMultiMediaPdf(filteredMedia, title);
      toast.success('Multi-page PDF report downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF report');
    } finally {
      setExportingAll(false);
    }
  };

  const filteredMedia = mediaItems.filter((item) => {
    if (selectedProject !== 'all' && item.projectId !== selectedProject) return false;
    if (selectedType !== 'all' && item.contentType !== selectedType) return false;
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deliverables & Insights Gallery"
        description="Upload deliverable screenshots, reel insights, and download professional client-ready PDF reports."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAllPdf}
              disabled={exportingAll || filteredMedia.length === 0}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              {exportingAll ? (
                <span className="w-3.5 h-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              )}
              Export Report (PDF)
            </button>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Screenshot
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deliverable title, notes, or campaign..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Project selector */}
          <div className="w-full sm:w-60">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              aria-label="Filter by campaign project"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Campaigns</option>
              {(projectList || []).map((p) => (
                <option key={p.project.id} value={p.project.id}>
                  {p.project.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-xs">
          <span className="text-slate-400 dark:text-slate-500 text-[11px] font-semibold mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Type:
          </span>
          {['all', 'reel', 'post', 'video', 'general'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-colors cursor-pointer ${
                selectedType === t
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800/60'
              }`}
            >
              {t}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Showing {filteredMedia.length} of {mediaItems.length} items
          </span>
        </div>
      </div>

      {/* Grid of Deliverables */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading deliverable screenshots...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <ImageIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No deliverable screenshots found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Upload your first Reel insights, Post screenshot, or campaign creative proof to generate PDF reports.
          </p>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Screenshot Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredMedia.map((item) => {
            const isDownloadingThis = exportingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                {/* Image Container with Hover Action */}
                <div
                  onClick={() => setPreviewMedia(item)}
                  className="relative h-36 sm:h-48 bg-slate-950/90 overflow-hidden cursor-pointer flex items-center justify-center p-2 rounded-t-xl"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-md rounded-md"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs text-slate-900 dark:text-slate-100 text-[11px] font-semibold flex items-center gap-1 shadow-md">
                      <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                      View
                    </span>
                  </div>

                  {/* Badges on Image */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                      {item.contentType}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-900/70 text-slate-200 backdrop-blur-xs flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {item.date}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 line-clamp-1">
                      {item.projectTitle}
                    </p>

                    {item.notes && (
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.notes}</p>
                    )}
                  </div>


                  {/* Card Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadSinglePdf(item)}
                      disabled={isDownloadingThis}
                      className="flex-1 py-1.5 px-2 sm:px-3 text-[11px] sm:text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {isDownloadingThis ? (
                        <span className="w-3.5 h-3.5 border-2 border-indigo-700/30 border-t-indigo-700 dark:border-indigo-400/30 dark:border-t-indigo-400 rounded-full animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span className="truncate">Download PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Delete screenshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 p-4 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{previewMedia.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{previewMedia.projectTitle} &bull; {previewMedia.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSinglePdf(previewMedia)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto flex-1">
              <img
                src={previewMedia.imageUrl}
                alt={previewMedia.title}
                className="max-h-[50vh] max-w-xs sm:max-w-sm w-auto object-contain rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadMediaModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadMedia}
      />
    </div>
  );
};

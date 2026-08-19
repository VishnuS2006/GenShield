import React, { useState } from 'react';
import { useDocuments } from '../hooks/useDocuments';
import { PageHeader } from '../components/common/PageHeader';
import { DocumentTable } from '../components/documents/DocumentTable';
import { DocumentFormModal } from '../components/documents/DocumentFormModal';
import { SkeletonTable } from '../components/common/SkeletonLoader';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { FileKey2, Plus, Search, RefreshCw } from 'lucide-react';
import { ProtectedDocumentCreate } from '../types/documents';

export const ProtectedDocumentsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    documents,
    isLoading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    refetch,
  } = useDocuments();

  const handleCreateSubmit = async (data: ProtectedDocumentCreate) => {
    try {
      setIsSubmitting(true);
      await createDocument(data);
      setIsAddModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Protected Vector Documents Vault"
        subtitle="Confidential synthetic knowledge base and granular facts monitored against LLM exfiltration"
        icon={FileKey2}
        badge="Classified"
        actions={
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-shield-cyan hover:bg-shield-cyanDark text-cyber-950 shadow-glow-cyan transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register Document</span>
          </button>
        }
      />

      {/* Search & Actions Bar */}
      <div className="cyber-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-cyber-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, department, lineage tag..."
            className="w-full pl-9 pr-4 py-2 bg-cyber-950 border border-cyber-750 focus:border-shield-cyan/70 focus:ring-0 rounded-lg text-xs font-mono text-cyber-100 placeholder-cyber-500 transition"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyber-400">
            Vault Total: <strong className="text-white">{documents.length}</strong> documents
          </span>
          <button
            type="button"
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-lg bg-cyber-850 hover:bg-cyber-800 border border-cyber-750 text-cyber-300 hover:text-white transition disabled:opacity-50"
            title="Refresh Documents"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-shield-cyan' : ''}`} />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {/* Documents Table or Skeleton */}
      {isLoading && documents.length === 0 ? (
        <SkeletonTable rows={6} cols={7} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileKey2}
          title="No Protected Documents in Vault"
          description="Your confidential vector vault is empty. Click 'Register Document' to add synthetic confidential documents and facts for LLM exfiltration protection."
          actionLabel="Register First Document"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="animate-fadeIn">
          <DocumentTable
            documents={documents}
            onUpdate={updateDocument}
            onDelete={deleteDocument}
            searchQuery={searchQuery}
          />
        </div>
      )}

      {/* Add Document Modal */}
      <DocumentFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSubmit as (data: unknown) => Promise<void>}
        isLoading={isSubmitting}
      />
    </div>
  );
};

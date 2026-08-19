import React, { useState } from 'react';
import { ProtectedDocumentRead, ProtectedDocumentCreate, ProtectedDocumentUpdate } from '../../types/documents';
import { SensitivityBadge } from '../common/SensitivityBadge';
import { DocumentDetailsModal } from './DocumentDetailsModal';
import { DocumentFormModal } from './DocumentFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { Eye, Edit2, Trash2, Tag, Building2, FileKey2 } from 'lucide-react';

interface DocumentTableProps {
  documents: ProtectedDocumentRead[];
  onUpdate: (id: number, data: ProtectedDocumentUpdate) => Promise<ProtectedDocumentRead>;
  onDelete: (id: number) => Promise<void>;
  searchQuery?: string;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  onUpdate,
  onDelete,
  searchQuery = '',
}) => {
  const [selectedDoc, setSelectedDoc] = useState<ProtectedDocumentRead | null>(null);
  const [editingDoc, setEditingDoc] = useState<ProtectedDocumentRead | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<ProtectedDocumentRead | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.department.toLowerCase().includes(q) ||
      doc.lineage_tag.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q)
    );
  });

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    try {
      setIsDeleting(true);
      await onDelete(deletingDoc.id);
      setDeletingDoc(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateSubmit = async (data: ProtectedDocumentCreate | ProtectedDocumentUpdate) => {
    if (!editingDoc) return;
    try {
      setIsUpdating(true);
      await onUpdate(editingDoc.id, data);
      setEditingDoc(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="cyber-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-cyber-850/80 border-b border-cyber-800 text-cyber-400 font-mono uppercase tracking-wider">
                <th className="py-3.5 px-4 font-medium">Document Title</th>
                <th className="py-3.5 px-4 font-medium">Department</th>
                <th className="py-3.5 px-4 font-medium">Classification</th>
                <th className="py-3.5 px-4 font-medium">Lineage Tag</th>
                <th className="py-3.5 px-4 font-medium">Facts</th>
                <th className="py-3.5 px-4 font-medium">Created</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-800/50">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-cyber-500 font-mono">
                    No protected documents found.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className="hover:bg-cyber-850/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <FileKey2 className="w-4 h-4 text-shield-cyan flex-shrink-0" />
                        <span className="group-hover:text-shield-cyan transition-colors">{doc.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyber-300">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-cyber-500" />
                        {doc.department}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <SensitivityBadge sensitivity={doc.sensitivity} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-shield-cyan">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        {doc.lineage_tag}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyber-200">
                      <span className="px-2 py-0.5 rounded bg-cyber-850 border border-cyber-750 text-xs">
                        {doc.facts?.length || 0} facts
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-cyber-400 whitespace-nowrap">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 rounded-lg bg-cyber-800 hover:bg-cyber-700 text-cyber-300 hover:text-white border border-cyber-700 transition"
                          title="View Document & Facts"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingDoc(doc)}
                          className="p-1.5 rounded-lg bg-cyber-800 hover:bg-cyber-700 text-shield-cyan hover:text-white border border-cyber-700 transition"
                          title="Edit Document"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDoc(doc)}
                          className="p-1.5 rounded-lg bg-cyber-800 hover:bg-rose-950/60 text-cyber-400 hover:text-rose-400 border border-cyber-700 transition"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <DocumentDetailsModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onEdit={(doc) => setEditingDoc(doc)}
      />

      {/* Edit Form Modal */}
      <DocumentFormModal
        isOpen={!!editingDoc}
        documentToEdit={editingDoc}
        onClose={() => setEditingDoc(null)}
        onSubmit={handleUpdateSubmit}
        isLoading={isUpdating}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingDoc}
        title="Delete Protected Document?"
        message={`Are you sure you want to permanently remove "${deletingDoc?.title}" (${deletingDoc?.lineage_tag}) from the confidential vault? Embeddings will be invalidated immediately.`}
        confirmLabel="Delete Document"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingDoc(null)}
      />
    </>
  );
};

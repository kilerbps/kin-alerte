import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  User, 
  AlertTriangle, 
  MessageSquare, 
  Image as ImageIcon,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { ImageModal } from './image-modal';
import { useState } from 'react';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  commune_id?: string;
  problem_type_id?: string;
  user_id?: string;
  created_at: string;
  updated_at?: string;
  commune?: { name: string };
  problem_type?: { name: string };
  user?: { full_name: string; email: string };
  images?: { id: string; image_url: string }[];
}

interface ReportDetailsModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (reportId: string, newStatus: string) => Promise<void>;
  isAdmin?: boolean;
}

export const ReportDetailsModal = ({ 
  report, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  isAdmin = false 
}: ReportDetailsModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!report) return null;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
      case 'in-progress':
        return { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: Loader2 };
      case 'resolved':
        return { label: 'Résolu', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'rejected':
        return { label: 'Rejeté', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  const statusInfo = getStatusInfo(report.status);
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusUpdate) return;
    
    setIsUpdating(true);
    try {
      await onStatusUpdate(report.id, newStatus);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Détails du Signalement
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Header avec statut */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{report.title || 'Signalement sans titre'}</h3>
                <div className="flex items-center gap-2">
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ID: {report.id}
                  </span>
                </div>
              </div>
              
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('in-progress')}
                    disabled={isUpdating || report.status === 'in-progress'}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Loader2 className="h-4 w-4 mr-1" />
                    En cours
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('resolved')}
                    disabled={isUpdating || report.status === 'resolved'}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Résolu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate('rejected')}
                    disabled={isUpdating || report.status === 'rejected'}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeté
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {report.description || 'Aucune description fournie'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium">Localisation</h4>
                      <p className="text-sm text-muted-foreground">{report.location || 'Localisation non spécifiée'}</p>
                      {report.commune && (
                        <Badge variant="secondary" className="text-xs">
                          {report.commune.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-medium">Dates</h4>
                      <p className="text-sm text-muted-foreground">
                        Créé le {report.created_at ? new Date(report.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      </p>
                      {report.updated_at && report.updated_at !== report.created_at && (
                        <p className="text-sm text-muted-foreground">
                          Modifié le {new Date(report.updated_at).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {report.user && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-medium">Signaleur</h4>
                        <p className="text-sm text-muted-foreground">{report.user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{report.user.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.problem_type && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-medium">Type de problème</h4>
                        <Badge variant="outline">{report.problem_type.name}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Images */}
            {report.images && report.images.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <ImageIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="font-medium">Images ({report.images.length})</h4>
                      <p className="text-sm text-muted-foreground">
                        Cliquez sur une image pour l'agrandir
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {report.images.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-200"
                        onClick={() => openImageModal(index)}
                      >
                        <img
                          src={image.image_url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ImageIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      {report.images && (
        <ImageModal
          images={report.images}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          initialIndex={selectedImageIndex}
        />
      )}
    </>
  );
}; 
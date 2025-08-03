import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Calendar, 
  Image as ImageIcon,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { ImageModal } from './image-modal';

interface Report {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  created_at: string;
  location: string;
  commune?: { name: string };
  problem_type?: { name: string };
  images?: { id: string; image_url: string }[];
}

interface ReportCardProps {
  report: Report;
  onViewDetails: (report: Report) => void;
  className?: string;
}

export const ReportCard = ({ report, onViewDetails, className = '' }: ReportCardProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'En attente', 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          bgColor: 'bg-yellow-50'
        };
      case 'in-progress':
        return { 
          label: 'En cours', 
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Loader2,
          bgColor: 'bg-blue-50'
        };
      case 'resolved':
        return { 
          label: 'Résolu', 
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          bgColor: 'bg-green-50'
        };
      case 'rejected':
        return { 
          label: 'Rejeté', 
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          bgColor: 'bg-red-50'
        };
      default:
        return { 
          label: 'Inconnu', 
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertTriangle,
          bgColor: 'bg-gray-50'
        };
    }
  };

  const statusInfo = getStatusInfo(report.status);
  const StatusIcon = statusInfo.icon;

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const truncatedDescription = report.description.length > 120 
    ? `${report.description.substring(0, 120)}...` 
    : report.description;

  return (
    <>
      <Card className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary/20 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {report.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={`${statusInfo.color} border`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusInfo.label}
                </Badge>
                {report.problem_type && (
                  <Badge variant="outline" className="text-xs">
                    {report.problem_type.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {truncatedDescription}
          </p>

          {/* Images Preview */}
          {report.images && report.images.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>{report.images.length} image{report.images.length > 1 ? 's' : ''}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {report.images.slice(0, 3).map((image, index) => (
                  <div
                    key={image.id}
                    className="relative flex-shrink-0 cursor-pointer group/image"
                    onClick={() => openImageModal(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={`Preview ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border border-border group-hover/image:border-primary/50 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white opacity-0 group-hover/image:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
                {report.images.length > 3 && (
                  <div className="flex-shrink-0 w-16 h-16 bg-muted rounded-lg border border-border flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      +{report.images.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Location and Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{report.location}</span>
              {report.commune && (
                <Badge variant="secondary" className="text-xs">
                  {report.commune.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              onClick={() => onViewDetails(report)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir les détails
            </Button>
          </div>
        </CardContent>
      </Card>

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
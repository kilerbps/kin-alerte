import jsPDF from 'jspdf';

interface ReportData {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  commune_id: string;
  problem_type_id: string;
  created_at: string;
  commune?: {
    name: string;
  };
  problem_type?: {
    name: string;
  };
}

interface PDFReportOptions {
  title: string;
  reports: ReportData[];
  filters?: {
    status?: string;
    commune?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  includeCharts?: boolean;
  chartType?: 'by_status' | 'by_priority' | 'by_commune' | 'by_problem_type' | 'by_month';
}

export class PDFService {
  static async generateReport(options: PDFReportOptions): Promise<void> {
    const { title, reports, filters, includeCharts = false } = options;
    
    const doc = new jsPDF();
    let yPosition = 20;

    // En-tête
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Kinshasa-Alerte', 20, yPosition);
    
    yPosition += 10;
    doc.setFontSize(16);
    doc.text(title, 20, yPosition);
    
    yPosition += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
    
    yPosition += 10;
    doc.text(`Total de signalements: ${reports.length}`, 20, yPosition);

    // Filtres appliqués
    if (filters) {
      yPosition += 15;
      doc.setFont('helvetica', 'bold');
      doc.text('Filtres appliqués:', 20, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      
      if (filters.status) {
        doc.text(`- Statut: ${filters.status}`, 25, yPosition);
        yPosition += 6;
      }
      if (filters.commune) {
        doc.text(`- Commune: ${filters.commune}`, 25, yPosition);
        yPosition += 6;
      }
      if (filters.dateRange) {
        doc.text(`- Période: ${filters.dateRange.start.toLocaleDateString('fr-FR')} - ${filters.dateRange.end.toLocaleDateString('fr-FR')}`, 25, yPosition);
        yPosition += 6;
      }
    }

    // Statistiques
    yPosition += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Statistiques:', 20, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');

    const statusCount = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCount = reports.reduce((acc, report) => {
      acc[report.priority] = (acc[report.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Statuts
    doc.text('Par statut:', 25, yPosition);
    yPosition += 6;
    Object.entries(statusCount).forEach(([status, count]) => {
      const statusName = status === 'pending' ? 'En attente' :
                        status === 'in-progress' ? 'En cours' :
                        status === 'resolved' ? 'Résolu' : 'Rejeté';
      doc.text(`  ${statusName}: ${count}`, 30, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    doc.text('Par priorité:', 25, yPosition);
    yPosition += 6;
    Object.entries(priorityCount).forEach(([priority, count]) => {
      const priorityName = priority === 'low' ? 'Faible' :
                          priority === 'medium' ? 'Moyenne' :
                          priority === 'high' ? 'Élevée' : 'Critique';
      doc.text(`  ${priorityName}: ${count}`, 30, yPosition);
      yPosition += 6;
    });

    // Liste des signalements
    yPosition += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Détail des signalements:', 20, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');

    reports.forEach((report, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${report.description.substring(0, 50)}...`, 20, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Commune: ${report.commune?.name || 'Inconnue'}`, 25, yPosition);
      yPosition += 6;
      
      const statusName = report.status === 'pending' ? 'En attente' :
                        report.status === 'in-progress' ? 'En cours' :
                        report.status === 'resolved' ? 'Résolu' : 'Rejeté';
      doc.text(`Statut: ${statusName}`, 25, yPosition);
      yPosition += 6;
      
      const priorityName = report.priority === 'low' ? 'Faible' :
                          report.priority === 'medium' ? 'Moyenne' :
                          report.priority === 'high' ? 'Élevée' : 'Critique';
      doc.text(`Priorité: ${priorityName}`, 25, yPosition);
      yPosition += 6;
      
      doc.text(`Date: ${new Date(report.created_at).toLocaleDateString('fr-FR')}`, 25, yPosition);
      yPosition += 8;
    });

    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} sur ${pageCount}`, 20, 290);
      doc.text('Kinshasa-Alerte - Rapport généré automatiquement', 20, 295);
    }

    // Sauvegarder le PDF
    const fileName = `rapport_${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }

  static async generateDashboardReport(reports: ReportData[], userRole: string, communeName?: string): Promise<void> {
    const title = userRole === 'admin' 
      ? 'Rapport Global - Administrateur'
      : `Rapport Commune - ${communeName || 'Bourgmestre'}`;

    await this.generateReport({
      title,
      reports,
      includeCharts: false
    });
  }
} 
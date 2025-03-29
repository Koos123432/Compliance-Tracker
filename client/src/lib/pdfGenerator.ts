import { Inspection, Breach, Person } from '@shared/schema';
import { format } from 'date-fns';

// This is a simple PDF generation utility that returns a PDF as a blob
export async function generateInspectionReport(
  inspection: Inspection,
  breaches: Breach[],
  people: Person[],
  photos: { id: number; photoUrl: string; description?: string }[]
): Promise<{ blob: Blob; filename: string }> {
  // In a real implementation, we would use a library like pdf-lib or jspdf
  // to generate a proper PDF. This is a simplified version for the demo.
  
  // Create HTML content for the report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Inspection Report: ${inspection.inspectionNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1976D2;
          margin-bottom: 5px;
        }
        .section {
          margin-bottom: 30px;
        }
        .section h2 {
          color: #1976D2;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .info-item {
          margin-bottom: 10px;
        }
        .info-label {
          font-weight: bold;
          display: block;
        }
        .breach-item {
          background-color: #f8f8f8;
          border-left: 4px solid #FF9800;
          padding: 15px;
          margin-bottom: 15px;
        }
        .breach-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .breach-severity {
          font-weight: bold;
        }
        .severity-minor { color: #4CAF50; }
        .severity-moderate { color: #FF9800; }
        .severity-major { color: #F44336; }
        .severity-critical { color: #B71C1C; }
        .photo-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 10px;
        }
        .photo-item img {
          width: 100%;
          height: auto;
          border: 1px solid #ddd;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Inspection Report</h1>
        <p>${inspection.inspectionNumber} - ${format(new Date(inspection.inspectionDate), 'MMMM d, yyyy')}</p>
      </div>
      
      <div class="section">
        <h2>Site Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Site Address:</span>
            ${inspection.siteAddress}
          </div>
          <div class="info-item">
            <span class="info-label">DA Number:</span>
            ${inspection.daNumber || 'Not specified'}
          </div>
          <div class="info-item">
            <span class="info-label">Principal Contractor:</span>
            ${inspection.principalContractor || 'Not specified'}
          </div>
          <div class="info-item">
            <span class="info-label">License Number:</span>
            ${inspection.licenseNumber || 'Not specified'}
          </div>
          <div class="info-item">
            <span class="info-label">PCA:</span>
            ${inspection.pca || 'Not specified'}
          </div>
          <div class="info-item">
            <span class="info-label">Inspection Date:</span>
            ${format(new Date(inspection.inspectionDate), 'MMMM d, yyyy h:mm a')}
          </div>
        </div>
      </div>
      
      ${breaches.length > 0 ? `
      <div class="section">
        <h2>Compliance Breaches</h2>
        ${breaches.map(breach => `
          <div class="breach-item">
            <div class="breach-title">${breach.title}</div>
            <p>${breach.description}</p>
            ${breach.legislation ? `<p><strong>Legislation:</strong> ${breach.legislation}</p>` : ''}
            ${breach.daConditionNumber ? `<p><strong>DA Condition Number:</strong> ${breach.daConditionNumber}</p>` : ''}
            ${breach.recommendedAction ? `<p><strong>Recommended Action:</strong> ${breach.recommendedAction}</p>` : ''}
            ${breach.resolutionDeadline ? `<p><strong>Resolution Deadline:</strong> ${format(new Date(breach.resolutionDeadline), 'MMMM d, yyyy')}</p>` : ''}
            <p><strong>Severity:</strong> <span class="breach-severity severity-${breach.severity.toLowerCase()}">${breach.severity}</span></p>
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${people.length > 0 ? `
      <div class="section">
        <h2>People on Site</h2>
        ${people.map(person => `
          <div class="info-item">
            <span class="info-label">${person.name}</span>
            ${person.role ? `<p>Role: ${person.role}</p>` : ''}
            ${person.licenseNumber ? `<p>License: ${person.licenseNumber}</p>` : ''}
            ${person.contactNumber ? `<p>Contact: ${person.contactNumber}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${photos.length > 0 ? `
      <div class="section">
        <h2>Site Photos</h2>
        <div class="photo-grid">
          ${photos.map(photo => `
            <div class="photo-item">
              <img src="${photo.photoUrl}" alt="Site photo" />
              ${photo.description ? `<p>${photo.description}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${inspection.notes ? `
      <div class="section">
        <h2>Notes</h2>
        <p>${inspection.notes}</p>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Generated on ${format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
        <p>ComplianceWorks Inspection Management System</p>
      </div>
    </body>
    </html>
  `;
  
  // Convert HTML to a Blob
  const blob = new Blob([htmlContent], { type: 'text/html' });
  
  // In a real implementation, we would convert this HTML to PDF here
  // For the demo, we'll just return the HTML blob
  
  return {
    blob,
    filename: `${inspection.inspectionNumber}_report.html`
  };
}

// Helper function to create a downloadable link for the PDF
export function downloadReport(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Helper function to send the report via email
export function emailReport(
  blob: Blob, 
  recipient: string, 
  subject: string, 
  body: string
): Promise<boolean> {
  // In a real implementation, we would send this to the server
  // which would handle the email sending
  
  // This is a mock implementation
  console.log(`Sending email to ${recipient}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log(`Attachment: ${blob.size} bytes`);
  
  return new Promise((resolve) => {
    // Simulate a delay
    setTimeout(() => {
      resolve(true);
    }, 1500);
  });
}

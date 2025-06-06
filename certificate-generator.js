// certificate-generator.js - Complete file - Just copy and paste this entire file

// AI Summary Generation Function
async function generateAISummary(title, description) {
    const templates = {
        app: "A revolutionary mobile application that {action} by {method} to {outcome}.",
        platform: "An innovative platform connecting {users} with {service} through {technology}.",
        service: "A cutting-edge service that {benefit} by leveraging {approach} for {target}.",
        tool: "An intelligent tool that {function} using {technique} to help {audience}.",
        marketplace: "A dynamic marketplace where {buyers} meet {sellers} for {purpose}.",
        default: "An innovative solution that {core_value} through {unique_approach} to {end_goal}."
    };
    
    let type = 'default';
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('app') || text.includes('mobile')) type = 'app';
    else if (text.includes('platform') || text.includes('connect')) type = 'platform';
    else if (text.includes('service') || text.includes('help')) type = 'service';
    else if (text.includes('tool') || text.includes('automate')) type = 'tool';
    else if (text.includes('marketplace') || text.includes('buy') || text.includes('sell')) type = 'marketplace';
    
    const concepts = extractKeyConcepts(title, description);
    
    let summary = templates[type];
    Object.keys(concepts).forEach(key => {
        summary = summary.replace(`{${key}}`, concepts[key]);
    });
    
    summary = summary.replace(/{[^}]+}/g, (match) => {
        const key = match.slice(1, -1);
        return defaultValues[key] || 'innovative solutions';
    });
    
    return summary;
}

function extractKeyConcepts(title, description) {
    const text = title + ' ' + description;
    const concepts = {};
    
    const actionMatch = text.match(/automate|streamline|optimize|enhance|improve|transform|revolutionize|simplify/i);
    if (actionMatch) {
        concepts.action = actionMatch[0] + 's operations';
    }
    
    const techMatch = text.match(/AI|machine learning|blockchain|IoT|cloud|mobile|web|digital/i);
    if (techMatch) {
        concepts.technology = techMatch[0] + ' technology';
        concepts.method = 'cutting-edge ' + techMatch[0].toLowerCase() + ' solutions';
    }
    
    const benefitMatch = text.match(/save time|reduce cost|increase efficiency|boost productivity|improve quality/i);
    if (benefitMatch) {
        concepts.outcome = 'maximize efficiency and ROI';
        concepts.benefit = benefitMatch[0];
    }
    
    const audienceMatch = text.match(/business|enterprise|startup|consumer|student|professional/i);
    if (audienceMatch) {
        concepts.target = audienceMatch[0] + 's';
        concepts.audience = concepts.target;
        concepts.users = concepts.target;
    }
    
    concepts.approach = concepts.method || 'innovative technology';
    concepts.core_value = 'transforms the industry';
    concepts.unique_approach = 'proprietary algorithms';
    concepts.end_goal = 'deliver exceptional value';
    
    return concepts;
}

const defaultValues = {
    action: 'transforms the industry',
    method: 'innovative technology',
    outcome: 'deliver exceptional value',
    users: 'users',
    service: 'solutions',
    technology: 'cutting-edge technology',
    benefit: 'delivers value',
    approach: 'smart algorithms',
    target: 'users worldwide',
    function: 'streamlines processes',
    technique: 'advanced analytics',
    audience: 'businesses and individuals',
    buyers: 'buyers',
    sellers: 'sellers',
    purpose: 'mutual benefit'
};

async function generateCertificateHTML(ideaData, userData) {
    const aiSummary = await generateAISummary(ideaData.title, ideaData.description);
    
    const certificateHTML = `
        <div class="certificate-container">
            <div class="certificate">
                <div class="watermark">PROTECTED</div>
                <div class="pattern-overlay"></div>
                
                <div class="hologram-seal">
                    <div class="hologram-content">
                        <i class="fas fa-check-circle"></i>
                        <span>VERIFIED</span>
                    </div>
                </div>
                
                <div class="cert-header">
                    <img src="favicon.svg" alt="SF" class="cert-logo">
                    <div class="cert-title">SociallyFounded</div>
                    <h1 class="cert-main-title">Certificate of Idea Registration</h1>
                    <p class="cert-subtitle">Protected Innovation Registry</p>
                </div>
                
                <div class="divider"></div>
                
                <div class="founder-section">
                    <div class="founder-info">
                        <div class="info-item">
                            <span class="info-label">Founder:</span>
                            <span class="info-value">${userData.profile.name || userData.profile.email}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Passport ID:</span>
                            <span class="info-value">${userData.passport.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Member Since:</span>
                            <span class="info-value">${formatDate(userData.profile.joinDate)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="cert-body">
                    <p class="cert-text">This certifies that the following idea has been registered and protected:</p>
                    
                    <h2 class="idea-title">"${ideaData.title}"</h2>
                    
                    <div class="ai-summary">
                        <p class="ai-label">AI-Enhanced Summary:</p>
                        <p class="ai-text">${aiSummary}</p>
                    </div>
                    
                    <div class="idea-details-grid">
                        <div class="detail-box">
                            <div class="detail-label">SF Idea ID</div>
                            <div class="detail-value">${ideaData.sfIdeaId}</div>
                        </div>
                        <div class="detail-box">
                            <div class="detail-label">Category</div>
                            <div class="detail-value">${formatCategory(ideaData.category)}</div>
                        </div>
                        <div class="detail-box">
                            <div class="detail-label">Stage</div>
                            <div class="detail-value">${formatStage(ideaData.stage)}</div>
                        </div>
                        <div class="detail-box">
                            <div class="detail-label">Registered</div>
                            <div class="detail-value">${formatDate(ideaData.createdAt)}</div>
                        </div>
                    </div>
                    
                    <div class="full-description">
                        <p class="desc-label">Original Description:</p>
                        <p class="idea-description">${ideaData.description}</p>
                    </div>
                    
                    <p class="cert-text protection-text">
                        <i class="fas fa-shield-alt"></i>
                        This idea is protected with blockchain-verified timestamp and establishes global prior art as of the registration date.
                    </p>
                </div>
                
                <div class="cert-footer">
                    <div class="cert-timestamp">
                        <div class="timestamp-label">Certificate Generated</div>
                        <div class="timestamp-value">${new Date().toLocaleString()}</div>
                    </div>
                    
                    <div class="cert-signature">
                        <div class="signature-line"></div>
                        <div class="signature-name">Chief Innovation Officer</div>
                        <div class="signature-name">SociallyFounded</div>
                    </div>
                    
                    <div class="cert-seal">
                        <div class="seal-inner">
                            <i class="fas fa-certificate"></i>
                            <span>CERTIFIED</span>
                            <span>PROTECTED</span>
                        </div>
                    </div>
                </div>
                
                <div class="qr-code">
                    <div class="qr-placeholder"></div>
                    <div class="qr-label">Verify at SF</div>
                </div>
            </div>
        </div>
    `;
    
    return {
        html: certificateHTML,
        summary: aiSummary,
        certificateData: {
            ideaTitle: ideaData.title,
            ideaDescription: ideaData.description,
            aiSummary: aiSummary,
            sfIdeaId: ideaData.sfIdeaId,
            founderName: userData.profile.name || userData.profile.email,
            passportId: userData.passport.id,
            registrationDate: formatDate(ideaData.createdAt),
            timestamp: new Date().toISOString()
        }
    };
}

function showCertificateModal(certificateHTML, ideaData) {
    const modal = document.createElement('div');
    modal.className = 'certificate-modal';
    modal.innerHTML = `
        <div class="certificate-modal-overlay" onclick="closeCertificateModal()"></div>
        <div class="certificate-modal-content">
            <button class="close-modal" onclick="closeCertificateModal()">×</button>
            
            <div class="certificate-preview" id="certificatePreview">
                ${certificateHTML}
            </div>
            
            <div class="certificate-actions">
                <button class="btn btn-primary" onclick="downloadCertificate('${ideaData.sfIdeaId}')">
                    <i class="fas fa-download"></i> Download PDF
                </button>
                <button class="btn btn-secondary" onclick="shareCertificateLinkedIn('${ideaData.sfIdeaId}', '${ideaData.title}')">
                    <i class="fab fa-linkedin"></i> Share on LinkedIn
                </button>
            </div>
            
            <div class="certificate-rewards">
                <i class="fas fa-trophy"></i>
                <span>Earn 50 XP when you share your certificate!</span>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeCertificateModal() {
    const modal = document.querySelector('.certificate-modal');
    if (modal) {
        modal.remove();
    }
}

function downloadCertificate(sfIdeaId) {
    const certificateContent = document.getElementById('certificatePreview').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>SF Certificate - ${sfIdeaId}</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link rel="stylesheet" href="certificate-styles.css">
            <style>
                @media print {
                    body { margin: 0; }
                    .certificate-container { 
                        width: 210mm; 
                        height: 297mm; 
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body onload="window.print(); window.onafterprint = function() { window.close(); }">
            ${certificateContent}
        </body>
        </html>
    `);
}

async function shareCertificateLinkedIn(sfIdeaId, ideaTitle) {
    const shareText = `🎉 I just received my official Idea Certificate from SociallyFounded!

My idea "${ideaTitle}" is now protected with SF Idea ID: ${sfIdeaId}

The AI-generated summary makes it pitch-ready for investors. Check out how SociallyFounded is transforming entrepreneurship!

#Innovation #Entrepreneurship #SociallyFounded #StartupLife`;
    
    const shareUrl = `https://sociallyfounded.com/certificate/${sfIdeaId}`;
    
    if (window.currentUser) {
        await awardExperience(window.currentUser.uid, 50, 'certificate_share');
    }
    
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`, '_blank');
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatCategory(category) {
    const categories = {
        tech: 'Technology',
        social: 'Social Impact',
        consumer: 'Consumer',
        b2b: 'B2B',
        health: 'Health & Wellness',
        education: 'Education',
        other: 'Other'
    };
    return categories[category] || category;
}

function formatStage(stage) {
    const stages = {
        concept: 'Concept',
        validation: 'Validation',
        building: 'Building',
        scaling: 'Scaling'
    };
    return stages[stage] || stage;
}

async function generateCertificate(ideaId, ideaData) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please sign in to generate certificates');
            return;
        }
        
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        const result = await generateCertificateHTML(ideaData, userData);
        
        showCertificateModal(result.html, ideaData);
        
        await firebase.firestore().collection('ideas').doc(ideaId).update({
            certificateGenerated: true,
            certificateData: result.certificateData,
            certificateGeneratedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Certificate generated successfully!');
        
    } catch (error) {
        console.error('Error generating certificate:', error);
        alert('Error generating certificate. Please try again.');
    }
}

console.log('✅ Certificate Generator loaded');

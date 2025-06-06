// idea-system.js
// Ideas management system with SF Idea ID generation
// Sprint 2 - June 4, 2025
// Add this at the very beginning of idea-system.js, after the comments:

// Make getUserData available if not already defined
if (typeof getUserData === 'undefined') {
    window.getUserData = async function(userId) {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(userId)
                .get();
            
            return userDoc.exists ? userDoc.data() : {};
        } catch (error) {
            console.error('Error getting user data:', error);
            return {};
        }
    };
}
// Generate unique SF Idea ID
function generateIdeaId() {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `SF-IDEA-${dateStr}-${random}`;
}

// Create new idea
async function createIdea(ideaData) {
    const user = firebase.auth().currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const db = firebase.firestore();
    
    try {
        // Generate SF Idea ID
        const sfIdeaId = generateIdeaId();
        
        // Prepare idea document
        const idea = {
            userId: user.uid,
            sfIdeaId: sfIdeaId,
            title: ideaData.title,
            description: ideaData.description,
            category: ideaData.category || 'other',
            stage: ideaData.stage || 'concept',
            progress: 0,
            isPublic: ideaData.isPublic !== false,
            views: 0,
            interests: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            sharedOn: []
        };
        
        // Add to Firestore
        const docRef = await db.collection('ideas').add(idea);
        
        // Check if this is user's first idea
        const userData = await getUserData(user.uid);
        const isFirstIdea = (userData.stats?.ideasRegistered || 0) === 0;
        
        // Update user stats
        await db.collection('users').doc(user.uid).update({
            'stats.ideasRegistered': firebase.firestore.FieldValue.increment(1)
        });
        
        // Award XP for creating idea
        await awardExperience(user.uid, 100, 'Created new idea');
        
        // Log activity
        await db.collection('activities').add({
            userId: user.uid,
            type: 'idea_created',
            data: {
                ideaId: docRef.id,
                sfIdeaId: sfIdeaId,
                title: ideaData.title
            },
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Emit event for first idea (for social sharing)
        if (isFirstIdea) {
            window.dispatchEvent(new CustomEvent('ideaPublished', {
                detail: {
                    ideaId: sfIdeaId,
                    isFirstIdea: true
                }
            }));
        }
        
        console.log('Idea created:', sfIdeaId);
        return docRef.id;
        
    } catch (error) {
        console.error('Error creating idea:', error);
        throw error;
    }
}

// Update idea progress
async function updateIdeaProgress(ideaId, newProgress) {
    const user = firebase.auth().currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const db = firebase.firestore();
    
    try {
        // Get current idea data
        const ideaDoc = await db.collection('ideas').doc(ideaId).get();
        if (!ideaDoc.exists) throw new Error('Idea not found');
        
        const ideaData = ideaDoc.data();
        if (ideaData.userId !== user.uid) throw new Error('Unauthorized');
        
        const oldProgress = ideaData.progress || 0;
        
        // Update progress
        await db.collection('ideas').doc(ideaId).update({
            progress: newProgress,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Award XP for progress milestones
        const milestones = [25, 50, 75, 100];
        for (const milestone of milestones) {
            if (oldProgress < milestone && newProgress >= milestone) {
                await awardExperience(user.uid, 25, `Idea progress: ${milestone}%`);
                
                // Emit event for 100% completion
                if (milestone === 100) {
                    window.dispatchEvent(new CustomEvent('ideaMilestone', {
                        detail: {
                            ideaId: ideaData.sfIdeaId,
                            milestone: 'completed'
                        }
                    }));
                }
            }
        }
        
        console.log('Idea progress updated:', newProgress);
        return true;
        
    } catch (error) {
        console.error('Error updating idea progress:', error);
        throw error;
    }
}

// Record idea view
async function recordIdeaView(ideaId) {
    const db = firebase.firestore();
    
    try {
        await db.collection('ideas').doc(ideaId).update({
            views: firebase.firestore.FieldValue.increment(1)
        });
        
        // Check for 100 views milestone
        const ideaDoc = await db.collection('ideas').doc(ideaId).get();
        if (ideaDoc.exists) {
            const views = ideaDoc.data().views;
            if (views === 100) {
                window.dispatchEvent(new CustomEvent('ideaMilestone', {
                    detail: {
                        ideaId: ideaDoc.data().sfIdeaId,
                        milestone: '100views'
                    }
                }));
            }
        }
        
    } catch (error) {
        console.error('Error recording view:', error);
    }
}

// Express interest in idea
async function expressInterest(ideaId) {
    const user = firebase.auth().currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const db = firebase.firestore();
    
    try {
        // Add user to interests array
        await db.collection('ideas').doc(ideaId).update({
            interests: firebase.firestore.FieldValue.arrayUnion(user.uid)
        });
        
        // Check if this triggers "hot idea" achievement
        const ideaDoc = await db.collection('ideas').doc(ideaId).get();
        if (ideaDoc.exists) {
            const interests = ideaDoc.data().interests || [];
            if (interests.length === 10) {
                // Award achievement to idea owner
                const ownerId = ideaDoc.data().userId;
                // This would trigger an achievement for the owner
            }
        }
        
        console.log('Interest expressed in idea:', ideaId);
        return true;
        
    } catch (error) {
        console.error('Error expressing interest:', error);
        throw error;
    }
}

// Get user's ideas
async function getUserIdeas(userId) {
    const db = firebase.firestore();
    
    try {
        const snapshot = await db.collection('ideas')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();
        
        const ideas = [];
        snapshot.forEach(doc => {
            ideas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ideas;
        
    } catch (error) {
        console.error('Error getting user ideas:', error);
        return [];
    }
}

// Get public ideas
async function getPublicIdeas(limit = 20) {
    const db = firebase.firestore();
    
    try {
        const snapshot = await db.collection('ideas')
            .where('isPublic', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();
        
        const ideas = [];
        snapshot.forEach(doc => {
            ideas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ideas;
        
    } catch (error) {
        console.error('Error getting public ideas:', error);
        return [];
    }
}

// Share idea on social media
async function shareIdea(ideaId, platform) {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const db = firebase.firestore();
    
    try {
        // Get idea data
        const ideaDoc = await db.collection('ideas').doc(ideaId).get();
        if (!ideaDoc.exists) return;
        
        const ideaData = ideaDoc.data();
        
        // Update shared platforms
        await db.collection('ideas').doc(ideaId).update({
            sharedOn: firebase.firestore.FieldValue.arrayUnion(platform)
        });
        
        // Award XP for sharing
        await awardExperience(user.uid, 10, `Shared idea on ${platform}`);
        
        // Prepare share content
        const shareText = `Check out my idea on SociallyFounded!\n\n${ideaData.title}\n\nSF Idea ID: ${ideaData.sfIdeaId}`;
        const shareUrl = `https://sociallyfounded.com/idea/${ideaId}`;
        
        // Open share window based on platform
        switch(platform) {
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`, '_blank');
                break;
        }
        
        console.log('Idea shared on:', platform);
        
    } catch (error) {
        console.error('Error sharing idea:', error);
    }
}

// ADD THESE NEW FUNCTIONS TO idea-system.js (don't replace the whole file)

// Update Idea Function
async function updateIdea(ideaId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showAuthModal();
            return;
        }

        const ideaDoc = await firebase.firestore().collection('ideas').doc(ideaId).get();
        const currentIdea = ideaDoc.data();
        
        if (currentIdea.userId !== user.uid) {
            alert('You can only update your own ideas!');
            return;
        }

        showUpdateIdeaModal(ideaId, currentIdea);
        
    } catch (error) {
        console.error('Error loading idea for update:', error);
        alert('Error loading idea. Please try again.');
    }
}

// Show Update Idea Modal
function showUpdateIdeaModal(ideaId, currentIdea) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Update Idea - Version ${currentIdea.version || 1}</h2>
                <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            
            <form id="updateIdeaForm" class="idea-form">
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" value="${currentIdea.title}" required maxlength="100">
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" required minlength="50" maxlength="2000">${currentIdea.description}</textarea>
                    <div class="char-count">${currentIdea.description.length}/2000</div>
                </div>
                
                <div class="form-group">
                    <label>Category</label>
                    <select name="category" required>
                        <option value="">Select Category</option>
                        <option value="tech" ${currentIdea.category === 'tech' ? 'selected' : ''}>Technology</option>
                        <option value="social" ${currentIdea.category === 'social' ? 'selected' : ''}>Social Impact</option>
                        <option value="consumer" ${currentIdea.category === 'consumer' ? 'selected' : ''}>Consumer Products</option>
                        <option value="b2b" ${currentIdea.category === 'b2b' ? 'selected' : ''}>B2B Solutions</option>
                        <option value="health" ${currentIdea.category === 'health' ? 'selected' : ''}>Health & Wellness</option>
                        <option value="education" ${currentIdea.category === 'education' ? 'selected' : ''}>Education</option>
                        <option value="other" ${currentIdea.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Stage</label>
                    <select name="stage" required>
                        <option value="concept" ${currentIdea.stage === 'concept' ? 'selected' : ''}>Concept</option>
                        <option value="validation" ${currentIdea.stage === 'validation' ? 'selected' : ''}>Validation</option>
                        <option value="building" ${currentIdea.stage === 'building' ? 'selected' : ''}>Building</option>
                        <option value="scaling" ${currentIdea.stage === 'scaling' ? 'selected' : ''}>Scaling</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Progress</label>
                    <input type="range" name="progress" min="0" max="100" value="${currentIdea.progress || 0}" 
                           oninput="this.nextElementSibling.textContent = this.value + '%'">
                    <span class="progress-value">${currentIdea.progress || 0}%</span>
                </div>
                
                <div class="form-group">
                    <label>Version Notes (What changed?)</label>
                    <textarea name="versionNotes" placeholder="Describe what you updated in this version..." required></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Save Version ${(currentIdea.version || 1) + 1}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('updateIdeaForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveIdeaUpdate(ideaId, currentIdea, new FormData(e.target));
    });
    
    const textarea = modal.querySelector('textarea[name="description"]');
    textarea.addEventListener('input', function() {
        this.nextElementSibling.textContent = `${this.value.length}/2000`;
    });
}

// Save Idea Update
async function saveIdeaUpdate(ideaId, currentIdea, formData) {
    try {
        const updateBtn = document.querySelector('#updateIdeaForm button[type="submit"]');
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        const currentVersion = currentIdea.version || 1;
        const newVersion = currentVersion + 1;
        
        const versionEntry = {
            version: currentVersion,
            title: currentIdea.title,
            description: currentIdea.description,
            category: currentIdea.category,
            stage: currentIdea.stage,
            progress: currentIdea.progress || 0,
            updatedAt: currentIdea.updatedAt || currentIdea.createdAt,
            versionNotes: currentIdea.versionNotes || 'Initial version'
        };
        
        const updateData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            stage: formData.get('stage'),
            progress: parseInt(formData.get('progress')),
            version: newVersion,
            versionNotes: formData.get('versionNotes'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            [`versionHistory.v${currentVersion}`]: versionEntry
        };
        
        const oldProgress = currentIdea.progress || 0;
        const newProgress = updateData.progress;
        const oldMilestone = Math.floor(oldProgress / 25);
        const newMilestone = Math.floor(newProgress / 25);
        
        await firebase.firestore().collection('ideas').doc(ideaId).update(updateData);
        
        if (newMilestone > oldMilestone) {
            const milestonesAchieved = newMilestone - oldMilestone;
            const xpReward = milestonesAchieved * 25;
            await window.awardExperience(xpReward, `Idea progress milestone${milestonesAchieved > 1 ? 's' : ''}`);
            
            showToast(`Version ${newVersion} saved! +${xpReward} XP for progress!`, 'success');
        } else {
            showToast(`Version ${newVersion} saved successfully!`, 'success');
        }
        
        await logActivity('idea_updated', {
            ideaId: ideaId,
            ideaTitle: updateData.title,
            newVersion: newVersion,
            progress: newProgress
        });
        
        document.querySelector('.modal-overlay').remove();
        await loadIdeas();
        
    } catch (error) {
        console.error('Error updating idea:', error);
        alert('Error updating idea. Please try again.');
        const updateBtn = document.querySelector('#updateIdeaForm button[type="submit"]');
        updateBtn.disabled = false;
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Save Update';
    }
}

// Show Version History
async function showVersionHistory(ideaId) {
    try {
        const ideaDoc = await firebase.firestore().collection('ideas').doc(ideaId).get();
        const idea = ideaDoc.data();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content version-history-modal">
                <div class="modal-header">
                    <h2>Version History - ${idea.title}</h2>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <div class="version-timeline">
                    ${generateVersionTimeline(idea)}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error loading version history:', error);
        alert('Error loading version history.');
    }
}

// Generate Version Timeline HTML
function generateVersionTimeline(idea) {
    let html = '';
    
    html += `
        <div class="version-item current">
            <div class="version-number">v${idea.version || 1}</div>
            <div class="version-content">
                <h4>${idea.title}</h4>
                <p class="version-date">Current Version - ${idea.updatedAt ? new Date(idea.updatedAt.toDate()).toLocaleDateString() : 'Now'}</p>
                <p class="version-notes">${idea.versionNotes || 'Latest version'}</p>
                <div class="version-meta">
                    <span><i class="fas fa-chart-line"></i> ${idea.progress || 0}% Complete</span>
                    <span><i class="fas fa-layer-group"></i> ${idea.stage}</span>
                </div>
            </div>
        </div>
    `;
    
    if (idea.versionHistory) {
        const versions = Object.entries(idea.versionHistory)
            .sort((a, b) => b[1].version - a[1].version);
            
        versions.forEach(([key, version]) => {
            html += `
                <div class="version-item">
                    <div class="version-number">v${version.version}</div>
                    <div class="version-content">
                        <h4>${version.title}</h4>
                        <p class="version-date">${version.updatedAt ? new Date(version.updatedAt.toDate()).toLocaleDateString() : ''}</p>
                        <p class="version-notes">${version.versionNotes || 'No notes'}</p>
                        <div class="version-meta">
                            <span><i class="fas fa-chart-line"></i> ${version.progress}% Complete</span>
                            <span><i class="fas fa-layer-group"></i> ${version.stage}</span>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    return html;
}



// Export functions
window.createIdea = createIdea;
window.updateIdeaProgress = updateIdeaProgress;
window.recordIdeaView = recordIdeaView;
window.expressInterest = expressInterest;
window.getUserIdeas = getUserIdeas;
window.getPublicIdeas = getPublicIdeas;
window.shareIdea = shareIdea;

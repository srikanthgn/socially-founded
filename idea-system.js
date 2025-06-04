// idea-system.js
// Ideas management system with SF Idea ID generation
// Sprint 2 - June 4, 2025

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

// Export functions
window.createIdea = createIdea;
window.updateIdeaProgress = updateIdeaProgress;
window.recordIdeaView = recordIdeaView;
window.expressInterest = expressInterest;
window.getUserIdeas = getUserIdeas;
window.getPublicIdeas = getPublicIdeas;
window.shareIdea = shareIdea;

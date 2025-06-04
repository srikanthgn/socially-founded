// share-triggers.js
// Automated share trigger system for 5 key moments
// Sprint 2, Day 1

// Initialize share triggers
window.ShareTriggers = {
    // Configuration for auto-prompts
    config: {
        // Delay before showing share prompt (ms)
        promptDelay: 2000,
        // Which events should auto-prompt
        autoPromptEvents: {
            signup: true,
            passportUpgrade: true,
            weekWarrior: true,
            monthlyMaster: true,
            firstIdea: true,
            level5: true,
            level10: true,
            level20: true
        }
    },

    // Initialize all triggers
    init() {
        // 1. New Member Signup Trigger
        this.initSignupTrigger();
        
        // 2. Passport Upgrade Triggers
        this.initPassportUpgradeTrigger();
        
        // 3. Achievement Unlock Triggers
        this.initAchievementTriggers();
        
        // 4. Level Milestone Triggers
        this.initLevelTriggers();
        
        // 5. Idea Milestone Triggers
        this.initIdeaTriggers();
        
        console.log('Share triggers initialized');
    },

    // 1. SIGNUP TRIGGER - When user first creates account
    initSignupTrigger() {
        // Check if this is a new user on passport page load
        if (window.location.pathname.includes('passport.html')) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    const userData = await this.getUserData(user.uid);
                    
                    // Check if user is new (joined in last 10 minutes)
                    const joinDate = userData.profile?.joinDate?.toDate();
                    const isNewUser = joinDate && (Date.now() - joinDate.getTime()) < 10 * 60 * 1000;
                    
                    // Check if they haven't shared signup yet
                    const hasSharedSignup = userData.sharedMilestones?.signup;
                    
                    if (isNewUser && !hasSharedSignup && this.config.autoPromptEvents.signup) {
                        // Show share prompt after delay
                        setTimeout(() => {
                            this.showSharePrompt('signup', {
                                passportId: userData.passport?.id,
                                name: userData.profile?.name
                            });
                        }, this.config.promptDelay);
                    }
                }
            });
        }
    },

    // 2. PASSPORT UPGRADE TRIGGER
    initPassportUpgradeTrigger() {
        // Listen for passport tier changes
        window.addEventListener('passportUpgrade', async (event) => {
            const { oldTier, newTier } = event.detail;
            
            // Only trigger for actual upgrades
            const tierOrder = ['navy', 'burgundy', 'gold', 'platinum'];
            if (tierOrder.indexOf(newTier) > tierOrder.indexOf(oldTier)) {
                const user = firebase.auth().currentUser;
                if (user) {
                    const userData = await this.getUserData(user.uid);
                    
                    if (this.config.autoPromptEvents.passportUpgrade) {
                        setTimeout(() => {
                            this.showSharePrompt(`passportUpgrade.${newTier}`, {
                                passportTier: newTier,
                                passportId: userData.passport?.id,
                                name: userData.profile?.name
                            });
                        }, this.config.promptDelay);
                    }
                }
            }
        });
    },

    // 3. ACHIEVEMENT UNLOCK TRIGGERS
    initAchievementTriggers() {
        window.addEventListener('achievementUnlocked', async (event) => {
            const achievement = event.detail;
            const shareableAchievements = ['week_warrior', 'monthly_master', 'first_checkin'];
            
            if (shareableAchievements.includes(achievement.key) && 
                this.config.autoPromptEvents[achievement.key]) {
                
                const user = firebase.auth().currentUser;
                if (user) {
                    const userData = await this.getUserData(user.uid);
                    
                    setTimeout(() => {
                        this.showSharePrompt(`achievement.${achievement.key}`, {
                            achievementName: achievement.name,
                            passportId: userData.passport?.id,
                            name: userData.profile?.name,
                            stats: {
                                level: userData.passport?.level || 1,
                                xp: userData.passport?.experience || 0,
                                streak: userData.passport?.streak || 0,
                                checkIns: userData.passport?.totalCheckIns || 0
                            }
                        });
                    }, this.config.promptDelay);
                }
            }
        });
    },

    // 4. LEVEL MILESTONE TRIGGERS
    initLevelTriggers() {
        window.addEventListener('levelUp', async (event) => {
            const { newLevel } = event.detail;
            const milestones = [5, 10, 15, 20, 25, 30, 40, 50];
            
            if (milestones.includes(newLevel) && 
                this.config.autoPromptEvents[`level${newLevel}`]) {
                
                const user = firebase.auth().currentUser;
                if (user) {
                    const userData = await this.getUserData(user.uid);
                    
                    setTimeout(() => {
                        this.showSharePrompt(`level.${newLevel}`, {
                            level: newLevel,
                            passportId: userData.passport?.id,
                            name: userData.profile?.name,
                            stats: {
                                level: newLevel,
                                xp: userData.passport?.experience || 0,
                                streak: userData.passport?.streak || 0,
                                checkIns: userData.passport?.totalCheckIns || 0
                            }
                        });
                    }, this.config.promptDelay);
                }
            }
        });
    },

    // 5. IDEA MILESTONE TRIGGERS
    initIdeaTriggers() {
        // First idea published
        window.addEventListener('ideaPublished', async (event) => {
            const { ideaId, isFirstIdea } = event.detail;
            
            if (isFirstIdea && this.config.autoPromptEvents.firstIdea) {
                const user = firebase.auth().currentUser;
                if (user) {
                    const userData = await this.getUserData(user.uid);
                    
                    setTimeout(() => {
                        this.showSharePrompt('idea.first', {
                            ideaId: ideaId,
                            passportId: userData.passport?.id,
                            name: userData.profile?.name
                        });
                    }, this.config.promptDelay);
                }
            }
        });
        
        // Idea reaches 100 views
        window.addEventListener('ideaMilestone', async (event) => {
            const { ideaId, milestone } = event.detail;
            
            if (milestone === '100views') {
                const user = firebase.auth().currentUser;
                if (user) {
                    const userData = await this.getUserData(user.uid);
                    
                    setTimeout(() => {
                        this.showSharePrompt('idea.milestone', {
                            ideaId: ideaId,
                            milestone: '100 views',
                            passportId: userData.passport?.id,
                            name: userData.profile?.name
                        });
                    }, this.config.promptDelay);
                }
            }
        });
    },

    // Show share prompt with smart timing
    showSharePrompt(shareType, data) {
        // Check if user has already shared this type today
        const today = new Date().toDateString();
        const shareKey = `${shareType}_${today}`;
        const hasSharedToday = localStorage.getItem(shareKey);
        
        if (hasSharedToday) {
            console.log('User already shared this type today');
            return;
        }
        
        // Create a subtle notification first
        this.showShareNotification(shareType, data);
    },

    // Show notification before modal
    showShareNotification(shareType, data) {
        const notification = document.createElement('div');
        notification.className = 'share-notification';
        notification.innerHTML = `
            <div class="share-notification-content">
                <div class="share-notification-icon">🎉</div>
                <div class="share-notification-text">
                    <strong>Congratulations!</strong>
                    <p>Share your achievement and earn 5 XP</p>
                </div>
                <div class="share-notification-actions">
                    <button class="share-now-btn" onclick="ShareTriggers.openShareModal('${shareType}')">
                        Share Now
                    </button>
                    <button class="share-later-btn" onclick="ShareTriggers.dismissNotification()">
                        Later
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Store data for later use
        this.pendingShare = { type: shareType, data: data };
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            this.dismissNotification();
        }, 10000);
    },

    // Open share modal from notification
    openShareModal(shareType) {
        this.dismissNotification();
        
        if (this.pendingShare) {
            // Use SocialSharing engine to create modal
            window.SocialSharing.triggerShare(
                this.pendingShare.type, 
                this.pendingShare.data
            );
            
            // Mark as shared today
            const today = new Date().toDateString();
            const shareKey = `${shareType}_${today}`;
            localStorage.setItem(shareKey, 'true');
        }
    },

    // Dismiss notification
    dismissNotification() {
        const notification = document.querySelector('.share-notification');
        if (notification) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    },

    // Helper to get user data
    async getUserData(userId) {
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
    },

    // Mark milestone as shared
    async markMilestoneShared(userId, milestone) {
        try {
            await firebase.firestore()
                .collection('users')
                .doc(userId)
                .update({
                    [`sharedMilestones.${milestone}`]: true
                });
        } catch (error) {
            console.error('Error marking milestone shared:', error);
        }
    }
};

// Notification styles
const notificationStyles = `
<style>
.share-notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 20px;
    max-width: 380px;
    z-index: 9999;
    animation: slideInRight 0.5s ease;
}

.share-notification-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.share-notification-icon {
    font-size: 32px;
}

.share-notification-text {
    flex: 1;
}

.share-notification-text strong {
    display: block;
    font-size: 16px;
    margin-bottom: 4px;
}

.share-notification-text p {
    margin: 0;
    font-size: 14px;
    color: #666;
}

.share-notification-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.share-now-btn, .share-later-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.share-now-btn {
    background: #003554;
    color: white;
}

.share-now-btn:hover {
    background: #002844;
}

.share-later-btn {
    background: #f0f0f0;
    color: #666;
}

.share-later-btn:hover {
    background: #e0e0e0;
}

.share-notification.fade-out {
    animation: fadeOut 0.3s ease;
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@media (max-width: 480px) {
    .share-notification {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
</style>
`;

// Add styles to page
document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ShareTriggers.init();
});

// Export for testing
window.ShareTriggers = ShareTriggers;

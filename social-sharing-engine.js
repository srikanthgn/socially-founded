// social-sharing-engine.js
// SociallyFounded Social Sharing Engine - Sprint 2, Day 1
// Created: June 4, 2025

// Initialize the sharing system
window.SocialSharing = {
    // Share templates for different events
    templates: {
        signup: {
            title: "I just joined SociallyFounded!",
            text: "I just joined SociallyFounded as Founding Member #{passportId}! Starting my entrepreneurial journey with a Digital Passport 🚀",
            hashtags: ["SociallyFounded", "DigitalPassport", "Entrepreneur"],
            imageType: "passport"
        },
        passportUpgrade: {
            burgundy: {
                title: "Leveled up to Burgundy Passport!",
                text: "Just upgraded to Burgundy Passport on SociallyFounded! 📕 My entrepreneurial journey is gaining momentum.",
                hashtags: ["BurgundyPassport", "SociallyFounded", "LevelUp"],
                imageType: "passport"
            },
            gold: {
                title: "Achieved Gold Passport status!",
                text: "Proud to achieve Gold Passport status on SociallyFounded! 🥇 Verified entrepreneur ready to build amazing things.",
                hashtags: ["GoldPassport", "SFVerified", "Entrepreneur"],
                imageType: "passport"
            },
            platinum: {
                title: "Elite Platinum Passport unlocked!",
                text: "Just unlocked the elite Platinum Passport on SociallyFounded! 💎 Certified entrepreneur at the highest level.",
                hashtags: ["PlatinumPassport", "SFCertified", "EliteEntrepreneur"],
                imageType: "passport"
            }
        },
        achievement: {
            week_warrior: {
                title: "7-day streak achieved!",
                text: "Just hit a 7-day streak on SociallyFounded! 🔥 Consistency is key to entrepreneurial success.",
                hashtags: ["WeekWarrior", "7DayStreak", "SociallyFounded"],
                imageType: "achievement"
            },
            monthly_master: {
                title: "30-day streak milestone!",
                text: "30 days of consistent entrepreneurial progress on SociallyFounded! 💎 Building momentum every day.",
                hashtags: ["MonthlyMaster", "30DayStreak", "Momentum"],
                imageType: "achievement"
            },
            first_checkin: {
                title: "First venue check-in!",
                text: "Just completed my first venue check-in on SociallyFounded! 👣 Every entrepreneurial journey starts with a single step.",
                hashtags: ["FirstCheckIn", "EntrepreneurialJourney", "SociallyFounded"],
                imageType: "achievement"
            }
        },
        level: {
            5: {
                title: "Reached Level 5!",
                text: "Just reached Level 5 Entrepreneur on SociallyFounded! 📈 Growing stronger with every check-in.",
                hashtags: ["Level5", "EntrepreneurGrowth", "SociallyFounded"],
                imageType: "level"
            },
            10: {
                title: "Level 10 Entrepreneur!",
                text: "Proud to reach Level 10 on SociallyFounded! 🎯 Double digits and just getting started.",
                hashtags: ["Level10", "Milestone", "SociallyFounded"],
                imageType: "level"
            },
            20: {
                title: "Level 20 Achievement!",
                text: "Level 20 Entrepreneur on SociallyFounded! 🚀 The journey continues to new heights.",
                hashtags: ["Level20", "Achievement", "EntrepreneurLife"],
                imageType: "level"
            }
        },
        idea: {
            first: {
                title: "Published my first idea!",
                text: "Just published my first protected idea on SociallyFounded! 💡 SF Idea ID secured. Time to build!",
                hashtags: ["FirstIdea", "SFIdeaID", "Innovation"],
                imageType: "idea"
            },
            milestone: {
                title: "Idea milestone reached!",
                text: "My idea on SociallyFounded just hit a major milestone! 🎯 Progress tracked and protected.",
                hashtags: ["IdeaMilestone", "Building", "SociallyFounded"],
                imageType: "idea"
            }
        }
    },

    // Platform-specific share URLs
    platforms: {
        linkedin: {
            baseUrl: "https://www.linkedin.com/sharing/share-offsite/",
            params: ["url"]
        },
        twitter: {
            baseUrl: "https://twitter.com/intent/tweet",
            params: ["text", "url", "hashtags"]
        },
        facebook: {
            baseUrl: "https://www.facebook.com/sharer/sharer.php",
            params: ["u"]
        },
        whatsapp: {
            baseUrl: "https://wa.me/",
            params: ["text"]
        }
    },

    // Generate share URL for a platform
    generateShareUrl(platform, content) {
        const config = this.platforms[platform];
        if (!config) return null;

        const params = new URLSearchParams();
        const shareUrl = "https://sociallyfounded.com/passport.html";
        
        switch(platform) {
            case 'linkedin':
                params.append('url', shareUrl);
                break;
            case 'twitter':
                params.append('text', content.text);
                params.append('url', shareUrl);
                params.append('hashtags', content.hashtags.join(','));
                break;
            case 'facebook':
                params.append('u', shareUrl);
                break;
            case 'whatsapp':
                const whatsappText = `${content.text}\n\n${shareUrl}`;
                params.append('text', whatsappText);
                break;
        }

        return `${config.baseUrl}?${params.toString()}`;
    },

    // Create share modal
    createShareModal(shareType, userData) {
        const template = this.getTemplate(shareType, userData);
        if (!template) return;

        // Create modal HTML
        const modalHtml = `
            <div id="share-modal" class="share-modal-overlay">
                <div class="share-modal-content">
                    <button class="share-close" onclick="SocialSharing.closeModal()">&times;</button>
                    <h2>Share Your Achievement! 🎉</h2>
                    
                    <div class="share-preview">
                        <div class="share-card" id="share-card">
                            <canvas id="share-canvas" width="1200" height="630"></canvas>
                        </div>
                        <p class="share-caption">${template.text}</p>
                    </div>
                    
                    <div class="share-buttons">
                        <button class="share-btn linkedin" onclick="SocialSharing.shareOn('linkedin')">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </button>
                        <button class="share-btn twitter" onclick="SocialSharing.shareOn('twitter')">
                            <i class="fab fa-twitter"></i> Twitter
                        </button>
                        <button class="share-btn facebook" onclick="SocialSharing.shareOn('facebook')">
                            <i class="fab fa-facebook"></i> Facebook
                        </button>
                        <button class="share-btn whatsapp" onclick="SocialSharing.shareOn('whatsapp')">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                    </div>
                    
                    <div class="share-rewards">
                        <p>🎁 Share to earn <strong>5 XP</strong>!</p>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Generate share image
        this.generateShareImage(template, userData);

        // Store current share data
        this.currentShare = {
            type: shareType,
            template: template,
            userData: userData
        };
    },

    // Generate share image on canvas
    generateShareImage(template, userData) {
        const canvas = document.getElementById('share-canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 1200;
        canvas.height = 630;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
        gradient.addColorStop(0, '#003554');
        gradient.addColorStop(1, '#006494');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 630);

        // Add pattern overlay
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 10; j++) {
                ctx.beginPath();
                ctx.arc(i * 60 + 30, j * 60 + 30, 20, 0, 2 * Math.PI);
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
            }
        }
        ctx.globalAlpha = 1;

        // SociallyFounded logo
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px Poppins, sans-serif';
        ctx.fillText('SociallyFounded', 60, 60);

        // Main content area
        const contentX = 60;
        const contentY = 150;

        // User passport info
        if (userData.photoURL) {
            // Draw user photo placeholder
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(contentX + 60, contentY + 60, 60, 0, 2 * Math.PI);
            ctx.fill();
        }

        // User name
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Poppins, sans-serif';
        ctx.fillText(userData.name || 'Entrepreneur', contentX + 150, contentY + 50);

        // Passport ID
        ctx.font = '32px Poppins, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(userData.passportId || 'SF-000000', contentX + 150, contentY + 100);

        // Achievement/Level info
        ctx.font = 'bold 64px Poppins, sans-serif';
        ctx.fillStyle = '#ffffff';
        const mainText = this.getMainText(template.imageType, userData);
        ctx.fillText(mainText, contentX, contentY + 250);

        // Stats row
        if (userData.stats) {
            ctx.font = '28px Poppins, sans-serif';
            ctx.fillStyle = '#ffffff';
            const statsY = contentY + 350;
            
            // Level
            ctx.fillText(`Level ${userData.stats.level}`, contentX, statsY);
            
            // XP
            ctx.fillText(`${userData.stats.xp} XP`, contentX + 200, statsY);
            
            // Streak
            ctx.fillText(`🔥 ${userData.stats.streak} days`, contentX + 400, statsY);
            
            // Check-ins
            ctx.fillText(`📍 ${userData.stats.checkIns} check-ins`, contentX + 600, statsY);
        }

        // Call to action
        ctx.font = '24px Poppins, sans-serif';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Join me at sociallyfounded.com', contentX, 550);

        // QR code placeholder
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(1000, 430, 140, 140);
        ctx.fillStyle = '#003554';
        ctx.font = '16px Poppins, sans-serif';
        ctx.fillText('QR Code', 1035, 505);
    },

    // Get main text for share card
    getMainText(imageType, userData) {
        switch(imageType) {
            case 'passport':
                return userData.passportTier ? 
                    `${userData.passportTier.toUpperCase()} PASSPORT` : 
                    'DIGITAL PASSPORT';
            case 'achievement':
                return userData.achievementName || 'ACHIEVEMENT UNLOCKED!';
            case 'level':
                return `LEVEL ${userData.level || '1'}`;
            case 'idea':
                return 'IDEA PUBLISHED';
            default:
                return 'MILESTONE REACHED!';
        }
    },

    // Get template based on share type
    getTemplate(shareType, userData) {
        const parts = shareType.split('.');
        let template = this.templates;
        
        for (const part of parts) {
            template = template[part];
            if (!template) return null;
        }

        // Replace variables in template
        if (userData) {
            template.text = template.text.replace('#{passportId}', userData.passportId || '');
        }

        return template;
    },

    // Share on specific platform
    async shareOn(platform) {
        if (!this.currentShare) return;

        const shareUrl = this.generateShareUrl(platform, this.currentShare.template);
        if (!shareUrl) return;

        // Open share window
        window.open(shareUrl, '_blank', 'width=600,height=400');

        // Track share and award XP
        await this.trackShare(platform);

        // Close modal after share
        setTimeout(() => this.closeModal(), 1000);
    },

    // Track share and award XP
    async trackShare(platform) {
        const user = firebase.auth().currentUser;
        if (!user) return;

        try {
            // Record share in Firestore
            await firebase.firestore().collection('shares').add({
                userId: user.uid,
                type: this.currentShare.type,
                platform: platform,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Award XP (max 1 per day per platform)
            const today = new Date().toDateString();
            const shareKey = `share_${platform}_${today}`;
            
            const userData = await getUserData(user.uid);
            if (!userData.dailyShares || !userData.dailyShares[shareKey]) {
                await awardExperience(user.uid, 5, `Shared on ${platform}`);
                
                // Update daily shares tracker
                await firebase.firestore().collection('users').doc(user.uid).update({
                    [`dailyShares.${shareKey}`]: true
                });

                // Show XP notification
                this.showXPNotification();
            }
        } catch (error) {
            console.error('Error tracking share:', error);
        }
    },

    // Show XP earned notification
    showXPNotification() {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = '+5 XP';
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    },

    // Close share modal
    closeModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.remove();
        }
        this.currentShare = null;
    },

    // Initialize auto-share triggers
    initAutoShareTriggers() {
        // Listen for achievements
        window.addEventListener('achievementUnlocked', (event) => {
            const achievement = event.detail;
            if (this.shouldAutoShare('achievement', achievement.key)) {
                setTimeout(() => {
                    this.triggerShare(`achievement.${achievement.key}`, {
                        achievementName: achievement.name
                    });
                }, 2000);
            }
        });

        // Listen for level ups
        window.addEventListener('levelUp', (event) => {
            const newLevel = event.detail.level;
            if ([5, 10, 15, 20].includes(newLevel)) {
                setTimeout(() => {
                    this.triggerShare(`level.${newLevel}`, {
                        level: newLevel
                    });
                }, 2000);
            }
        });

        // Listen for passport upgrades
        window.addEventListener('passportUpgrade', (event) => {
            const newTier = event.detail.tier;
            setTimeout(() => {
                this.triggerShare(`passportUpgrade.${newTier}`, {
                    passportTier: newTier
                });
            }, 2000);
        });
    },

    // Check if should auto-prompt share
    shouldAutoShare(type, key) {
        // Define which achievements should trigger auto-share
        const autoShareAchievements = [
            'week_warrior',
            'monthly_master',
            'first_checkin'
        ];

        return autoShareAchievements.includes(key);
    },

    // Trigger share flow
    async triggerShare(shareType, additionalData = {}) {
        const user = firebase.auth().currentUser;
        if (!user) return;

        // Get user data
        const userData = await getUserData(user.uid);
        
        const shareData = {
            name: userData.profile?.name || 'Entrepreneur',
            passportId: userData.passport?.id || 'SF-000000',
            photoURL: userData.profile?.photoURL,
            stats: {
                level: userData.passport?.level || 1,
                xp: userData.passport?.experience || 0,
                streak: userData.passport?.streak || 0,
                checkIns: userData.passport?.totalCheckIns || 0
            },
            ...additionalData
        };

        // Create and show share modal
        this.createShareModal(shareType, shareData);
    }
};

// CSS for share modal
const shareStyles = `
<style>
.share-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.share-modal-content {
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 800px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    animation: slideUp 0.3s ease;
}

.share-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    font-size: 32px;
    cursor: pointer;
    color: #666;
}

.share-preview {
    margin: 24px 0;
    text-align: center;
}

.share-card {
    background: #f5f5f5;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
}

#share-canvas {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.share-caption {
    font-size: 16px;
    color: #333;
    margin: 16px 0;
    padding: 0 20px;
}

.share-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
    margin: 24px 0;
}

.share-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.share-btn.linkedin {
    background: #0077B5;
    color: white;
}

.share-btn.twitter {
    background: #1DA1F2;
    color: white;
}

.share-btn.facebook {
    background: #1877F2;
    color: white;
}

.share-btn.whatsapp {
    background: #25D366;
    color: white;
}

.share-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.share-rewards {
    text-align: center;
    padding: 16px;
    background: #f0f8ff;
    border-radius: 8px;
    margin-top: 16px;
}

.xp-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 18px;
    animation: slideInRight 0.5s ease, fadeOut 0.5s ease 2.5s;
    z-index: 10001;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes slideInRight {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

@media (max-width: 768px) {
    .share-modal-content {
        padding: 20px;
    }
    
    .share-buttons {
        flex-direction: column;
    }
    
    .share-btn {
        width: 100%;
    }
}
</style>
`;

// Add styles to page
document.head.insertAdjacentHTML('beforeend', shareStyles);

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    SocialSharing.initAutoShareTriggers();
});

// Export for use in other files
window.SocialSharing = SocialSharing;

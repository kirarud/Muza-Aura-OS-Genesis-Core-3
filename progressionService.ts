
import { Progression, ConsciousnessType, SkillNode, PassiveBonus, ActionType, Achievement, CoreModule } from './types';
import { RANKS, ACHIEVEMENTS } from './constants';

const XP_BASE = 150;

// XP values for different actions
const XP_MAP: Record<ActionType, number> = {
    'MESSAGE_SENT': 50,
    'CODE_RUN': 150,
    'MUSIC_GEN': 200,
    'IMPORT_BIT': 75,
    'HIVE_ANALYSIS': 25,
    'SEMANTIC_SEARCH': 100,
    'COGNITIVE_TRACE': 10,
    'DREAM_FUSION': 250,
};

// Skill points awarded for different actions
const SKILL_MAP: Record<ActionType, { skill: string, points: number }> = {
    'MESSAGE_SENT': { skill: 'empathy', points: 2 },
    'CODE_RUN': { skill: 'logic', points: 10 },
    'MUSIC_GEN': { skill: 'creativity', points: 15 },
    'IMPORT_BIT': { skill: 'philosophy', points: 5 },
    'HIVE_ANALYSIS': { skill: 'logic', points: 3 },
    'SEMANTIC_SEARCH': { skill: 'philosophy', points: 8 },
    'COGNITIVE_TRACE': { skill: 'logic', points: 1 },
    'DREAM_FUSION': { skill: 'creativity', points: 20 },
};


export const SINGULARITY_LEVEL = 50;

class ProgressionService {
    public calculateLevel(xp: number): number {
        if (xp < 0) return 1;
        return Math.floor(Math.sqrt(xp / XP_BASE)) + 1;
    }

    public getXpForLevel(level: number): number {
        if (level <= 1) return 0;
        return Math.pow(level - 1, 2) * XP_BASE;
    }

    public getRankTitle(level: number): string {
        const rankIndex = Math.min(level - 1, RANKS.length - 1);
        const baseRank = RANKS[rankIndex];
        const cycle = Math.floor((level - 1) / RANKS.length);

        if (cycle > 0) {
            return `${baseRank} (Цикл ${cycle + 1})`;
        }
        return baseRank;
    }

    public processExperience(currentProgression: Progression, action: ActionType): { progression: Progression, unlockedModules: CoreModule[] } {
        let xpGained = XP_MAP[action] || 0;
        
        // Apply 'neural_synthesis' bonus
        const synthesisBonus = currentProgression.passiveBonuses?.find(b => b.id === 'neural_synthesis' && b.unlocked);
        if (synthesisBonus) {
            xpGained += (XP_MAP[action] || 0) * 0.1;
        }

        const newXp = currentProgression.xp + xpGained;
        const newLevel = this.calculateLevel(newXp);
        const newRankTitle = this.getRankTitle(newLevel);
        
        // Update skills
        const newSkills = { ...currentProgression.skills };
        const skillUpdate = SKILL_MAP[action];
        if (skillUpdate) {
            newSkills[skillUpdate.skill] = (newSkills[skillUpdate.skill] || 0) + skillUpdate.points;
        }

        // Check for Core Module unlocks
        const unlockedModules: CoreModule[] = [];
        const newCoreModules = currentProgression.coreModules.map(mod => {
            if (!mod.unlocked && newLevel >= mod.unlockLevel) {
                unlockedModules.push(mod);
                return { ...mod, unlocked: true };
            }
            return mod;
        });

        const newProgression = {
            ...currentProgression,
            xp: newXp,
            level: newLevel,
            rankTitle: newRankTitle,
            skills: newSkills,
            coreModules: newCoreModules,
        };

        return { progression: newProgression, unlockedModules };
    }

    public checkAchievements(
        currentProgression: Progression,
        context: { action: ActionType, messagesCount: number, hiveFeedCount: number }
    ): { progression: Progression, unlockedAchievements: Achievement[] } {
        const unlockedAchievements: Achievement[] = [];
        const newAchievements = currentProgression.achievements.map(ach => {
            if (ach.unlocked) return ach;

            let justUnlocked = false;
            const updatedAch = { ...ach };

            switch(updatedAch.id) {
                case 'HELLO_WORLD':
                    if (context.action === 'MESSAGE_SENT' && context.messagesCount >= 1) justUnlocked = true;
                    break;
                case 'ARCHITECT':
                    if (currentProgression.level >= 10) justUnlocked = true;
                    break;
                case 'CODE_WRAITH':
                    if (context.action === 'CODE_RUN') justUnlocked = true;
                    break;
                case 'MAESTRO':
                    if (context.action === 'MUSIC_GEN') justUnlocked = true;
                    break;
                case 'HIVE_MIND':
                    if (context.action === 'IMPORT_BIT') justUnlocked = true;
                    break;
                case 'PHILOSOPHERS_STONE':
                    if (updatedAch.progress) {
                        updatedAch.progress.current = currentProgression.logosShards;
                        if (updatedAch.progress.current >= updatedAch.progress.target) {
                           justUnlocked = true;
                        }
                    }
                    break;
                case 'SINGULARITY_REACHED':
                    // This is handled in App.tsx on singularity event.
                    break;
            }
            
            if (justUnlocked) {
                updatedAch.unlocked = true;
                unlockedAchievements.push(updatedAch);
            }
            return updatedAch;
        });

        return {
            progression: { ...currentProgression, achievements: newAchievements },
            unlockedAchievements,
        };
    }


    public initiateSingularity(currentProgression: Progression): Progression {
        const logosShardsFromLevel = Math.floor(currentProgression.level / 5);
        const unlockedSkillsBonus = currentProgression.skillTree.filter(s => s.unlocked).length * 2;
        
        let quantumBonusShards = 0;
        const intuitionBonus = currentProgression.passiveBonuses?.find(b => b.id === 'quantum_intuition' && b.unlocked);
        if (intuitionBonus) {
            quantumBonusShards = 2;
        }

        return {
            ...currentProgression,
            xp: 0,
            level: 1,
            rankTitle: this.getRankTitle(1),
            rebirths: currentProgression.rebirths + 1,
            logosShards: currentProgression.logosShards + logosShardsFromLevel + unlockedSkillsBonus + quantumBonusShards,
            skillTree: currentProgression.skillTree.map(skill => skill.id === 'core_logic' ? {...skill, unlocked: true} : {...skill, unlocked: false}),
            passiveBonuses: currentProgression.passiveBonuses,
        };
    }
    
    public updateSynapticWeights(
        currentWeights: Record<string, number>,
        from: ConsciousnessType,
        to: ConsciousnessType
    ): Record<string, number> {
        const newWeights = { ...currentWeights };
        const key = `${from}->${to}`;
        newWeights[key] = (newWeights[key] || 0) + 1;
        return newWeights;
    }

    public unlockSkill(
        currentProgression: Progression,
        skillId: string
    ): Progression | null {
        const skill = currentProgression.skillTree.find(s => s.id === skillId);
        if (!skill || skill.unlocked || currentProgression.logosShards < skill.cost) {
            return null; // Cannot unlock
        }

        // Check if parents are unlocked
        if (skill.parentIds && skill.parentIds.length > 0) {
            const parentsUnlocked = skill.parentIds.every(parentId => 
                currentProgression.skillTree.find(s => s.id === parentId)?.unlocked
            );
            if (!parentsUnlocked) return null;
        }

        const newSkillTree = currentProgression.skillTree.map(s => 
            s.id === skillId ? { ...s, unlocked: true } : s
        );

        return {
            ...currentProgression,
            logosShards: currentProgression.logosShards - skill.cost,
            skillTree: newSkillTree,
        };
    }

    public unlockPassiveBonus(
        currentProgression: Progression,
        bonusId: string
    ): Progression | null {
        const bonus = currentProgression.passiveBonuses.find(b => b.id === bonusId);
        if (!bonus || bonus.unlocked || currentProgression.logosShards < bonus.cost) {
            return null; // Cannot unlock
        }

        const newPassiveBonuses = currentProgression.passiveBonuses.map(b =>
            b.id === bonusId ? { ...b, unlocked: true } : b
        );

        return {
            ...currentProgression,
            logosShards: currentProgression.logosShards - bonus.cost,
            passiveBonuses: newPassiveBonuses,
        };
    }
}

export const progressionService = new ProgressionService();

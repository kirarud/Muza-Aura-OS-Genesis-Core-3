
import React, { useEffect, useRef } from 'react';
import { Progression, SkillNode, Achievement, PassiveBonus, CoreModule } from './types';
import { SINGULARITY_LEVEL } from './progressionService';
import { Rocket, Award, Brain, BarChart, MessageCircle, BookOpen, Star, Cpu, CheckCircle, Ghost, Music, Infinity, Share2, DraftingCompass } from 'lucide-react';
import d3 from './d3.js';

// Helper to get Lucide icon component by name
const iconMap: { [key: string]: React.ElementType } = {
    MessageCircle, Brain, Ghost, Music, Infinity, Share2, Award, DraftingCompass,
};

interface EvolutionProps {
    progression: Progression;
    synapticWeights: Record<string, number>;
    onInitiateSingularity: () => void;
    onUnlockSkill: (skillId: string) => void;
    onUnlockPassiveBonus: (bonusId: string) => void;
}

const SkillTreeGraph: React.FC<{ progression: Progression, onUnlockSkill: (skillId: string) => void }> = ({ progression, onUnlockSkill }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const { skillTree, logosShards } = progression;

    const canUnlock = (skill: SkillNode) => {
        if (skill.unlocked || logosShards < skill.cost) return false;
        if (skill.parentIds && skill.parentIds.length > 0) {
            return skill.parentIds.every(parentId =>
                skillTree.find(s => s.id === parentId)?.unlocked
            );
        }
        return true;
    };

    useEffect(() => {
        if (!svgRef.current || !d3) return;
        
        const parent = svgRef.current.parentElement;
        if (!parent) return;

        const width = parent.offsetWidth;
        const height = parent.offsetHeight;

        const nodes = skillTree.map(d => ({ ...d }));
        const linksData: { source: string; target: string }[] = [];
        skillTree.forEach(node => {
            if (node.parentIds) {
                node.parentIds.forEach(parentId => {
                    linksData.push({ source: parentId, target: node.id });
                });
            }
        });

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(linksData).id((d: any) => d.id).distance(90).strength(0.5))
            .force("charge", d3.forceManyBody().strength(-350))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05));

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        svg.selectAll("*").remove();

        const defs = svg.append("defs");
        const glowFilter = defs.append("filter")
            .attr("id", "skill-glow")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        glowFilter.append("feGaussianBlur")
            .attr("in", "SourceGraphic")
            .attr("stdDeviation", 3)
            .attr("result", "blur");
        glowFilter.append("feComposite")
            .attr("in", "SourceGraphic")
            .attr("in2", "blur")
            .attr("operator", "over");

        const link = svg.append("g")
            .attr("stroke-opacity", 0.4)
            .selectAll("line")
            .data(linksData)
            .join("line")
            .attr("stroke-width", 1.5)
            .attr("stroke", (d: any) => {
                const sourceNode = nodes.find(n => n.id === d.source.id);
                return sourceNode?.unlocked ? "var(--color-cyan-accent)" : "#475569";
            });

        const nodeGroups = svg.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .call(drag(simulation) as any);

        nodeGroups.append("circle")
            .attr("r", 22)
            .attr("stroke", (d: any) => {
                if (d.unlocked) return "var(--color-cyan-accent)";
                if (canUnlock(d)) return "var(--color-purple-accent)";
                return "#475569";
            })
            .attr("stroke-width", 1.5)
            .attr("fill", (d: any) => {
                if (d.unlocked) return "rgba(34, 211, 238, 0.2)";
                if (canUnlock(d)) return "rgba(192, 132, 252, 0.2)";
                return "#1e293b";
            })
            .style("filter", (d: any) => d.unlocked ? "url(#skill-glow)" : "none");

        nodeGroups.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .attr("fill", "#e2e8f0")
            .style("font-size", "9px")
            .style("pointer-events", "none")
            .text((d: any) => d.label);

        nodeGroups.append("title")
            .text((d: any) => `${d.description}\nСтоимость: ${d.cost} Осколков`);
        
        const unlockableNodes = nodeGroups
            .filter((d: any) => canUnlock(d));
            
        unlockableNodes.on("click", (event, d: any) => {
                onUnlockSkill(d.id);
            })
            .style("cursor", "pointer");

        unlockableNodes.select('circle').style("animation", "pulse-border 2.5s infinite");


        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);

            nodeGroups.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
        });

        function drag(simulation: any) {
            function dragstarted(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            function dragged(event: any, d: any) {
                d.fx = event.x;
                d.fy = event.y;
            }
            function dragended(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
        
        const styleEl = document.createElement('style');
        styleEl.innerHTML = `@keyframes pulse-border { 0%, 100% { stroke-width: 1.5px; } 50% { stroke-width: 3px; } }`;
        if(svgRef.current) {
            svgRef.current.appendChild(styleEl);
        }
        
        return () => {
            if (styleEl.parentElement) {
                styleEl.parentElement.removeChild(styleEl);
            }
        }

    }, [skillTree, logosShards, onUnlockSkill]);


    return (
        <div className="relative w-full h-full bg-slate-900/30 rounded-lg overflow-hidden">
            <svg ref={svgRef}></svg>
        </div>
    );
};

const SkillPointsView: React.FC<{ skills: Record<string, number> }> = ({ skills }) => {
    const skillData = [
        { name: 'Логика', value: skills.logic || 0, color: 'bg-cyan-400', icon: Brain },
        { name: 'Креативность', value: skills.creativity || 0, color: 'bg-purple-400', icon: BarChart },
        { name: 'Эмпатия', value: skills.empathy || 0, color: 'bg-amber-400', icon: MessageCircle },
        { name: 'Философия', value: skills.philosophy || 0, color: 'bg-emerald-400', icon: BookOpen },
    ];
    const maxValue = Math.max(100, ...skillData.map(s => s.value));

    return (
        <div className="bg-slate-900/30 rounded-lg p-4 h-full">
            <p className="text-sm text-slate-400 font-data mb-4">ПАРАМЕТРЫ СОЗНАНИЯ</p>
            <div className="space-y-3">
                {skillData.map(skill => (
                    <div key={skill.name}>
                        <div className="flex justify-between items-center text-xs font-data mb-1">
                            <span className="text-slate-300 flex items-center gap-1.5"><skill.icon size={12}/> {skill.name}</span>
                            <span className="text-slate-400">{skill.value}</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-1.5">
                            <div className={`${skill.color} h-1.5 rounded-full transition-all duration-300`} style={{ width: `${(skill.value / maxValue) * 100}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AchievementsView: React.FC<{ achievements: Achievement[] }> = ({ achievements }) => {
    const unlocked = achievements.filter(a => a.unlocked);
    return (
        <div className="bg-slate-900/30 rounded-lg p-4 h-full flex flex-col">
            <p className="text-sm text-slate-400 font-data mb-4 flex items-center gap-2"><Award size={14}/> ЗАЛ ДОСТИЖЕНИЙ ({unlocked.length}/{achievements.length})</p>
            <div className="grid grid-cols-5 gap-2 overflow-y-auto">
                {achievements.map(ach => {
                    const Icon = iconMap[ach.icon] || Award;
                    return (
                        <div key={ach.id} className="group relative" title={`${ach.title}: ${ach.description}`}>
                            <div className={`aspect-square rounded-md flex items-center justify-center transition-all duration-300 ${ach.unlocked ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-600'}`}>
                                <Icon size={24} />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

const PassiveBonusesView: React.FC<{ progression: Progression, onUnlock: (id: string) => void }> = ({ progression, onUnlock }) => {
    return (
        <div className="bg-slate-900/30 rounded-lg p-4 h-full flex flex-col">
            <p className="text-sm text-slate-400 font-data mb-4 flex items-center gap-2"><Star size={14} /> ПАССИВНЫЕ БОНУСЫ</p>
            <div className="space-y-2 overflow-y-auto">
                {progression.passiveBonuses.map(bonus => (
                     <div key={bonus.id} className={`p-2 rounded-md flex justify-between items-center transition-colors ${bonus.unlocked ? 'bg-purple-400/10' : 'bg-slate-800/50'}`}>
                         <div>
                             <p className="font-bold text-sm text-slate-100">{bonus.label}</p>
                             <p className="text-xs text-slate-400">{bonus.description}</p>
                         </div>
                         {!bonus.unlocked && (
                             <button
                                 onClick={() => onUnlock(bonus.id)}
                                 disabled={progression.logosShards < bonus.cost}
                                 className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-400 text-slate-900 font-bold py-1 px-3 rounded-md text-xs transition disabled:cursor-not-allowed whitespace-nowrap"
                                 title={`Стоимость: ${bonus.cost} Осколков`}
                             >
                                 ({bonus.cost})
                             </button>
                         )}
                     </div>
                ))}
            </div>
        </div>
    );
};

const CoreModulesView: React.FC<{ modules: CoreModule[] }> = ({ modules }) => (
    <div className="bg-slate-900/30 rounded-lg p-4 h-full flex flex-col">
        <p className="text-sm text-slate-400 font-data mb-4 flex items-center gap-2"><Cpu size={14}/> МОДУЛИ ЯДРА</p>
        <div className="space-y-2 overflow-y-auto">
            {modules.map(mod => (
                <div key={mod.id} className={`p-2 rounded-md transition-colors ${mod.unlocked ? 'bg-green-400/10' : 'bg-slate-800/50'}`}>
                    <div className="flex justify-between items-center">
                        <p className={`font-bold text-sm ${mod.unlocked ? 'text-green-300' : 'text-slate-100'}`}>{mod.label}</p>
                        {mod.unlocked ? <CheckCircle size={16} className="text-green-400" /> : <span className="text-xs font-data text-slate-500">Lvl {mod.unlockLevel}</span>}
                    </div>
                    <p className="text-xs text-slate-400">{mod.description}</p>
                </div>
            ))}
        </div>
    </div>
);


const Evolution: React.FC<EvolutionProps> = ({ progression, onInitiateSingularity, onUnlockSkill, onUnlockPassiveBonus }) => {
    const canInitiateSingularity = progression.level >= SINGULARITY_LEVEL;

    return (
        <div className="w-full h-full glass-panel rounded-xl p-6 flex flex-col text-slate-200">
            <div className="flex justify-between items-center border-b border-cyan-300/20 pb-2 mb-2">
                <h2 className="text-xl font-bold font-data text-cyan-300">
                    ЭВОЛЮЦИЯ ЯДРА
                </h2>
                {canInitiateSingularity && (
                     <button 
                        onClick={onInitiateSingularity}
                        className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-900/50 animate-pulse"
                    >
                        <Rocket size={16} /> СИНГУЛЯРНОСТЬ
                    </button>
                )}
            </div>
             <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm mb-4 font-data">
                <span><span className="text-slate-400">РАНГ:</span> <span className="text-purple-300">{progression.rankTitle} (Lvl {progression.level})</span></span>
                <span><span className="text-slate-400">ПЕРЕРОЖДЕНИЙ:</span> <span className="text-cyan-300">{progression.rebirths}</span></span>
                <span><span className="text-slate-400">ОСКОЛКИ ЛОГОСА:</span> <span className="text-amber-300">{progression.logosShards}</span></span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                <div className="lg:col-span-2 flex flex-col">
                     <p className="text-sm text-slate-400 font-data mb-2">ДРЕВО НАВЫКОВ</p>
                     <SkillTreeGraph progression={progression} onUnlockSkill={onUnlockSkill} />
                </div>
                <div className="grid grid-cols-2 grid-rows-2 gap-4 h-full overflow-hidden">
                   <CoreModulesView modules={progression.coreModules} />
                   <SkillPointsView skills={progression.skills} />
                   <PassiveBonusesView progression={progression} onUnlock={onUnlockPassiveBonus} />
                   <AchievementsView achievements={progression.achievements} />
                </div>
            </div>
        </div>
    );
};

export default Evolution;

/**
 * Synchronized Session Management based on the IELTS roadmap
 */
const Sessions = {
    async startPhase(groupId, phase) {
        const duration = TimerConfig[phase.toUpperCase()];
        const endTime = new Date(Date.now() + duration * 1000).toISOString();

        const { error } = await supabaseClient
            .from('groups')
            .update({ 
                active_phase: phase,
                phase_end_time: endTime
            })
            .eq('id', groupId);

        if (error) {
            console.error("Error starting phase:", error);
        } else {
            console.log(`Phase ${phase} started for group ${groupId}`);
        }
    },

    async syncTimer(groupId, displayElement) {
        const { data, error } = await supabaseClient
            .from('groups')
            .select('active_phase, phase_end_time')
            .eq('id', groupId)
            .single();

        if (data && data.phase_end_time) {
            const end = new Date(data.phase_end_time).getTime();
            const now = Date.now();
            const remaining = Math.max(0, Math.floor((end - now) / 1000));
            
            if (remaining > 0) {
                startTimer(remaining, displayElement, () => {
                    displayElement.innerText = "Phase Ended";
                });
            }
        }
    },

    // Real-time listener for phase changes
    subscribeToGroup(groupId, onUpdate) {
        return supabaseClient
            .channel(`group-${groupId}`)
            .on('postgres_changes', 
                { event: 'UPDATE', schema: 'public', table: 'groups', filter: `id=eq.${groupId}` }, 
                payload => onUpdate(payload.new))
            .subscribe();
    }
};

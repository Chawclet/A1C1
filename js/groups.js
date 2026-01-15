/**
 * Data handling for Groups and Group Memberships
 */
const Groups = {
    async fetchAllGroups() {
        const { data, error } = await supabaseClient
            .from('groups')
            .select(`
                *,
                group_memberships (
                    user_id,
                    users (id, role)
                )
            `);
        if (error) throw error;
        return data;
    },

    async fetchStudentGroups(userId) {
        const { data, error } = await supabaseClient
            .from('group_memberships')
            .select(`
                group_id,
                groups (*)
            `)
            .eq('user_id', userId);
        if (error) throw error;
        return data.map(m => m.groups);
    },

    async createGroup(name) {
        const { data, error } = await supabaseClient
            .from('groups')
            .insert([{ name }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteGroup(groupId) {
        const { error } = await supabaseClient
            .from('groups')
            .delete()
            .eq('id', groupId);
        if (error) throw error;
    },

    async addMember(groupId, userId) {
        const { error } = await supabaseClient
            .from('group_memberships')
            .insert([{ group_id: groupId, user_id: userId }]);
        if (error) throw error;
    },

    async removeMember(groupId, userId) {
        const { error } = await supabaseClient
            .from('group_memberships')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', userId);
        if (error) throw error;
    },

    async startLessonForGroup(groupId, lessonType) {
        alert(`Starting ${lessonType} for group ${groupId}`);
        // Logic to toggle materials for this group specifically
    }
};

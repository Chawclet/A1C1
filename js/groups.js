/**
 * Data handling for Groups and Group Memberships
 * Updated to handle 'teacher_id' requirement and 'student_id' column
 */
const Groups = {
    async fetchAllGroups() {
        const { data, error } = await supabaseClient
            .from('groups')
            .select(`
                *,
                group_memberships (
                    student_id,
                    users:student_id (id, role)
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
            .eq('student_id', userId);
        if (error) throw error;
        return data.map(m => m.groups);
    },

    async createGroup(name) {
        // Get the current user ID for the teacher_id column
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { data, error } = await supabaseClient
            .from('groups')
            .insert([{ 
                name: name,
                teacher_id: user.id 
            }])
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
            .insert([{ group_id: groupId, student_id: userId }]);
        if (error) throw error;
    },

    async removeMember(groupId, userId) {
        const { error } = await supabaseClient
            .from('group_memberships')
            .delete()
            .eq('group_id', groupId)
            .eq('student_id', userId);
        if (error) throw error;
    },

    async startLessonForGroup(groupId, lessonType) {
        alert(`Starting ${lessonType} for group ${groupId}`);
    }
};

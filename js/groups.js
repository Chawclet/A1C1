/**
 * Data handling for Groups and Group Memberships
 * Strictly following the provided DB structure.
 */
const Groups = {
    // Fetch all groups for the teacher
    async fetchAllGroups() {
        const { data, error } = await supabaseClient
            .from('groups')
            .select(`
                id,
                name,
                teacher_id,
                group_memberships (
                    student_id,
                    users:student_id (id, role)
                )
            `);
        if (error) throw error;
        return data;
    },

    // Fetch groups for the student
    async fetchStudentGroups(userId) {
        const { data, error } = await supabaseClient
            .from('group_memberships')
            .select(`
                group_id,
                groups (id, name, teacher_id)
            `)
            .eq('student_id', userId);
        if (error) throw error;
        return data.map(m => m.groups);
    },

    // Create a new group
    async createGroup(name) {
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

    // Delete a group
    async deleteGroup(groupId) {
        const { error } = await supabaseClient
            .from('groups')
            .delete()
            .eq('id', groupId);
        if (error) throw error;
    },

    // Add student to group
    async addMember(groupId, studentId) {
        const { error } = await supabaseClient
            .from('group_memberships')
            .insert([{ group_id: groupId, student_id: studentId }]);
        if (error) throw error;
    },

    // Remove student from group
    async removeMember(groupId, studentId) {
        const { error } = await supabaseClient
            .from('group_memberships')
            .delete()
            .eq('group_id', groupId)
            .eq('student_id', studentId);
        if (error) throw error;
    }
};

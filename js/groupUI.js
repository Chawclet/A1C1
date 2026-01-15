/**
 * UI Rendering for Groups
 * Updated with IELTS Session Flow buttons
 */
const GroupUI = {
    async renderTeacherGroups() {
        const container = document.getElementById('group-management');
        if (!container) return;

        try {
            const groups = await Groups.fetchAllGroups();
            const students = await this.getAvailableStudents();

            container.innerHTML = `
                <div class="card">
                    <h3>Group Management</h3>
                    <div style="display:flex; gap:5px; margin-bottom:15px;">
                        <input type="text" id="new-group-name" placeholder="New Group Name" style="flex:1">
                        <button onclick="GroupUI.handleCreateGroup()">Create</button>
                    </div>
                    <div id="groups-list"></div>
                </div>
            `;

            const list = document.getElementById('groups-list');
            groups.forEach(g => {
                const div = document.createElement('div');
                div.className = 'group-item card';
                div.style.borderLeft = "4px solid #007bff";
                div.style.marginBottom = "10px";
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>${g.name}</strong>
                        <button class="btn-danger" style="background:#ff4d4d; color:white; border:none; padding:2px 8px; border-radius:4px;" onclick="GroupUI.handleDeleteGroup('${g.id}')">Delete</button>
                    </div>
                    <div class="group-members" style="margin:10px 0; font-size:0.8rem;">
                        ${g.group_memberships.map(m => `
                            <span style="background:#eee; padding:2px 5px; margin-right:5px; border-radius:3px;">
                                ${m.users.id.substring(0,8)} 
                                <button style="border:none; background:none; cursor:pointer; color:red;" onclick="GroupUI.handleRemoveMember('${g.id}','${m.student_id}')">×</button>
                            </span>`).join('')}
                    </div>
                    <div style="display:flex; gap:5px; margin-bottom:10px;">
                        <select id="add-student-${g.id}" style="flex:1">
                            <option value="">Add Student...</option>
                            ${students.map(s => `<option value="${s.id}">${s.id.substring(0,8)}</option>`).join('')}
                        </select>
                        <button onclick="GroupUI.handleAddMember('${g.id}')">Add</button>
                    </div>
                    <div class="session-flow" style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button style="flex:1; background:#6c757d; font-size:0.65rem;" onclick="Sessions.startPhase('${g.id}', 'ICEBREAKER')">Icebreaker</button>
                        <button style="flex:1; background:#007bff; font-size:0.65rem;" onclick="Sessions.startPhase('${g.id}', 'READING')">Reading</button>
                        <button style="flex:1; background:#007bff; font-size:0.65rem;" onclick="Sessions.startPhase('${g.id}', 'LISTENING')">Listening</button>
                        <button style="flex:1; background:#28a745; font-size:0.65rem;" onclick="Sessions.startPhase('${g.id}', 'BREAK')">Break</button>
                        <button style="flex:1; background:#dc3545; font-size:0.65rem;" onclick="Sessions.startPhase('${g.id}', 'WRITING_SPEAKING')">W + S</button>
                    </div>
                `;
                list.appendChild(div);
            });
        } catch (err) {
            console.error("Group UI Error:", err);
        }
    },

    async renderStudentGroups(userId) {
        const container = document.getElementById('exercise-list');
        const groups = await Groups.fetchStudentGroups(userId);
        
        if (groups && groups.length > 0) {
            const groupInfo = document.createElement('div');
            groupInfo.className = 'card';
            groupInfo.style.background = "#e7f3ff";
            groupInfo.innerHTML = `<h4>Your Groups: ${groups.map(g => g.name).join(', ')}</h4><div id="active-session-timer" style="font-weight:bold; color:#007bff;">No active session</div>`;
            container.prepend(groupInfo);

            // Sync timer for the first group (MVP assumption: student is in one active group)
            Sessions.syncTimer(groups[0].id, document.getElementById('active-session-timer'));
            Sessions.subscribeToGroup(groups[0].id, (updatedGroup) => {
                Sessions.syncTimer(updatedGroup.id, document.getElementById('active-session-timer'));
            });
        }
    },

    async getAvailableStudents() {
        const { data } = await supabaseClient.from('users').select('id').eq('role', 'student');
        return data || [];
    },

    async handleCreateGroup() {
        const name = document.getElementById('new-group-name').value;
        if (name) {
            await Groups.createGroup(name);
            this.renderTeacherGroups();
        }
    },

    async handleDeleteGroup(id) {
        if (confirm('Delete this group?')) {
            await Groups.deleteGroup(id);
            this.renderTeacherGroups();
        }
    },

    async handleAddMember(groupId) {
        const userId = document.getElementById(`add-student-${groupId}`).value;
        if (userId) {
            await Groups.addMember(groupId, userId);
            this.renderTeacherGroups();
        }
    },

    async handleRemoveMember(groupId, userId) {
        await Groups.removeMember(groupId, userId);
        this.renderTeacherGroups();
    }
};

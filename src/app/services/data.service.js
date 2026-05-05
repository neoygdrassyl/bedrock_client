class DataService {
    getFullName() {
        return window.user.name + " " + window.user.surname;
    }
    getActive() {
        if (window.user.active == 1) { return 'Active'; }
        else { return 'Disabled'; }
    }
    getRoleName() {
        return window.user.role
    }
    getRoleDesc() {
        return window.user.roleDesc
    }
    getUserData(){
        if (!window.user) return null;
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            role_short: window.user.role_short,
            roleDesc: window.user.roleDesc,
            active: window.user.active,
            roleId: window.user.roleId,
            name_short: window.user.name_short,
            name_full: window.user.name_full,
        }
    }
    setUser(userData){
        window.user = userData;
        localStorage.setItem("dovela_user", JSON.stringify(userData));
    }
    setUserNull(){
        window.user = null;
        localStorage.removeItem("dovela_user");
        localStorage.removeItem("dovela_token");
    }
    saveToken(token) {
        localStorage.setItem("dovela_token", token);
    }
    getToken() {
        return localStorage.getItem("dovela_token");
    }
    restoreSession() {
        const token = localStorage.getItem("dovela_token");
        const userJson = localStorage.getItem("dovela_user");
        if (token && userJson) {
            try {
                window.user = JSON.parse(userJson);
                return true;
            } catch (e) {
                this.setUserNull();
                return false;
            }
        }
        return false;
    }
}

export default new DataService();
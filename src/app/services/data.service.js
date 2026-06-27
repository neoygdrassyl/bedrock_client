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
        return { ...window.user };
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
                return false;
            }
        }
        return false;
    }
}

export default new DataService();
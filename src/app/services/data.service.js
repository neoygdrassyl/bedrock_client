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
        return {
            id: window.user.id,
            name: window.user.name,
            surname: window.user.surname,
            role: window.user.role,
            active: window.user.active,
            roleId: window.user.roleId,
        }
    }
    setUser(userData){
        window.user = userData;
    }
    setUserNull(){
        window.user = null;
    }
}

export default new DataService();
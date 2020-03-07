const PERMISSION = require('../enums').PERMISSION;

module.exports = {
    isUserHasMasterPermission(permissionsArray) {
        return checkPermission(permissionsArray, PERMISSION.MASTER);
    },

    isUserHasAdminPermission(permissionsArray) {
        return checkPermission(permissionsArray, PERMISSION.ADMIN);
    },

    isUserHasRootPermission(permissionsArray) {
        return (this.isUserHasAdminPermission(permissionsArray) ||
            this.isUserHasMasterPermission(permissionsArray));
    }
};

function checkPermission(permissionsArray, permissionType) {
    return (permissionsArray && permissionsArray.includes(permissionType));
}
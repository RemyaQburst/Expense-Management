smartApp.service('ExpenseService', function ($q, $http, $firebaseObject, $firebaseArray) {

    return {
        getExpenseCategory: function () {
            return $firebaseArray(new Firebase(fibeBaseUrl + 'ExpenseCategory'));
        },
        getExpenseData: function () {
            return $firebaseArray(new Firebase(fibeBaseUrl + 'Expense'));
        },
        getRole: function () {
            return $firebaseObject(new Firebase(fibeBaseUrl + 'Role'));
        }

    }
});
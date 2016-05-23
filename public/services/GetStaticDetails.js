smartApp.service('GetStaticDetails', function ($q, $http) {
   
    this.getUsers = function () {
       /*return $http.get('./js/json/Users.json')
        .then(function (response) {
           return response.data;
        },
        function (errResponse) {
            $q.reject(errResponse.data);
        }
        );*/
        return $http.get('/api/login')
        .then(function (response) {
            return response.data;
        },
        function (errResponse) {
            $q.reject(errResponse.data);
        });
    }

    this.getProjects = function () {
        return $http.get('./js/json/Projects.json')
        .then(function (response) {
            return response.data;
        },
        function (errResponse) {
            $q.reject(errResponse.data);
        });
    }

    this.getCategories = function () {
        return $http.get('./js/json/ExpenseCategory.json')
        .then(function (response) {
            return response.data;
        },
        function (errResponse) {
            $q.reject(errResponse.data);
        });
    }

    this.getApprovalStatus = function () {
        return $http.get('./js/json/ApprovalStatus.json')
        .then(function (response) {
            return response.data;
        },
        function (errResponse) {
            $q.reject(errResponse.data);
        });
    }
});
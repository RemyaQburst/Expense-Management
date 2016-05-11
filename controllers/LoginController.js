smartApp.controller('LoginController', function ($scope, $rootScope, $location, GetStaticDetails) {

    $scope.submitted = false;

    $scope.login = function () {
        $scope.submitted = true;
        $scope.warning = "";
        // ToDo with username and password ,authenticate users within our Json.
        // Pass the userID, UserRoleID to the next page
        console.log(GetStaticDetails.getUsers());
        GetStaticDetails.getUsers().then
        (
        function (data) {
            var users = data;
            angular.forEach(users, function (user) {
                if (user.Email == $scope.uname && user.Password == $scope.pwd) {
                    sessionStorage.setItem("loginName", user.FullName);
                    sessionStorage.setItem("userRole", user.Role);
                    sessionStorage.setItem("userId", user.Id);
                    $location.url('/');
                }
                else
                    $scope.warning = "Invalid username or password...";
            })
        },
        function (error) {
            console.log("Login Failed");
        });
    }
});
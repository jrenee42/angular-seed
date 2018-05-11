'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

    .controller('View1Ctrl', ['$scope', '$http',function($scope, $http) {
        $scope.hello='hello from jill 2';

        var baseUrl = 'http://localhost:3001/users';
        var toggleConfirmationDialog = dialogFactory("confirmation-dialog");
        
        $http.get(baseUrl)
            .success(function (response) {
                $scope.users = response;
            });
        
        
        $scope.maybeDelete = function(id, name) {
            console.log('would pop up a dialog here to deletion......', id);
            showConfirmationDialog(id, name);
        };


        //confirmation dialog:
        $scope.confirmationDialogConfig = {
            title: "Deletion Confirmation"
        };

  
        function showConfirmationDialog(userId, name) {
            $scope.confirmationDialogConfig.message  = "Are you sure you want to delete the user: " + name + "?";
            $scope.confirmationDialogConfig.userId = userId;
            toggleConfirmationDialog(true);
        };

        $scope.doDeletion = function(userId){
            $http.delete(baseUrl + "/" + userId).success(function(resp){

                //need to refresh the table:
                //  we know it's successful, so we don't have to requery the server,
                //  can just remove the deleted element locally:
                
                $scope.users = $scope.users.filter(user => {
                   return user.id !== userId;
                });

                toggleConfirmationDialog();
                
            }).catch(function(err){
                console.log('error...', err);
            });
        };


        $scope.executeDialogAction = function(action) {
            if(typeof $scope[action] === "function") {
    		    $scope[action]();
    	    }
        };


        $scope.delete = function() {
            console.log("Deleting...");
            $scope.showDialog();
        };

        function dialogFactory(id) {
            var showFn = function(flag) {
                 jQuery("#" + id + " .modal").modal(flag ? 'show' : 'hide');
            };
            return showFn;
        }
        
        
    }]);

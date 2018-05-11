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

        
        $http.get(baseUrl)
            .success(function (response) {
                $scope.users = response;
            });
        
        
        $scope.maybeDelete = function(id, name) {
            console.log('would pop up a dialog here to deletion......', id);
            
            
            //first; just do it:

            showConfirmationDialog(name);
            
            $http.delete(baseUrl + "/" + id).success(function(resp){
                console.log('deletion response: ', resp);

                //need to refresh the table:
                $scope.users = $scope.users.filter(user => {
                   return user.id !== id;
                });

                
            }).catch(function(err){
                console.log('error...', err);
            });
        };


        //confirmation dialog:
        $scope.confirmationDialogConfig = {
            title: "Deletion Confirmation",
            buttons: [{
                label: "Delete",
                action: "delete"
            }]
        };

  
        function showConfirmationDialog(name) {
            $scope.confirmationDialogConfig.message  = "Are you sure you want to delete the user: " + name + "?";
            $scope.showDialog(true);
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

        $scope.showDialog = function(flag) {
            jQuery("#confirmation-dialog .modal").modal(flag ? 'show' : 'hide');
        };
        
    }]);

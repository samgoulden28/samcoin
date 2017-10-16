angular.module('app', [])
  .controller('Controller', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
    var spotifyUrl = "/blockchain/blocks";

    var refreshInterval = 10;

    function getLatestBlocks() {
      $http({
        method: 'GET',
        url: spotifyUrl,
        headers: {
          "Accept": "Accept: application/json",
        }
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        console.log("OK! Got response: " + JSON.stringify(response.data))
        $scope.blocks = JSON.stringify(response.data);
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        console.log("Error! " + JSON.stringify(response))
      });
    }
    getLatestBlocks();

    $interval(getLatestBlocks, refreshInterval * 1000);
  }])

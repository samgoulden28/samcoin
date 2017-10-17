angular.module('app', [])
  .controller('Controller', ['$scope', '$http', '$interval', function($scope, $http, $interval) {
    var blocksUrl = "/blockchain/blocks";
    var walletsUrl = "/operator/wallets";
    var miningUrl = "/miner/mine";

    var refreshInterval = 10;

    $scope.blocks = {};
    $scope.wallets = {};
    $scope.amountInWallets = 0;

    function getWallets() {
      $http({
        method: 'GET',
        url: walletsUrl,
        headers: {
          "Accept": "Accept: application/json",
        }
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log("Wallets OK! Got response: " + JSON.stringify(response.data))
        $scope.wallets = response.data;
        $scope.amountInWallets = 0;
        var total = 0;
        for(var i = 0; i < $scope.wallets.length; i++) {
          var wallet = $scope.wallets[i];

          for (var j = 0; j < wallet.addresses.length; j++) {
            var address = wallet.addresses[j];
            console.log("Address " + address);
            $http({
              method: 'GET',
              url: '/blockchain/transactions/unspent' + "?address=" + address,
              headers: {
                "Accept": "Accept: application/json",
              }
            }).then(function successCallback(response) {
              // this callback will be called asynchronously
              // when the response is available
              console.log("Amount in " + address + "OK! Got response: " + JSON.stringify(response.data))
              for(var k = 0; k < response.data.length; k++) {

                $scope.amountInWallets += response.data[k].amount;
              }
            }, function errorCallback(response) {
              // called asynchronously if an error occurs
              // or server returns response with an error status.
              console.log("Wallets Error! " + JSON.stringify(response))
            });
          }
        }
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log("Wallets Error! " + JSON.stringify(response))
      });
    }

    function getLatestBlocks() {
      $http({
        method: 'GET',
        url: blocksUrl,
        headers: {
          "Accept": "Accept: application/json",
        }
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log("Blocks OK! Got response: " + JSON.stringify(response.data))
        $scope.blocks = response.data;
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log("Blocks Error! " + JSON.stringify(response))
      });
    }

    getLatestBlocks();
    getWallets();

    // $scope.getAmountInWallets = function() {
    //   var total = 0;
    //   for(var i = 0; i < $scope.wallets.length; i++) {
    //     var wallet = $scope.wallets[i];
    //
    //     for (var j = 0; j < wallet.addresses.length; j++) {
    //       var address = wallet.addresses[j];
    //       console.log("Address " + address);
    //       $http({
    //         method: 'GET',
    //         url: walletsUrl + "?address=" + address,
    //         headers: {
    //           "Accept": "Accept: application/json",
    //         }
    //       }).then(function successCallback(response) {
    //         // this callback will be called asynchronously
    //         // when the response is available
    //         //console.log("Amount in " + address + "OK! Got response: " + JSON.stringify(response.data))
    //         for(var i = 0; i < response.data.length; i++) {
    //           total += response.data[i].amount;
    //         }
    //       }, function errorCallback(response) {
    //         // called asynchronously if an error occurs
    //         // or server returns response with an error status.
    //         //console.log("Wallets Error! " + JSON.stringify(response))
    //       });
    //     }
    //   }
    //   return total;
    // }

    $scope.generateWallet = function(walletId, walletPassword) {
      $http({
        method: 'POST',
        url: walletsUrl,
        headers: {
          "Accept": "Accept: application/json",
          "Content-Type": "application/json"
        },
        data: {
          "password" : walletPassword
        }
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log("Address Generated OK! Got response: " + JSON.stringify(response.data));
        getWallets();
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log("Address Generate Error! " + JSON.stringify(response))
      });
    }

    $scope.generateAddressForWallet = function(walletId, walletPassword) {
      $http({
        method: 'POST',
        url: walletsUrl + "/" + walletId + "/addresses",
        headers: {
          "Accept": "Accept: application/json",
          "Content-Type": "application/json",
          "password" : walletPassword
        }
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log("Address Generated OK! Got response: " + JSON.stringify(response.data));
        getWallets();
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log("Address Generate Error! " + JSON.stringify(response))
      });
    }

    $scope.mine = function(rewardAddress) {
      $http({
        method: 'POST',
        url: miningUrl,
        headers: {
          "Accept": "Accept: application/json",
          "Content-Type": "application/json"
        },
        data: {
          "rewardAddress" : rewardAddress
        }
      }).then(function successCallback(response) {
        // this callback will be called asynchronously
        // when the response is available
        //console.log("Mining succeeded! Got response: " + JSON.stringify(response.data));
        getLatestBlocks();
      }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        //console.log("Mining Failed! Error: " + JSON.stringify(response))
      });
    }

    $scope.date = function timeConverter(UNIX_timestamp){
      //console.log("Calling date");
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
      return time;
    }


    $scope.getTotalTransactionAmount = function (transactions) {
      var total = 0;
      for(var i = 0; i < transactions.length; i++) {
        var tx = transactions[i];
        //console.log(tx);
        for(var j = 0; j < tx.data.outputs.length; j++) {
          var output = tx.data.outputs[j];
          if(output.amount) {
            //console.log(output.amount);
          }
        }
      }
      return total;
    }

    $interval(getLatestBlocks, refreshInterval * 1000);
  }])

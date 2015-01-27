(function() {
    'use strict';
    var module = angular.module('XolotlConversation', []);

    module.controller('ConversationController', function($scope, $routeParams) {

        console.log($routeParams.number);

        $scope.conversations = {
                "+447000000001-1000000" : { body: "Hello, how are you?", self: false, status: "sending...", sentTime: 1000000 },
                "+447000000001-1000002" : { body: "I'm, fine thanks. You?", self: true, status: "failed", sentTime: 1000002 },
                "+447000000001-1000003" : { body: "no complaints", self: false, status: "sent", sentTime: 1000003 }
            }

        $scope.messages = Object.keys($scope.conversations).map(function (key) {return $scope.conversations[key]});

        $scope.sendMessage = function() {

            $scope.messages.push({body: $scope.message, self: true});
            $scope.message = "";
        };

    });

    module.directive('ngEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });

})();
import _ from 'underscore';

export class MainController {
  constructor ($scope, $http, $log, $state, $stateParams) {
    'ngInject';

    this.apiEndpoint = 'https://api.github.com/';

    this.creationDate = 1455597594246;

    $scope.username = $stateParams.username || '';
    $scope.users = [];

    $scope.$watch('username', this.findUsername.bind(this, $scope, $http, $log, $state));

    // Don't request the github API too many times while data is changing, debounce the requests
    this.debouceGetUsers = _.debounce(($scope, $http, username) => {
      $http
        .get(this.apiEndpoint + 'search/users', {
          params: {
            q: username
          }
        })
        .then((data) => {
          // Associate the list of users
          $scope.users = data.data.items || [];
          $log.debug(data);
        })
      ;
    }, 300);
  }

  findUsername($scope, $http, $log, $state, value) {
    $log.debug(value);
    this.debouceGetUsers($scope, $http, value);

    // Bind state
    $state.go('home', {username: value}, {notify: false});
  }
}

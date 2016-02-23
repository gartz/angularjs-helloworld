import _ from 'underscore';

export class RepoController {
  constructor ($scope, $http, $log, $state, $stateParams) {
    'ngInject';

    debugger;

    this.apiEndpoint = 'https://api.github.com/';

    $scope.repo = $stateParams.repo || '';
    $scope.repos = [];

    $scope.$watch('repo', this.findUsername.bind(this, $scope, $http, $log, $state));

    // Don't request the github API too many times while data is changing, debounce the requests
    this.debouceGetUsers = _.debounce(($scope, $http, username) => {
      if (!username) {
        $scope.repos = [];
        $log.debug('empty username');
      }

      $http
        .get(this.apiEndpoint + 'search/users', {
          params: {
            q: username
          }
        })
        .then((data) => {
          // Associate the list of users
          $scope.repos = data.data.items || [];
          $log.debug(data);
        }, () => {
          $scope.repos = [];
          $log.debug('no data found');
        })
      ;
    }, 300);
  }

  findUsername($scope, $http, $log, $state, value) {
    $log.debug(value);
    this.debouceGetUsers($scope, $http, value);

    // Bind state
    $state.go('home.user.repo', {repo: value}, {notify: false});
  }
}

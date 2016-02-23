import _ from 'underscore';

export class RepoController {
  constructor ($scope, $http, $log, $state, $stateParams) {
    'ngInject';

    this.apiEndpoint = 'https://api.github.com/';
    this.$scope = $scope;
    this.$http = $http;
    this.$state = $state;
    this.$log = $log;

    this.setName($stateParams.repo || '');
    this.setRepos();

    $scope.$watch('name', this.findRepository.bind(this));
    $scope.$watch('$parent.username', this.findRepository.bind(this));

    // Don't request the Github API too many times while data is changing, debounce the requests
    this.debounceGetUsers = _.debounce(() => {
      var repo = this.$scope.name;
      var username = $scope.$parent && $scope.$parent.username || '';
      if (!username) {
        this.setRepos();
        this.$log.debug('no repo username');
        return;
      }
      this.$http
        .get(this.apiEndpoint + 'search/repositories', {
          params: {
            q: 'user:' + username + ' ' + repo
          }
        })
        .then((data) => {
          // Associate the list of users
          this.setRepos(data.data.items || []);
          this.$log.debug(data);
        }, () => {
          this.setRepos();
          this.$log.debug('no data found');
        })
      ;
    }, 300);
  }

  findRepository() {
    var value = this.$scope.name;
    this.$log.debug(value);
    this.debounceGetUsers(value);

    // Bind state
    this.$state.go('home.user.repo', {repo: value}, {notify: false});
  }

  setName(value = '') {
    this.$scope.name = value;
  }

  setRepos(repos = []) {
    // Users can be mapped to a user class

    this.$scope.repos = repos;
  }
}

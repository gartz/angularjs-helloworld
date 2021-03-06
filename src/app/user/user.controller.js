import _ from 'underscore';

export class UserController {
  constructor ($scope, $http, $log, $state, $stateParams) {
    'ngInject';

    this.apiEndpoint = 'https://api.github.com/';
    this.$scope = $scope;
    this.$http = $http;
    this.$state = $state;
    this.$log = $log;

    this.$scope.username = $stateParams.username || '';
    this.$scope.users = [];

    $scope.$watch('username', this.findUsername.bind(this));

    // Don't request the Github API too many times while data is changing, debounce the requests
    this.debounceGetUsers = _.debounce((username) => {
      if (!username) {
        this.setUsers();
        this.$log.debug('empty username');
        return;
      }
      this.$http
        .get(this.apiEndpoint + 'search/users', {
          params: {
            q: username
          }
        })
        .then((data) => {
          // Associate the list of users
          this.setUsers(data.data.items || []);
          this.$log.debug(data);
        }, () => {
          this.setUsers();
          this.$log.debug('no data found');
        })
      ;
    }, 300);
  }

  findUsername(value) {
    this.$log.debug(value);
    this.debounceGetUsers(value);
  }

  setUsername(username = '') {
    // Bind state
    this.$scope.username = username;
    this.$state.go('home.user', {username}, {notify: false});
  }

  setUsers(users = []) {
    // Users can be mapped to a user class

    this.$scope.users = users;

    var user = users.find((user) => {
      return user.login.toUpperCase() === this.$scope.username.toUpperCase();
    });

    this.setUser(user);
  }

  setUser(user = null) {
    this.$scope.currentUser = user;

    if (user) {
      if (!this.$scope.$$childHead.repo) {
        this.$state.go('home.user.repo', {repo: ''});
      }
    } else {
      this.$state.go('home.user');
    }
  }
}

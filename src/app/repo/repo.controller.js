import _ from 'underscore';

export class RepoController {
  constructor ($scope, $http, $log, $state, $stateParams) {
    'ngInject';

    this.apiEndpoint = 'https://api.github.com';
    this.$scope = $scope;
    this.$http = $http;
    this.$state = $state;
    this.$log = $log;
    this.searchText = '';

    this.setName($stateParams.repo || '');
    this.setRepos();

    $scope.$watch('$parent.username', this.findRepository.bind(this));

    // Don't request the Github API too many times while data is changing, debounce the requests
    this.debounceGetUsers = _.debounce(() => {
      var username = $scope.$parent && $scope.$parent.username || '';
      if (!username) {
        this.setRepos();
        this.$log.debug('no repo username');
        return;
      }
      var reposData = [];

      var url = [this.apiEndpoint, 'users', username, 'repos'].join('/');
      var $http = this.$http;
      var setRepo = this.setRepos.bind(this);
      function getPage(num = 1) {
        $http
          .get(url, {
            params: {
              sort: 'updated',
              direction: 'desc',
              page: num
            }
          })
          .then((data) => {
            // Associate the list of users
            reposData = reposData.concat(data.data);
            setRepo(reposData);

            // Get next pages
            var link = data.headers('link');
            if (!link) return;
            var links = {};
            link.split(',').forEach((value) => {
              var data = value.split(';');
              links[data[1].match(/"(.+)"/)[1]] = data[0].match(/<(.+)>/)[1];
            });
            if (links.next) {
              getPage(links.next.match(/page=(.+)&/)[1]);
            }
          })
        ;
      }
      getPage();
      setRepo();
    }, 300);
  }

  findRepository() {
    var value = this.$scope.name;
    this.$log.debug(value);
    this.debounceGetUsers(value);
  }

  setName(value = '') {
    this.$scope.name = value;
    this.searchText = value;

    // Bind state
    this.$state.go('home.user.repo', {repo: value}, {notify: false});

    this.activeRepo();
  }

  setRepos(repos = []) {
    // Users can be mapped to a user class

    this.$scope.repos = repos;

    this.activeRepo();
  }

  activeRepo(repo) {
    if (repo) {
      this.$scope.activeRepo = repo;
      return;
    }

    var name = this.$scope.name;

    if (!name || !this.$scope.repos) {
      this.$scope.activeRepo = null;
      return;
    }

    var activeRepo = this.$scope.repos.find((repo) => {
      return repo.name.toUpperCase() === name.toUpperCase();
    });

    this.$scope.activeRepo = activeRepo;
  }

  searchTextChange(text) {
    this.setName(text);
    this.activeRepo();
  }

  selectedItemChange(item) {
    this.setName(item && item.name || '');
    this.activeRepo(item);
  }

  querySearch (query) {
    var repos = this.$scope.repos;
    return query ? repos.filter( this.createFilterFor(query) ) : repos;
  }

  createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);
    return function filterFn(item) {
      return (item.name.toLowerCase().indexOf(lowercaseQuery) === 0);
    };
  }

}

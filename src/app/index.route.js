export function routerConfig ($stateProvider, $urlRouterProvider) {
  'ngInject';

  $stateProvider
    .state('home', {
      abstract: true,
      url: '/',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main'
    })
    .state('home.user', {
      url: ':username',
      templateUrl: 'app/user/user.html',
      controller: 'UserController',
      controllerAs: 'user',
      parent: 'home'
    })
    .state('home.user.repo', {
      url: '/:repo',
      templateUrl: 'app/repo/repo.html',
      controller: 'RepoController',
      controllerAs: 'repo',
      parent: 'home.user'
    })
  ;

  $urlRouterProvider.otherwise('/');
}

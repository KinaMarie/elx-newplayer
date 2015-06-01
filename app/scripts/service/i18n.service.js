/* jshint -W003, -W117, -W004 */
(function () {
  'use strict';

  angular
    .module('newplayer.service')
    .service('i18nService', i18nService);

  /** @ngInject */
  function i18nService($log) {
    var key,
      /* jshint validthis:true */
      vm = this,
      dict = {
        submit: 'Submit',
        next: 'Next',
        pass: 'Congratulations, you scored :USERSCORE:% and have passed this module.',
        fail: 'Sorry, you scored :USERSCORE:% and you needed to score :MINSCORE:% to pass. Try it again!'
      };

    $log.debug('i18n | init');

    function initWithDict(newDict) {
      $log.debug('i18n | initWithDict', newDict);

      for(key in newDict) {
        dict[key] = newDict[key];
      }

      $log.debug('i18n | initWithDict internal dict updated', dict);
    }

    /**
     * Returns the i18n key for the supplied key if present,
     * otherwise returns the key unchanged
     * @param forKey
     * @return {*}
     */
    function get(forKey) {
      return dict.hasOwnProperty(forKey) ? dict[forKey] : forKey;
    }

    var service = {
      initWithDict: initWithDict,
      get: get
    };

    $log.debug('i18n | service init');

    return service;
  }
})();

(function () {
    'use strict';
    /** @ngInject */
    function npMediaElementDirective($log) {
        $log.debug('\nnpReveal mediaelementDirective::Init\n');
        var Directive = function () {
            this.restrict = 'A';
            this.link = function (scope, element, attrs, controller) {
            };
        };
        return new Directive();
    }
    angular
            .module('newplayer.component')
            .controller('npRevealController',
                    function ($log, $scope, $sce, $element) {
                        var cmpData = $scope.component.data,
                                revealItems = $scope.component.revealItems,
                                revealItemsIndex = $scope.component.idx,
                                revealItemsButtonImage = $scope.component.revealItems.buttonImage,
                                buttonData = $scope.feedback || {};
                        this.revealItems = $scope.component.revealItems;
                        this.revealItemComponent = $scope.component.revealItems[0];
                        this.revealItemComponents = $scope.component.revealItems;
                        this.revealItemVideoType = $scope.component.baseURL;
                        this.id = cmpData.id;
                        this.baseURL = cmpData.baseURL;
                        this.src = cmpData.image;
                        $scope.feedback = this.feedback = cmpData.feedback;
                        $scope.image = this.image = cmpData.image;
                        $log.debug('npReveal::data', cmpData, buttonData);
//                        $(function () {
//                            $(".reveal-video").bind("loadedmetadata", function () {
//                                var width = this.videoWidth;
//                                var height = this.videoHeight;
//                                console.log(
//                                        '\n::::::::::::::::::::::::::::::::::::::npFlashCards::videoWidth:::::::::::::::::::::::::::::::::::::::::::::::::',
//                                        '\n::height:', height,
//                                        '\n::width:', width,
//                                        '\n:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::'
//                                        );
//                            });
//                        });
                        //////////////////////////////////////////////////////////////////////////////////////
                        //get ready
                        //////////////////////////////////////////////////////////////////////////////////////
                        setTimeout(function () {
                            $scope.$apply(function () {
                                //////////////////////////////////////////////////////////////////////////////////////
                                //on ready set states
                                //////////////////////////////////////////////////////////////////////////////////////
                                TweenMax.set($(".reveal-object"), {
                                    autoAlpha: 0
                                });
                                TweenMax.set($(".reveal-button"), {
                                    opacity: 0,
                                    scale: 0.25,
                                    force3D: true
                                });
                                //////////////////////////////////////////////////////////////////////////////////////
                                //get actuall height
                                //////////////////////////////////////////////////////////////////////////////////////
                                imagesLoaded(document.querySelector('.reveal-objects-wrapper'), function (instance) {
                                    var contentMaxHeight = Math.max.apply(null, $('.reveal-background').map(function () {
                                        return $(this).outerHeight(true);
                                    }).get());
                                    var maxHeight = Math.max.apply(null, $('.reveal-object').map(function () {
                                        return $(this).outerHeight(true);
                                    }).get());
                                    var logoHeight = $('.np_renutriv-logo-image').outerHeight(true);
                                    var headlineHeight = $('.np_headline').outerHeight(true);
                                    var instructionalHeight = $('.np_instructional').outerHeight(true);
                                    var npCmpWrapperHeight = $('.np-cmp-wrapper').outerHeight(true);
                                    var revealNavigationHeight = $('.reveal-navigation').outerHeight(true);
                                    var outsidePaddingHeight = $('.np_outside-padding').outerHeight(true);
                                    var outsideTopHeight = logoHeight + headlineHeight + instructionalHeight;
//                                    console.log(
//                                            '\n::::::::::::::::::::::::::::::::::::::npRevealController===get actuall height:::::::::::::::::::::::::::::::::::::::::::::::::',
//                                            '\n::maxHeight::', maxHeight,
//                                            '\n::npCmpWrapperHeight::', npCmpWrapperHeight,
//                                            '\n::outsidePaddingHeight::', outsidePaddingHeight,
//                                            '\n::outsideTopHeight::', outsideTopHeight,
//                                            '\n::maxHeight + npCmpWrapperHeight + 100::', maxHeight + npCmpWrapperHeight + 50,
//                                            '\n::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::'
//                                            );
                                    TweenMax.set($('.np_outside-padding'), {
                                        height: maxHeight + (outsideTopHeight * 2) + revealNavigationHeight + 50
                                    });
//                                    var videoHeight = $element.find('video');
                                    //////////////////////////////////////////////////////////////////////////////////////
                                    //build init state
                                    //////////////////////////////////////////////////////////////////////////////////////
                                    TweenMax.to($(".button-screen"), 1.5, {
                                        autoAlpha: 0.75,
                                        ease: Power4.easeOut
                                    });
                                    TweenMax.staggerTo($(".reveal-button"), 2, {
                                        scale: 1,
                                        opacity: 1,
                                        delay: 0.25,
                                        ease: Power4.easeOut,
                                        force3D: true
                                    }, 0.2);
                                    TweenMax.to($(".button-screen"), 1.5, {
                                        autoAlpha: 0.65,
                                        ease: Power4.easeOut
                                    });
                                    TweenMax.to($(".button-screen")[0], 1.75, {
                                        autoAlpha: 0,
                                        delay: 1.75,
                                        ease: Power4.easeOut
                                    });
                                    TweenMax.to($(".reveal-object")[0], 1.75, {
                                        autoAlpha: 1,
                                        delay: 1.75,
                                        ease: Power4.easeOut
                                    });
                                });
                            });
                        });
                        this.update = function (button) {
                            var idx = this.revealItems.indexOf(button);
                            //////////////////////////////////////////////////////////////////////////////////////
                            //on navigation change stop and reset all video files
                            //////////////////////////////////////////////////////////////////////////////////////
                            $('video').each(function () {
                                this.pause();
                                this.currentTime = 0;
                                this.load();
                            });
                            //////////////////////////////////////////////////////////////////////////////////////
                            //on navigation change cross fade items
                            //////////////////////////////////////////////////////////////////////////////////////
                            TweenMax.to($(".button-screen"), 1.5, {
                                autoAlpha: 0.75,
                                ease: Power4.easeOut
                            });
                            TweenMax.to($(".button-screen")[idx], 1.75, {
                                autoAlpha: 0,
                                ease: Power4.easeOut
                            });
                            TweenMax.to($(".reveal-object"), 1.5, {
                                autoAlpha: 0,
                                ease: Power4.easeOut
                            });
                            TweenMax.to($(".reveal-object")[idx], 1.75, {
                                autoAlpha: 1,
                                ease: Power4.easeOut
                            });
                        };
                    }
            )
            .directive('mediaelement', npMediaElementDirective)
            /** @ngInject */
            .run(
                    function ($log, $rootScope) {
                        $log.debug('npReveal::component loaded!');
                    }
            );
})();

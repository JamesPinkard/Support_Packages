angular.module('HashBangURLs', []).config(['$locationProvider', function ($location) {
    $location.hashPrefix('!');
}]);

var app = angular.module("app", ['HashBangURLs']);

app.config(
    function ($routeProvider) {
        $routeProvider
            .when(
                "/",
                {
                    action: "index",
                }
            )
            .when(
                "/Errors/:ProjectName",
                {
                    action: "error",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName/M/:MethodName/:Overload",
                {
                    action: "details.method",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName/M/:MethodName",
                {
                    action: "details.method",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName/ctor",
                {
                    action: "details.ctor",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName/P/:PropertyName",
                {
                    action: "details",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName/E/:EventName",
                {
                    action: "details",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName/F/:FieldName",
                {
                    action: "details",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName/:MemberName",
                {
                    action: "details",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName/:TypeName",
                {
                    action: "details",
                }
            )
            .when(
                "/Packages/:ProjectName/:AssemblyName",
                {
                    action: "details",
                }
            )
            .when(
                "/Packages/:ProjectName",
                {
                    action: "details",
                }
            )
            .when(
                "/Projects/:ProjectName",
                {
                    action: "details",
                }
            )
            .otherwise(
                {
                    redirectTo: "/",
                }
            );
    }
);

function AppController($scope, $rootScope, $route, $http, $routeParams, $location, $anchorScroll, $filter, $log) {

    var redirectIndex = $location.$$absUrl.indexOf('?url=');
    if (redirectIndex != -1) {
        var redirectPath = $location.$$absUrl.substring(redirectIndex + 5, $location.$$absUrl.lastIndexOf('#'));;

        window.location.href = '/#!/' + redirectPath;
        return;
    }

    $scope.$filter = $filter;
    $scope.$log = $log;

    $scope.host = $location.$$host;

    render = function () {

        $scope.renderAction = $route.current.action;
        $scope.projectName = $routeParams.ProjectName;
        $scope.assemblyName = $routeParams.AssemblyName;
        $scope.packageName = $routeParams.ProjectName;

        var overridenProjectName = $rootScope.indexMapping[$scope.projectName];
        if (overridenProjectName != null) {
            $scope.projectName = overridenProjectName;
        }

        if ($scope.projectName != null) {
            document.title = "NuDoq - " + $scope.projectName;
        } else {
            document.title = "NuDoq - Enjoyable API Documentation";
        }

        var url;
        if ($scope.renderAction == "index") {
            url = "index";
        } else if ($scope.renderAction == "details.method") {
            $scope.selectedOverload = $routeParams.Overload;

            url = "Packages"
                + "/" + $routeParams.ProjectName
                + "/" + $routeParams.AssemblyName
                + "/" + $routeParams.TypeName
                + "/M"
                + "/" + $routeParams.MethodName;

            $http.get(url + ".js").
                success(function (data) {
                    $scope.methods = data;
                });
        } else if ($scope.renderAction == "details.ctor") {
            $scope.selectedOverload = $routeParams.Overload;

            url = "Packages"
                + "/" + $routeParams.ProjectName
                + "/" + $routeParams.AssemblyName
                + "/" + $routeParams.TypeName
                + "/ctor";

            $http.get(url + ".js").
                success(function (data) {
                    $scope.methods = data;
                });
        } else if ($scope.renderAction == "error") {
            url = $location.path().substring(1);

            $scope.content = null;
            $scope.index = null;
            $scope.isContentLoaded = false;

            $http.get(url + ".md" + "?" + Math.random()).
                success(function (data) {
                    $scope.content = data;
                    $scope.isContentLoaded = true;
                }).error(function (data) {
                    window.location.href = '/';
                    return;
                });

            return;
        }
        else {
            url = $location.path().substring(1);
        }

        indexUrl = url;

        $scope.newCommunityContentUrl = null;
        $scope.editCommunityContentUrl = null;

        var lastUrlSeparatorIndex = url.lastIndexOf('/');
        if (lastUrlSeparatorIndex != -1) {

            $scope.newCommunityContentUrl = "https://github.com/NuDoq/Community/new/master/" + url.substring(0, lastUrlSeparatorIndex);
            $scope.newCommunityContentUrl = $scope.newCommunityContentUrl + "?filename=" + url.substring(lastUrlSeparatorIndex + 1, url.length) + ".md";
        }

        $scope.editCommunityContentUrl = "https://github.com/NuDoq/Community/edit/master/" + url + ".md";

        if (url != "index") {
            var urlParts = url.split("/");
            indexUrl = "Projects/" + $scope.projectName;
        }

        $http.get(indexUrl + ".version" + "?" + Math.random()).
            success(function (result) {

                $scope.indexVersion = result;

                if ($scope.host == 'localhost') {
                    $scope.newVersionAvailable = false;

                    $http.get("http://www.nudoq.org/" + indexUrl + ".version?" + Math.random()).
                        success(function (onlineResult) {
                            if (parseInt(onlineResult) > parseInt($scope.indexVersion)) {
                                $scope.newVersionAvailable = true;
                                $scope.newVersionUrl = "http://www.nudoq.org/Projects/" + $scope.projectName + ".zip";
                            }
                        });
                }

                $scope.content = null;
                $scope.contentCommunity = null;
                $scope.isCommunityLoaded = false;

                $scope.isLoadingContent = true;
                $scope.isContentLoaded = false;

                ga('send', 'event', $location.path(), "view");

                $scope.url = url;

                if (url != 'index') {

                    $http.get(url + ".md" + "?" + Math.random()).
                        success(function (data) {

                            //$location.hash('mainDiv');
                            $anchorScroll();

                            $scope.content = data;
                            $scope.isLoadingContent = false;
                            $scope.isContentLoaded = true;
                        }).error(function (data) {
                            $scope.isLoadingContent = false;

                            window.location.href = '/#!/Errors/' + $scope.packageName;
                            return;
                        });
                }

                $http.get("https://api.github.com/repos/NuDoq/Community/contents/" + url + ".md?" + Math.random(),
                    { headers: { 'Accept': 'application/vnd.github.v3.raw' } }).
                    success(function (data) {
                        $scope.contentCommunity = data;
                        $scope.isCommunityLoaded = true;
                    }).error(function (data) {
                        $scope.contentCommunity = null;
                        $scope.isCommunityLoaded = true;
                    });


                if ($scope.indexUrl != indexUrl) {

                    $scope.isLoadingIndex = true;

                    $scope.indexUrl = indexUrl;
                    $scope.index = null;

                    $http.get(indexUrl + ".js" + "?" + $scope.indexVersion).
                        success(function (data) {

                            $scope.index = data;

                            // Reset paging/load more limits
                            $scope.defaultLimit = 10;
                            $scope.limits = {};
                            $scope.limits["All Projects (by Popularity)"] = 8;

                            // Reset filter
                            $scope.query = "";

                            $scope.isLoadingIndex = false;
                        }).error(function (data) {
                            $scope.isLoadingIndex = false;
                        });

                }

            }).error(function (data) {
                $scope.isLoadingIndex = false;
                $scope.isLoadingContent = false;

                if ($scope.packageName != null) {
                    window.location.href = '/#!/Errors/' + $scope.packageName;
                    return;
                }
            });
    }


    function loadDisqus() {
        window.disqus_shortname = 'nudoq';
        window.disqus_identifier = window.location.hash.substring(3);
        window.disqus_title = window.location.hash.substring(3);
        window.disqus_url = window.location.origin + '?url=' + window.location.hash.substring(3);

        // http://docs.disqus.com/developers/universal/
        (function () {
            var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
            dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] ||
              document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();

        angular.element(document.getElementById('disqus_thread')).html('');
    }

    $scope.$on(
        "$routeChangeSuccess",
        function ($currentRoute, $previousRoute) {

            // Set the default render action
            //$scope.renderAction = "index";

            if ($location.$$host == '') {
                $scope.renderAction = "instructions";
            }

            // Update the rendering.
            if ($rootScope.indexMapping == null) {

                $http.get("indexMapping.js?" + Math.random()).
                    then(function (result) {

                        var indexMapping = new Object();

                        for (var i = 0; i < result.data.length; i++) {
                            indexMapping[result.data[i].Package] = result.data[i].Project;
                        }

                        $rootScope.indexMapping = indexMapping;

                        render();
                        loadDisqus();
                    });
            }
            else {
                render();
                loadDisqus();
            }
        });

    $scope.onIndexRenderFinished = function () {
        $scope.isLoadingIndex = false;
    }

    $scope.hasLoadMore = function (group, query) {
        var data = $scope.$filter('filter')(group.Members, query);
        var limit = $scope.defaultLimit + $scope.getValueOrDefault($scope.limits[group.Title]);

        return data != null && data.length > limit;
    }

    $scope.loadMore = function (category) {
        var existing = $scope.getValueOrDefault($scope.limits[category]) + $scope.defaultLimit;
        $scope.limits[category] = existing + $scope.defaultLimit;
    };

    $scope.getValueOrDefault = function (value) {
        return isNaN(value) ? 0 : value;
    };
}

app.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last) {
                $timeout(function () {
                    scope.$eval(attr.onFinishRender);
                });
            }
        }
    }
});

// Markdown filter, to use like: <div ng-bind-html-unsafe="content | markdown"></div>
app.filter('markdown', function () {
    return function (value) {
        return md.toHtml(value);
    };
});

// Markdown directive to use as a tag:
// <markdown src="doc/doc.md"> or inline content
app.directive("markdown", function ($compile, $http) {
    return {
        restrict: 'E',
        replace: true,
        link: function (scope, element, attrs) {
            if ("src" in attrs) {
                $http.get(attrs.src, { cache: false }).success(function (data) {
                    element.html(md.toHtml(data));
                });
            } else {
                element.html(md.toHtml(element.text()));
            }
        }
    };
});

var md = function () {
    marked.setOptions({
        gfm: true,
        pedantic: false,
        sanitize: true,
        // callback for code highlighter
        highlight: function (code, lang) {
            if (lang != undefined)
                return hljs.highlight(lang, code).value;

            return hljs.highlightAuto(code).value;
        }
    });

    var toHtml = function (markdown) {
        if (markdown == undefined)
            return '';

        return marked(markdown);
    };

    hljs.tabReplace = '    ';

    return {
        toHtml: toHtml
    };
}();


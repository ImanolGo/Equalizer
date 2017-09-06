var s,
NewsWidget = {

  settings: {
    numArticles: 5,
    articleList: $("#article-list"),
    moreButton: $("#more-button")
  },

  init: function() {
    s = this.settings;
    this.bindUIActions();
  },

  bindUIActions: function() {
    s.moreButton.on("click", function() {
      NewsWidget.getMoreArticles(s.numArticles);
    });
  },

  getMoreArticles: function(numToGet) {
    // $.ajax or something
    // using numToGet as param
  }

};
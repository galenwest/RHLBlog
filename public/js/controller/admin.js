$(document).ready(function () {

  var ndCategory = $('#js-category');
  var ndAuthor = $('#js-author');
  var ndKeyword = $('#js-keyword');

  $('#js-filter-submit').on('click', function () {
    var query = queryString.parse(location.search);
    var category = ndCategory.val();
    var author = ndAuthor.val();
    var keyword = ndKeyword.val();

    if (category) {
      query.category = category;
    } else {
      delete query.category;
    }
    if (author) {
      query.author = author;
    } else {
      delete query.author;
    }
    if (keyword) {
      query.keyword = keyword;
    } else {
      delete query.keyword;
    }
    window.location.url = window.location.origin + window.location.pathname + queryString.stringify(query);
  });

  $('a.deletePost').on('click', function () {
    var postId = event.target.getAttribute('postid');
    var uri = event.target.getAttribute('url');
    var ispublish = event.target.getAttribute('ispublish');
    if (ispublish === 'true') {
      easyDialog.open({
        container : {
          header : '是否删除此文章?',
          content : '建议您先编辑修改文章为待发布状态！删除后将无法找回！',
          drag: false,
          proText: '取消发布',
          proFn: function() {
            window.location.replace(window.location.origin + '/admin/posts/unpublish/' + postId + uri);
            return true;
          },
          yesText: '删除',
          yesFn :  function() {
            window.location.replace(window.location.origin + "/admin/posts/delete/" + postId + uri);
            return true;
          },
          noFn : true
        }
      });
    } else {
      easyDialog.open({
        container : {
          header : '是否删除此文章?',
          content : '确定要删除?删除后将无法找回！',
          drag: false,
          yesText: '删除',
          yesFn :  function() {
            window.location.replace(window.location.origin + "/admin/posts/delete/" + postId + uri);
            return true;
          },
          noFn : true
        }
      });
    }
  });

  $('a.deleteCategory').on('click', function () {
    var categoryId = event.target.getAttribute('categoryid');
    var uri = event.target.getAttribute('url');
    easyDialog.open({
      container : {
        header : '是否删除此分类?',
        content : '确定要删除?删除后将无法找回！',
        drag: false,
        yesText: '删除',
        yesFn :  function() {
          window.location.replace(window.location.origin + uri);
          return true;
        },
        noFn : true
      }
    });
  });

});

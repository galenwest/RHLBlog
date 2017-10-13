$(document).ready(function () {
  $("a.mts-like").click(function (event) {
    var postId = event.target.getAttribute('postid');
    var favorite = event.target.getAttribute('favorite');
    var isFavorite = event.target.getAttribute('isfavorite');
    var metaId = event.target.getAttribute('metaid');
    var domLike = $("#" + postId);
    var likeHtml = domLike[0].innerHTML;
    if (isFavorite === 'true') {
      isFavorite = false;
      $.ajax({
        url: "/posts/unfavorite/" + postId + "/" + metaId,
        success: function (result) {
          $("a.mts-like").attr("isfavorite",isFavorite);
          $("a.mts-like").attr("favorite",result);
          $("a.mts-like").attr("title",'点赞');
          domLike.html('<i postid="' + postId + '" favorite="' + result + '" isfavorite="' + isFavorite + '" metaid="' + metaId + '" class="fa fa-heart-o"></i><span postid="' + postId + '" favorite="' + result + '" isfavorite="' + isFavorite + '" metaid="' + metaId + '" class="post-favourates">' + result + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论，同时点赞也会起到收藏作用。", "warning");
          } else {
            swal("服务器异常，请重试!", JSON.stringify(arg));
          }
          domLike.html(likeHtml);
        },
        beforeSend: function () {
          domLike.html('<i class="fa fa-spinner fa-spin"></i><span class="post-favourates">' + favorite + '</span>');
        }
      });
    } else {
      isFavorite = true;
      $.ajax({
        url: "/posts/favorite/" + postId,
        success: function (result) {
          $("a.mts-like").attr("isfavorite",isFavorite);
          $("a.mts-like").attr("favorite",result.favorCount);
          $("a.mts-like").attr("metaid",result.metaId);
          $("a.mts-like").attr("title",'取消点赞');
          domLike.html('<i postid="' + postId + '" favorite="' + result.favorCount + '" isfavorite="' + isFavorite + '" metaid="' + result.metaId + '" class="fa fa-heart"></i><span postid="' + postId + '" favorite="' + result.favorCount + '" isfavorite="' + isFavorite + '" metaid="' + result.metaId + '" class="post-favourates">' + result.favorCount + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论，同时点赞也会起到收藏作用。", "warning");
          } else {
            swal("服务器异常，请重试!", JSON.stringify(arg));
          }
          domLike.html(likeHtml);
          
        },
        beforeSend: function () {
          domLike.html('<i class="fa fa-spinner fa-spin"></i><span class="post-favourates">' + favorite + '</span>');
        }
      });
    }
  });

  $("#logoutuser").click(function (event) {
    var query = queryString.parse(location.search);
    var url = window.location.origin + window.location.pathname + queryString.stringify(query);
    window.open('/logout?url='+url, '_self');
  });

  $("#loginuser").click(function (event) {
    var query = queryString.parse(location.search);
    var url = window.location.origin + window.location.pathname + queryString.stringify(query);
    window.open('/login?url='+url, '_self');
  });

  $(".com-like").click(function (event) {
    var commentId = event.target.getAttribute('commentid');
    var supportId = event.target.getAttribute('supportid');
    var isSupport = event.target.getAttribute('issupport');
    var supportCount = event.target.getAttribute('supportcount');
    var domSupport = $("#" + commentId + "support");
    var supportHtml = domSupport[0].innerHTML;
    if (isSupport === 'true') {
      isSupport = false;
      $.ajax({
        url: "/posts/comment/unsupport/" + commentId + "/" + supportId,
        success: function (result) {
          $("a.com-like").attr("issupport",isSupport);
          $("a.com-like").attr("supportcount",result);
          $("a.com-like").attr("title",'支持');
          domSupport.html('<i commentid="' + commentId + '" supportid="' + supportId + '" issupport="' + isSupport + '" supportcount="' + result + '" class="fa fa-thumbs-o-up"></i><span commentid="' + commentId + '" supportid="' + supportId + '" issupport="' + isSupport + '" supportcount="' + result + '" class="comment-favourates">' + result + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论，同时点赞也会起到收藏作用。", "warning");
          } else {
            swal("服务器异常，请重试!", JSON.stringify(arg));
          }
          domSupport.html(supportHtml);
        },
        beforeSend: function () {
          domSupport.html('<i class="fa fa-spinner fa-spin"></i><span class="comment-favourates">' + supportCount + '</span>');
        }
      });
    } else {
      isSupport = true;
      $.ajax({
        url: "/posts/comment/support/" + commentId,
        success: function (result) {
          $("a.com-like").attr("issupport",isSupport);
          $("a.com-like").attr("supportcount",result.supportCount);
          $("a.com-like").attr("supportid",result.supportId);
          $("a.com-like").attr("title",'取消支持');
          domSupport.html('<i commentid="' + commentId + '" supportcount="' + result.supportCount + '" issupport="' + isSupport + '" supportid="' + result.supportId + '" class="fa fa-thumbs-up"></i><span supportid="' + supportId + '" supportcount="' + result.supportCount + '" issupport="' + isSupport + '" supportid="' + result.supportId + '" class="comment-favourates">' + result.supportCount + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论，同时点赞也会起到收藏作用。", "warning");
          } else {
            swal("服务器异常，请重试!", JSON.stringify(arg));
          }
          domSupport.html(supportHtml);
        },
        beforeSend: function () {
          domSupport.html('<i class="fa fa-spinner fa-spin"></i><span class="comment-favourates">' + supportCount + '</span>');
        }
      });
    }
  });

});

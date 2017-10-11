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
          domLike.html('<i postid="' + postId + '" favorite="' + result + '" isfavorite="' + isFavorite + '" metaid="' + metaId + '" class="fa fa-heart-o"></i><span postid="' + postId + '" favorite="' + result + '" isfavorite="' + isFavorite + '" metaid="' + metaId + '" class="post-favourates">' + result + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后将会为您提供您最爱的文章，您也会看到与您志趣相投的朋友们", "warning");
          } else {
            swal("服务器相应异常，请重试!")
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
          domLike.html('<i postid="' + postId + '" favorite="' + result.favorCount + '" isfavorite="' + isFavorite + '" metaid="' + result.metaId + '" class="fa fa-heart"></i><span postid="' + postId + '" favorite="' + result.favorCount + '" isfavorite="' + isFavorite + '" metaid="' + result.metaId + '" class="post-favourates">' + result.favorCount + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后将会为您提供您最爱的文章，您也会看到与您志趣相投的朋友们", "warning");
          } else {
            swal("服务器相应异常，请重试!")
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

});

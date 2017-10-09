$(document).ready(function () {
  $("a.mts-like").click(function (event) {
    var postId = event.target.getAttribute('postid');
    var favorite = event.target.getAttribute('favorite');
    var domLike = $("#" + postId);
    var likeHtml = domLike[0].innerHTML;
    $.ajax({
      url: "/posts/favorite/" + postId,
      success: function (result) {
        domLike.html('<i postid="' + postId + '" favorite="' + result + '" class="fa fa-heart-o"></i><span postid="' + postId + '" favorite="' + result + '" class="post-favourates">' + result + '</span>');
      },
      error: function (arg) {
        if (arg.status == 401) {
          sweetAlert("认证失败", "请登录后进行操作!", "error");
        } else {
          swal("服务器相应异常，请重试!")
        }
        domLike.html(likeHtml);
        
      },
      beforeSend: function () {
        domLike.html('<i class="fa fa-spinner fa-spin"></i><span class="post-favourates">' + favorite + '</span>');
      }
    });
  });

  $("#logoutuser").click(function (event) {
    var query = queryString.parse(location.search);
    var url = window.location.origin + window.location.pathname + queryString.stringify(query);
    window.open('/logout?url='+url, '_self');
  });

});

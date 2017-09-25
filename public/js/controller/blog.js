$(document).ready(function () {
  var mtsLike = $("a.mts-like");
  mtsLike.click(function (event) {
    var postId = event.target.getAttribute('postid');
    var favorite = event.target.getAttribute('favorite');
    var domLike = $("#" + postId);
    var likeHtml = domLike[0].innerHTML;
    $.ajax({
      url: "/posts/favorite/" + postId,
      success: function (result) {
        domLike.html('<i postid="' + postId + '" favorite="' + result + '" class="fa fa-heart-o"></i><span postid="' + postId + '" favorite="' + result + '" class="post-favourates">' + result + '</span>');
        // mtsLike.bind("click", featchFavorite);
      },
      error: function () {
        domLike.html(likeHtml);
        // mtsLike.bind("click", featchFavorite);
        alert("点赞失败，请重新尝试");
      },
      beforeSend: function () {
        domLike.html('<i class="fa fa-spinner fa-spin"></i><span class="post-favourates">' + favorite + '</span>');
        // mtsLike.unbind("click", featchFavorite);
      }
    });
  });

});

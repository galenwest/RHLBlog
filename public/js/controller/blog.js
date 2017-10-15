$(document).ready(function () {
  $("a.mts-like").click(function (event) {
    var postId = event.target.getAttribute('postid');
    var favorite = event.target.getAttribute('favorite');
    var isFavorite = event.target.getAttribute('isfavorite');
    var metaId = event.target.getAttribute('metaid');
    var domLike = $("#" + postId);
    var likeHtml = domLike[0].innerHTML;
    if (isFavorite === 'true') {
      $.ajax({
        type: 'POST',
        url: "/posts/unfavorite/" + postId + "/" + metaId,
        success: function (result) {
          isFavorite = false;
          $("#"+postId).attr("isfavorite",isFavorite);
          $("#"+postId).attr("favorite",result);
          $("#"+postId).attr("title",'点赞');
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
      $.ajax({
        type: 'POST',
        url: "/posts/favorite/" + postId,
        success: function (result) {
          isFavorite = true;
          $("#"+postId).attr("isfavorite",isFavorite);
          $("#"+postId).attr("favorite",result.favorCount);
          $("#"+postId).attr("metaid",result.metaId);
          $("#"+postId).attr("title",'取消点赞');
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
    var ballot = $("#"+commentId+"support").attr('ballot');
    var supportId = event.target.getAttribute('supportid');
    var isSupport = event.target.getAttribute('issupport');
    var supportCount = event.target.getAttribute('supportcount');
    var domSupport = $("#" + commentId + "support");
    var supportHtml = domSupport[0].innerHTML;
    if (isSupport === 'true') {
      $.ajax({
        type: 'POST',
        url: "/posts/comment/unsupport/" + commentId + "/" + supportId,
        success: function (result) {
          ballot = true;
          $("#"+commentId+"against").attr("ballot",ballot);
          $("#"+commentId+"support").attr("ballot",ballot);
          isSupport = false;
          $("#"+commentId+"support").attr("issupport",isSupport);
          $("#"+commentId+"support").attr("supportcount",result);
          $("#"+commentId+"support").attr("title",'支持');
          domSupport.html('<i commentid="' + commentId + '" supportid="' + supportId + '" issupport="' + isSupport + '" supportcount="' + result + '" class="fa fa-thumbs-o-up"></i><span commentid="' + commentId + '" supportid="' + supportId + '" issupport="' + isSupport + '" supportcount="' + result + '" class="comment-favourates">' + result + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论。", "warning");
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
      if (ballot == 'false') {
        swal("已经投票了!");
        return;
      }
      $.ajax({
        type: 'POST',
        url: "/posts/comment/support/" + commentId,
        success: function (result) {
          ballot = false;
          $("#"+commentId+"against").attr("ballot",ballot);
          $("#"+commentId+"support").attr("ballot",ballot);
          isSupport = true;
          $("#"+commentId+"support").attr("issupport",isSupport);
          $("#"+commentId+"support").attr("supportcount",result.supportCount);
          $("#"+commentId+"support").attr("supportid",result.supportId);
          $("#"+commentId+"support").attr("title",'取消支持');
          domSupport.html('<i commentid="' + commentId + '" supportcount="' + result.supportCount + '" issupport="' + isSupport + '" supportid="' + result.supportId + '" class="fa fa-thumbs-up"></i><span supportid="' + supportId + '" supportcount="' + result.supportCount + '" issupport="' + isSupport + '" supportid="' + result.supportId + '" class="comment-favourates">' + result.supportCount + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论。", "warning");
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

  $(".com-unlike").click(function (event) {
    var commentId = event.target.getAttribute('commentid');
    var ballot = $("#"+commentId+"against").attr('ballot');
    var againstId = event.target.getAttribute('againstid');
    var isagainst = event.target.getAttribute('isagainst');
    var againstCount = event.target.getAttribute('againstcount');
    var domagainst = $("#" + commentId + "against");
    var againstHtml = domagainst[0].innerHTML;
    if (isagainst === 'true') {
      $.ajax({
        type: 'POST',
        url: "/posts/comment/unagainst/" + commentId + "/" + againstId,
        success: function (result) {
          ballot = true;
          $("#"+commentId+"support").attr("ballot",ballot);
          $("#"+commentId+"against").attr("ballot",ballot);
          isagainst = false;
          $("#"+commentId+"against").attr("isagainst",isagainst);
          $("#"+commentId+"against").attr("againstcount",result);
          $("#"+commentId+"against").attr("title",'支持');
          domagainst.html('<i commentid="' + commentId + '" againstid="' + againstId + '" isagainst="' + isagainst + '" againstcount="' + result + '" class="fa fa-thumbs-o-down"></i><span commentid="' + commentId + '" againstid="' + againstId + '" isagainst="' + isagainst + '" againstcount="' + result + '" class="comment-favourates">' + result + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论。", "warning");
          } else {
            swal("服务器异常，请重试!", JSON.stringify(arg));
          }
          domagainst.html(againstHtml);
        },
        beforeSend: function () {
          domagainst.html('<i class="fa fa-spinner fa-spin"></i><span class="comment-favourates">' + againstCount + '</span>');
        }
      });
    } else {
      if (ballot == 'false') {
        swal("已经投票了!");
        return;
      }
      $.ajax({
        type: 'POST',
        url: "/posts/comment/against/" + commentId,
        success: function (result) {
          ballot = false;
          $("#"+commentId+"support").attr("ballot",ballot);
          $("#"+commentId+"against").attr("ballot",ballot);
          isagainst = true;
          $("#"+commentId+"against").attr("isagainst",isagainst);
          $("#"+commentId+"against").attr("againstcount",result.againstCount);
          $("#"+commentId+"against").attr("againstid",result.againstId);
          $("#"+commentId+"against").attr("title",'取消支持');
          domagainst.html('<i commentid="' + commentId + '" againstcount="' + result.againstCount + '" isagainst="' + isagainst + '" againstid="' + result.againstId + '" class="fa fa-thumbs-down"></i><span againstid="' + againstId + '" againstcount="' + result.againstCount + '" isagainst="' + isagainst + '" againstid="' + result.againstId + '" class="comment-favourates">' + result.againstCount + '</span>');
        },
        error: function (arg) {
          if (arg.status == 401) {
            sweetAlert("登录后体验更佳哦", "登录后系统将越来越了解您的喜好，将会为您提供您可能会喜欢的文章和评论。", "warning");
          } else {
            swal("服务器异常，请重试!", JSON.stringify(arg));
          }
          domagainst.html(againstHtml);
        },
        beforeSend: function () {
          domagainst.html('<i class="fa fa-spinner fa-spin"></i><span class="comment-favourates">' + againstCount + '</span>');
        }
      });
    }
  });

  // '/comment/reply/:postid/:commentid'
  $(".comment-reply").click(function (event) {
    var commentId = event.target.getAttribute('commentid');
    var isreply = $("#"+commentId).attr("isreply");
    if (isreply == "true") {
      $(".post-comment-item").attr("isreply", "true");
      $(".comment-reply").text("回复");
      $("#"+commentId).attr("isreply", "false");
      event.target.innerText = '取消回复';
      $("#"+commentId).append($("#commentform"));
      $("#submit").attr("isreply", "true");
    } else {
      $("#submit").removeAttr("isreply");
      $("#"+commentId).attr("isreply", "true");
      event.target.innerText = '回复';
      $("#movecomment").append($("#commentform"));
    }
  });

  $("#submit").click(function (event) {
    if (event.target.getAttribute("isreply")) {
      console.log('comment submit lalala');
      return false;
    }
  });

});

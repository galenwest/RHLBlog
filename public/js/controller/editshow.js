$(function () {
  editormd.markdownToHTML("my-editormd-view", {
    // markdown: $("#append-text").text(),
    htmlDecode: "style,script,iframe",  // you can filter tags decode
    emoji: true,
    taskList: true,
    tex: true,  // 默认不解析
    flowChart: true,  // 默认不解析
    sequenceDiagram: true,  // 默认不解析
  });
  var commentListDiv = $('#post-comments-list').children();
  for (var commentCount = 0; commentCount < commentListDiv.length; commentCount++) {
    var commentId = commentListDiv[commentCount].getAttribute('commentid');
    editormd.markdownToHTML(commentId+'content', {
      // markdown: $("#append-text").text(),
      htmlDecode: "style,script,iframe",  // you can filter tags decode
      emoji: true,
      taskList: true,
      tex: true,  // 默认不解析
      flowChart: true,  // 默认不解析
      sequenceDiagram: true,  // 默认不解析
    });
    var replyComments = $("#"+commentId+"reply").children();
    for (var replyCount = 0; replyCount < replyComments.length; replyCount++) {
      editormd.markdownToHTML(replyComments[replyCount].getAttribute('replyid'), {
        // markdown: $("#append-text").text(),
        htmlDecode: "style,script,iframe",  // you can filter tags decode
        emoji: true,
        taskList: true,
        tex: true,  // 默认不解析
        flowChart: true,  // 默认不解析
        sequenceDiagram: true,  // 默认不解析
      });
    }
  }

  var editorCommentMd = editormd("form-comment-edit", {
    width: "100%",
    height: 300,
    path : '/components/editor.md/lib/',
    placeholder: '可用Markdown格式撰写评论...',
    // watch : false,
    toolbarIcons : function() {
        return ["undo", "redo", "|", "bold", "quote", "|", "h1", "h2", "h3", "h4", "|", "list-ul", "list-ol", "hr", "|", "code", "code-block", "||", "watch", "preview"]
    },
  });

  $(".comment-reply").click(function (event) {
    var commentId = event.target.getAttribute('commentid');
    var isreply = $("#"+commentId).attr("isreply");
    if (isreply == "true") {
      $(".post-comment-item").attr("isreply", "true");
      $(".comment-reply").text("回复");
      $("#"+commentId).attr("isreply", "false");
      event.target.innerText = '取消回复';
      $("#"+commentId+"meta").after($("#commentform"));
      $("#submit").attr("isreply", "true");
      $("#submit").attr("commentid", commentId);
    } else {
      $("#submit").removeAttr("isreply");
      $("#submit").removeAttr("commentid");
      $("#"+commentId).attr("isreply", "true");
      event.target.innerText = '回复';
      $("#movecomment").append($("#commentform"));
    }
    editorCommentMd = editormd("form-comment-edit", {
      width: "100%",
      height: 300,
      path : '/components/editor.md/lib/',
      placeholder: '可用Markdown格式撰写评论...',
      // watch : false,
      toolbarIcons : function() {
          return ["undo", "redo", "|", "bold", "quote", "|", "h1", "h2", "h3", "h4", "|", "list-ul", "list-ol", "hr", "|", "code", "code-block", "||", "watch", "preview"]
      },
    });
    // editorCommentMd.setMarkdown("");
  });

  // '/comment/reply/:postid/:commentid'
  $("#submit").click(function (event) {
    console.log('submit click ...');
    if (event.target.getAttribute("isreply")) {
      var postId = $(".post-comments").attr("postid");
      var commentId = $("#submit").attr("commentid");
      var domReplyComments = $("#"+commentId+"reply");
      var content = editorCommentMd.getMarkdown();
      var contentPreviewd = editorCommentMd.getPreviewedHTML();
      $.ajax({
        type: 'POST',
        url: "/posts/comment/reply/" + postId + "/" + commentId,
        data: {comment:content},
        success: function (result) {
          // toast的使用 展开接口
          $(".bodyspan").css("display", "none");

          $("#submit").removeAttr("isreply");
          $("#submit").removeAttr("commentid");
          $("#"+commentId).attr("isreply", "true");
          $("#"+commentId+"huifutext").text('回复');
          $("#"+commentId+"replycount").text(Number($("#"+commentId+"replycount").text())+1);
          
          $("#"+commentId).attr("unfolded", "true");
          $("#"+commentId+"replytext").text("收起");

          $("#movecomment").append($("#commentform"));

          domReplyComments.prepend('<div replyid='+result.replyid+' style="padding-left:10px;padding-bottom:8px" class="reply-comment"><hr style="margin-top:10px;margin-bottom:10px"><div class="post-comment-author"><span style="font-size:18px" class="comm-author">'+result.nick+'</span><span class="comm-created">'+result.created+'</span></div><div id='+result.replyid+' style="padding-top:10px;padding-bottom:10px" class="post-comment-content markdown-body editormd-html-preview">'+contentPreviewd+'</div></div>');
          
          editorCommentMd = editormd("form-comment-edit", {
            width: "100%",
            height: 300,
            path : '/components/editor.md/lib/',
            placeholder: '可用Markdown格式撰写评论...',
            toolbarIcons : function() {
                return ["undo", "redo", "|", "bold", "quote", "|", "h1", "h2", "h3", "h4", "|", "list-ul", "list-ol", "hr", "|", "code", "code-block", "||", "watch", "preview"]
            },
          });
          showMessage('回复成功！',2000);
          // editorCommentMd.setMarkdown("");
          return false;
        },
        error: function (arg) {
          if (arg.status == 401) {
            swal("请登录后撰写评论！");
          } else if (arg.status == 404) {
            swal("请撰写评论！");
          } else {
            swal("服务器异常，请重试!", JSON.stringify(arg));
          }
          $(".bodyspan").css("display", "none");
          return false;
        },
        beforeSend: function () {
          $(".bodyspan").css("display", "inherit");
        }
      });

      return false;
    }
  });

});
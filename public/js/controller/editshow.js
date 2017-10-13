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
    editormd.markdownToHTML(commentListDiv[commentCount].getAttribute('commentid'), {
      // markdown: $("#append-text").text(),
      htmlDecode: "style,script,iframe",  // you can filter tags decode
      emoji: true,
      taskList: true,
      tex: true,  // 默认不解析
      flowChart: true,  // 默认不解析
      sequenceDiagram: true,  // 默认不解析
    });
  }
  
  editormd("form-comment-edit", {
    width: "100%",
    height: 360,
    path : '/components/editor.md/lib/',
    placeholder: '可用Markdown格式撰写评论，点击编辑器右上角可预览效果...',
    watch : false,
    toolbarIcons : function() {
        return ["undo", "redo", "|", "bold", "quote", "|", "h1", "h2", "h3", "h4", "|", "list-ul", "list-ol", "hr", "|", "code", "code-block", "||", "watch", "fullscreen", "preview"]
    },
  });
});
$(function () {
  var myEditormdView;
  myEditormdView = editormd.markdownToHTML("my-editormd-view", {
    markdown: $("#append-text").text(),
    htmlDecode: "style,script,iframe",  // you can filter tags decode
    emoji: true,
    taskList: true,
    tex: true,  // 默认不解析
    flowChart: true,  // 默认不解析
    sequenceDiagram: true,  // 默认不解析
  });
});
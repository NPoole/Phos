$("#newAlbum").click(function() {
    window.api.send('newAlbum');
  });

window.api.receive("loadingScreen", (data) => {
    $(".splash").hide();
    window.api.send("resizeWindow", [300, 300]);
    $(".loading").css("display", "flex");
});

window.api.receive("galleryView", (data) => {
  $(".splash").hide();
  $(".loading").hide();
  window.api.send("maximizeWindow");
  $(".gallery").css("display", "block");
});

window.api.receive("image", (data) => {
  console.log(data);
  $("#album").append("<img class=\"thumbnail\" src=\"" + data + "\" width=\"120\">");
});
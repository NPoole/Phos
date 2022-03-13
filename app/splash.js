$("#newAlbum").click(function() {
    window.api.send('newAlbum');
  });

window.api.receive("loadingScreen", (data) => {
    console.log(`Received ${data} from main process`);
    $(".splash").hide();
    window.api.send("resizeWindow", [300, 300]);
    $(".loading").css("display", "flex");
});
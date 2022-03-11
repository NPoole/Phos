$("#newAlbum").click(function() {
    window.api.send('openFolder');
  });

window.api.receive("folderName", (data) => {
    console.log(`Received ${data} from main process`);
    $(".splash").hide();
    window.api.send("resizeWindow", [300, 300]);
    $(".loading").css("display", "flex");
});